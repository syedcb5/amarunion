<?php
/* Amar Union - SQLite backend for the SERVER driver in js/api.js (config.js: api:'api.php').
   Needs only PHP 7.4+ with pdo_sqlite (bundled with PHP). No other dependency.
   Mirrors the rules of supabase/schema.sql: public calls expose only what is safe, admin writes are checked here. */
$DB_FILE=getenv('AU_DB')?:__DIR__.'/data/amarunion.sqlite';
header('Content-Type: application/json; charset=utf-8');header('Cache-Control: no-store');header('X-Content-Type-Options: nosniff');

function out($v){echo json_encode($v,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
class Fail extends Exception{}
function fail($k,$code=400){throw new Fail($k,$code);}
function db(){static $p=null;global $DB_FILE;if($p)return $p;$d=dirname($DB_FILE);if(!is_dir($d))mkdir($d,0750,true);
 $p=new PDO('sqlite:'.$DB_FILE,null,null,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
 $p->exec("pragma busy_timeout=5000;pragma journal_mode=wal;
 create table if not exists docs(coll text not null,id text not null,data text not null,no text,roll text,mob text,dup text,marks real,own text,updated_at integer not null,primary key(coll,id));
 create index if not exists docs_no on docs(coll,no);create index if not exists docs_roll on docs(coll,roll);create index if not exists docs_dup on docs(coll,dup);create index if not exists docs_own on docs(coll,own);
 create table if not exists users(id text primary key,uid text not null unique,name text not null,role text not null default 'viewer',active integer not null default 1,pass text not null);
 create table if not exists sess(tok text primary key,user text not null,exp integer not null);
 create table if not exists meta(k text primary key,v text);
 create table if not exists fails(k text primary key,n integer not null,t integer not null);");
 return $p;}
function q($sql,$a=[]){$s=db()->prepare($sql);$s->execute($a);return $s;}
function now_ms(){return (int)round(microtime(true)*1000);}
function rid(){return bin2hex(random_bytes(16));}
function cut($s,$n){if($s===null)return null;$s=(string)$s;if(function_exists('mb_substr'))return mb_substr($s,0,$n,'UTF-8');preg_match('/^.{0,'.$n.'}/su',$s,$m);return $m?$m[0]:'';}
function fv($o,$k){return is_object($o)&&isset($o->$k)&&is_scalar($o->$k)?(is_bool($o->$k)?($o->$k?'true':'false'):(string)$o->$k):null;}
function strip($a){return array_filter($a,function($v){return $v!==null;});}
function enc($v){return json_encode($v,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);}
function rawdoc($c,$id){$r=q('select data from docs where coll=? and id=?',[$c,$id])->fetchColumn();return $r===false?null:$r;}
function doc($c,$id){$r=rawdoc($c,$id);return $r===null?null:json_decode($r);}
/* index columns used for lookups (no JSON1 needed) */
function put($c,$id,$d,$insertOnly=false){
 $no=$roll=$mob=$dup=$marks=$own=null;
 if($c=='apps'){$no=fv($d,'no');$roll=fv($d,'roll');if($roll==='')$roll=null;$mob=fv($d,'mobile');$dup=enc([fv($d,'name'),fv($d,'dob'),$mob]);$m=isset($d->marks)?$d->marks:null;$marks=is_numeric($m)?(float)$m:null;}
 if($c=='log')$own=fv($d,'u');
 $a=[$c,(string)$id,enc($d),$no,$roll,$mob,$dup,$marks,$own,time()];
 if($insertOnly)return q('insert or ignore into docs(coll,id,data,no,roll,mob,dup,marks,own,updated_at) values(?,?,?,?,?,?,?,?,?,?)',$a);
 q('insert into docs(coll,id,data,no,roll,mob,dup,marks,own,updated_at) values(?,?,?,?,?,?,?,?,?,?) on conflict(coll,id) do update set data=excluded.data,no=excluded.no,roll=excluded.roll,mob=excluded.mob,dup=excluded.dup,marks=excluded.marks,own=excluded.own,updated_at=excluded.updated_at',$a);}

/* ---------- permissions (same model as perm/can_view/can_edit in schema.sql) ---------- */
function me(){static $u=false;if($u!==false)return $u;$u=null;$t=isset($_SERVER['HTTP_X_AUTH_TOKEN'])?$_SERVER['HTTP_X_AUTH_TOKEN']:'';if(strlen($t)<32)return null;
 $r=q('select u.id,u.uid,u.name,u.role from sess s join users u on u.id=s.user where s.tok=? and s.exp>? and u.active=1',[hash('sha256',$t),time()])->fetch();$u=$r?:null;return $u;}
function need(){$u=me();if(!$u)fail('bad',401);return $u;}
function perm($m){$u=me();if(!$u)return 'none';if($u['role']==='super')return 'edit';$r=doc('roles',$u['role']);if(!$r||!isset($r->perm)||!is_object($r->perm))return 'none';$v=fv($r->perm,$m);return $v?:'none';}
function can_view($c){$u=me();if(!$u)return false;
 if($c=='apps')return perm('apps')!='none'||perm('res')!='none';if($c=='bc')return perm('apps')!='none';
 if(in_array($c,['roles','set','sch','spn']))return true;if($c=='log')return $u['role']==='super';return perm($c)!='none';}
function can_edit($c){$u=me();if(!$u)return false;
 if($c=='apps')return perm('apps')=='edit'||perm('res')=='edit';if($c=='sch')return perm('sch')=='edit'||perm('res')=='edit';
 if($c=='bc')return false;if($c=='roles')return $u['role']==='super';if($c=='log')return true;return perm($c)=='edit';}
const COLLS=['set','sch','proj','ppl','cm','news','spn','apps','vol','edu','roles','log'];
function pubUser($u){return ['id'=>$u['id'],'uid'=>$u['uid'],'name'=>$u['name'],'role'=>$u['role'],'on'=>true];}

/* ---------- public calls ---------- */
function shown($c){$a=[];foreach(q('select data from docs where coll=? order by rowid',[$c])->fetchAll(PDO::FETCH_COLUMN) as $d){$o=json_decode($d);if(!isset($o->show)||$o->show!==false)$a[]=$d;}return '['.implode(',',$a).']';}
function a_content(){echo '{"set":'.(rawdoc('set','main')?:'{}').',"sch":'.(rawdoc('sch','main')?:'{}');foreach(['proj','ppl','cm','news','spn'] as $c)echo ',"'.$c.'":'.shown($c);echo '}';exit;}
const IMG='/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+\/=]+$/';
function a_apply($in){$kind=fv($in,'kind');$p=isset($in->payload)?$in->payload:null;if(!is_object($p)||strlen(enc($p))>600000)fail('invalid');
 $mob=fv($p,'mobile');
 if($kind=='scholar'){
  db()->exec('begin immediate');
  try{$s=doc('sch','main');if(!$s||empty($s->open)||time()>strtotime(fv($s,'end').'T23:59:59+06:00'))fail('closed');
   $photo=fv($p,'photo');$bc=(string)fv($p,'bc');
   if(!fv($p,'name')||!fv($p,'father')||!preg_match('/^01[0-9]{9}$/',(string)$mob)||!$photo||!preg_match(IMG,$photo)||($bc!==''&&$bc!=='PDF'&&!preg_match(IMG,$bc)))fail('invalid');
   if(q('select 1 from docs where coll=? and dup=?',['apps',enc([fv($p,'name'),fv($p,'dob'),$mob])])->fetchColumn())fail('duplicate');
   q("insert or ignore into meta(k,v) values('seq','0')");q("update meta set v=cast(v as integer)+1 where k='seq'");$n='US26-'.str_pad((string)q("select v from meta where k='seq'")->fetchColumn(),4,'0',STR_PAD_LEFT);
   $id=rid();$d=(object)strip(['id'=>$id,'no'=>$n,'st'=>'pending','at'=>now_ms(),'hasbc'=>$bc!=='','name'=>cut(fv($p,'name'),120),'father'=>cut(fv($p,'father'),120),'mother'=>cut(fv($p,'mother'),120),'dob'=>cut(fv($p,'dob'),20),'cls'=>cut(fv($p,'cls'),30),
    'school'=>cut(fv($p,'school'),200),'village'=>cut(fv($p,'village'),120),'mobile'=>$mob,'hm'=>cut(fv($p,'hm'),120),'hmp'=>cut(fv($p,'hmp'),20),'photo'=>$photo]);
   put('apps',$id,$d);if($bc!=='')put('bc',$id,(object)['img'=>$bc]);db()->exec('commit');}catch(Exception $e){db()->exec('rollback');throw $e;}
  out(['no'=>$n,'at'=>$d->at]);}
 if($kind=='vol'||$kind=='edu'){if(!fv($p,'name')||!preg_match('/^01[0-9]{9}$/',(string)$mob))fail('invalid');$id=rid();
  put($kind,$id,(object)strip(['id'=>$id,'st'=>'নতুন','at'=>now_ms(),'name'=>cut(fv($p,'name'),120),'mobile'=>$mob,'addr'=>cut(fv($p,'addr'),200),'skill'=>cut(fv($p,'skill'),200),'job'=>cut(fv($p,'job'),60),'school'=>cut(fv($p,'school'),200),'type'=>cut(fv($p,'type'),60),'note'=>cut(fv($p,'note'),2000)]));out(['no'=>$id]);}
 fail('invalid');}
function a_lookup($in){$r=q('select data from docs where coll=? and upper(no)=upper(?) and mob=? limit 1',['apps',trim((string)fv($in,'no')),trim((string)fv($in,'mobile'))])->fetchColumn();if($r===false)out(null);$x=json_decode($r);$ap=fv($x,'st')==='approved';
 $o=[];foreach(['no','name','father','mother','dob','cls','school','village','mobile','hm','hmp','photo','hasbc','st','at'] as $k)if(isset($x->$k))$o[$k]=$x->$k;
 if($ap&&isset($x->roll))$o['roll']=$x->roll;if($ap&&isset($x->roll)&&isset($x->vt))$o['vt']=$x->vt;out($o);}
function a_result($in){$s=doc('sch','main');if(!$s||empty($s->pub))out(['hidden'=>true]);
 $r=q('select data,marks from docs where coll=? and roll=? and marks is not null limit 1',['apps',trim((string)fv($in,'roll'))])->fetch();if(!$r)out(null);$x=json_decode($r['data']);
 $rk=1+(int)q('select count(*) from docs where coll=? and roll is not null and marks is not null and marks>?',['apps',$r['marks']])->fetchColumn();
 $g=null;$c=0;foreach(['gold','g1','g2','g3'] as $k){$c+=isset($s->ct->$k)?(int)$s->ct->$k:0;if($rk<=$c){$g=$k;break;}}
 out(['name'=>$x->name,'roll'=>$x->roll,'school'=>isset($x->school)?$x->school:null,'marks'=>$x->marks,'rank'=>$rk,'grade'=>$g,'total'=>isset($s->total)?$s->total:null]);}
function a_verify($in){$key=trim((string)fv($in,'key'));if($key==='')out(null);$s=doc('sch','main');
 foreach(q('select data from docs where coll=? and roll=?',['apps',trim((string)fv($in,'roll'))])->fetchAll(PDO::FETCH_COLUMN) as $r){$x=json_decode($r);
  if(fv($x,'st')==='approved'&&fv($x,'vt')!==null&&hash_equals((string)fv($x,'vt'),$key))out(['name'=>$x->name,'roll'=>$x->roll,'cls'=>isset($x->cls)?$x->cls:null,'school'=>isset($x->school)?$x->school:null,'photo'=>isset($x->photo)?$x->photo:null,'center'=>$s?fv($s,'center'):null,'exam'=>$s?fv($s,'exam'):null]);}
 out(null);}

/* ---------- accounts ---------- */
function a_setup($in){$uid=trim((string)fv($in,'uid'));$pw=(string)fv($in,'pass');$name=trim((string)fv($in,'name'));if($uid===''||$name===''||strlen($pw)<8)fail('invalid');
 db()->exec('begin immediate');try{if(q('select count(*) from users')->fetchColumn())fail('bad',403);
  q('insert into users(id,uid,name,role,active,pass) values(?,?,?,?,1,?)',[rid(),$uid,cut($name,120),'super',password_hash($pw,PASSWORD_DEFAULT)]);
  $sd=isset($in->seed)?$in->seed:null;if(is_object($sd)){if(isset($sd->roles)&&is_array($sd->roles))foreach($sd->roles as $r)if(is_object($r)&&fv($r,'id'))put('roles',fv($r,'id'),$r,true);foreach(['set','sch'] as $k)if(isset($sd->$k)&&is_object($sd->$k))put($k,'main',$sd->$k,true);}
  db()->exec('commit');}catch(Exception $e){db()->exec('rollback');throw $e;}out(true);}
function a_login($in){$uid=trim((string)fv($in,'uid'));$pw=(string)fv($in,'pass');$k=hash('sha256',(isset($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'').'|'.strtolower($uid));
 $f=q('select n,t from fails where k=?',[$k])->fetch();if($f&&$f['n']>=5&&$f['t']>time()-900)fail('bad',429);
 $u=q('select * from users where uid=? and active=1',[$uid])->fetch();
 if(!$u||!password_verify($pw,$u['pass'])){q('insert into fails(k,n,t) values(?,1,?) on conflict(k) do update set n=case when fails.t>? then fails.n+1 else 1 end,t=excluded.t',[$k,time(),time()-900]);fail('bad',401);}
 q('delete from fails where k=?',[$k]);q('delete from sess where exp<?',[time()]);$t=bin2hex(random_bytes(32));q('insert into sess(tok,user,exp) values(?,?,?)',[hash('sha256',$t),$u['id'],time()+12*3600]);
 out(['token'=>$t,'user'=>pubUser($u)]);}
function setPass($id,$pw){if(strlen($pw)<8)fail('invalid');q('update users set pass=? where id=?',[password_hash($pw,PASSWORD_DEFAULT),$id]);q('delete from sess where user=? and tok<>?',[$id,hash('sha256',isset($_SERVER['HTTP_X_AUTH_TOKEN'])?$_SERVER['HTTP_X_AUTH_TOKEN']:'')]);}
function a_create_user($in){$u=need();if($u['role']!=='super')fail('denied',403);$uid=trim((string)fv($in,'uid'));$pw=(string)fv($in,'pass');if($uid===''||strlen($pw)<8)fail('invalid');
 if(q('select 1 from users where uid=?',[$uid])->fetchColumn())fail('duplicate');$id=rid();
 q('insert into users(id,uid,name,role,active,pass) values(?,?,?,?,1,?)',[$id,$uid,cut((string)fv($in,'name'),120),(string)fv($in,'role'),password_hash($pw,PASSWORD_DEFAULT)]);out($id);}

/* ---------- admin data ---------- */
function a_load(){$u=need();$v=[];$rows=[];
 foreach(q("select coll,id,data from docs where coll not in ('bc','log') order by coll,rowid")->fetchAll() as $r){if(!isset($v[$r['coll']]))$v[$r['coll']]=can_view($r['coll']);if($v[$r['coll']])$rows[]=$r;}
 $lg=$u['role']==='super'?q("select coll,id,data from docs where coll='log' order by rowid desc limit 200"):q("select coll,id,data from docs where coll='log' and own=? order by rowid desc limit 200",[$u['uid']]);
 $rows=array_merge($rows,$lg->fetchAll());
 $us=$u['role']==='super'?q('select id,uid,name,role,active from users order by rowid')->fetchAll():q('select id,uid,name,role,active from users where id=?',[$u['id']])->fetchAll();
 echo '{"docs":['.implode(',',array_map(function($r){return '{"c":'.enc($r['coll']).',"i":'.enc($r['id']).',"d":'.$r['data'].'}';},$rows)).'],"users":'.enc(array_map(function($x){return ['id'=>$x['id'],'uid'=>$x['uid'],'name'=>$x['name'],'role'=>$x['role'],'on'=>(bool)$x['active']];},$us)).'}';exit;}
function a_save($in){$u=need();$su=$u['role']==='super';
 $up=isset($in->up)&&is_array($in->up)?$in->up:[];$del=isset($in->del)&&is_array($in->del)?$in->del:[];$uup=isset($in->uup)&&is_array($in->uup)?$in->uup:[];$udel=isset($in->udel)&&is_array($in->udel)?$in->udel:[];
 if(($uup||$udel)&&!$su)fail('denied',403);
 db()->exec('begin immediate');try{
  foreach($up as $r){$c=fv($r,'coll');$id=fv($r,'id');$d=isset($r->data)?$r->data:null;if(!in_array($c,COLLS,true)||$id===null||$id===''||!is_object($d))fail('invalid');
   if($c=='log'){$d->u=$u['uid'];put('log',$id,$d,true);continue;}if(!can_edit($c))fail('denied',403);put($c,$id,$d);}
  foreach($del as $r){$c=fv($r,'coll');if(!in_array($c,COLLS,true)||$c=='log'||!can_edit($c))fail('denied',403);q('delete from docs where coll=? and id=?',[$c,(string)fv($r,'id')]);if($c=='apps')q("delete from docs where coll='bc' and id=?",[(string)fv($r,'id')]);}
  foreach($uup as $x){$id=(string)fv($x,'id');$uid=trim((string)fv($x,'uid'));$on=!empty($x->on);$role=(string)fv($x,'role');if($id===''||$uid==='')fail('invalid');
   if($id===$u['id']&&(!$on||$role!=='super'))fail('denied',403);
   if(q('select 1 from users where uid=? and id<>?',[$uid,$id])->fetchColumn())fail('duplicate');
   if(q('select 1 from users where id=?',[$id])->fetchColumn())q('update users set uid=?,name=?,role=?,active=? where id=?',[$uid,cut((string)fv($x,'name'),120),$role,$on?1:0,$id]);
   else{if(strlen((string)fv($x,'pass'))<8)fail('invalid');q('insert into users(id,uid,name,role,active,pass) values(?,?,?,?,?,?)',[$id,$uid,cut((string)fv($x,'name'),120),$role,$on?1:0,'']);}
   if((string)fv($x,'pass')!=='')setPass($id,(string)fv($x,'pass'));if(!$on)q('delete from sess where user=?',[$id]);}
  foreach($udel as $id){$id=(string)$id;if($id===$u['id'])fail('denied',403);q('delete from sess where user=?',[$id]);q('delete from users where id=?',[$id]);}
  db()->exec('commit');}catch(Exception $e){db()->exec('rollback');throw $e;}out(true);}
function a_bc($in){need();if(!can_view('bc'))fail('denied',403);$d=doc('bc',(string)fv($in,'id'));out($d&&isset($d->img)?$d->img:'');}

/* ---------- dispatch ---------- */
try{
 if($_SERVER['REQUEST_METHOD']!=='POST')fail('invalid',405);
 $body=file_get_contents('php://input');if(strlen($body)>8000000)fail('invalid',413);$in=json_decode($body);if(!is_object($in))fail('invalid');
 switch(fv($in,'a')){
  case 'content':a_content();case 'apply':a_apply($in);case 'lookup':a_lookup($in);case 'result':a_result($in);case 'verify':a_verify($in);
  case 'setup_needed':out(!q('select count(*) from users')->fetchColumn());case 'setup':a_setup($in);case 'login':a_login($in);
  case 'me':out(me()?pubUser(me()):null);case 'logout':if(me())q('delete from sess where tok=?',[hash('sha256',$_SERVER['HTTP_X_AUTH_TOKEN'])]);out(true);
  case 'load':a_load();case 'save':a_save($in);case 'bc':a_bc($in);case 'create_user':a_create_user($in);
 }
 fail('invalid');
}catch(Fail $e){http_response_code($e->getCode());out(['error'=>$e->getMessage()]);}
catch(PDOException $e){http_response_code(500);error_log('amarunion: '.$e->getMessage());out(['error'=>strpos($e->getMessage(),'UNIQUE')!==false?'duplicate':'server']);}
catch(Throwable $e){http_response_code(500);error_log('amarunion: '.$e->getMessage());out(['error'=>'server']);}
