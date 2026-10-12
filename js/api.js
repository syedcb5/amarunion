/* Amar Union - shared data layer (public site + admin panel).
   LOCAL mode : config.js has no Supabase keys -> data in localStorage (same browser/origin). For testing only.
   CLOUD mode : config.js has Supabase URL + anon key -> real database (see supabase/schema.sql). */
(function(){
'use strict';
const C=window.AU_CONFIG||{},CLOUD=!!(C.supabaseUrl&&C.supabaseKey),LK='au_db';
const IDS=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const PX='data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const DR=()=>{const ed={},ex={},vw={};['set','proj','ppl','cm','news','spn','sch','apps','res','vol','edu'].forEach(m=>{ed[m]=['set','proj','ppl','cm','news','spn','vol','edu'].includes(m)?'edit':'none';ex[m]=['cm','sch','apps','res'].includes(m)?'edit':'none';vw[m]='view'});return[{id:'super',name:'সুপার অ্যাডমিন',perm:'all'},{id:'editor',name:'কনটেন্ট এডিটর',perm:ed},{id:'exam',name:'পরীক্ষা কর্মকর্তা',perm:ex},{id:'viewer',name:'দর্শক (শুধু দেখা)',perm:vw}]};
const SEED=()=>({roles:DR(),seq:0,log:[],apps:[],vol:[],edu:[],
users:[{id:'u1',uid:'superadmin',name:'সুপার অ্যাডমিন (ডেমো)',pass:'Amar@2026',role:'super',on:true},{id:'u2',uid:'editor',name:'কনটেন্ট এডিটর (ডেমো)',pass:'Edit@2026',role:'editor',on:true},{id:'u3',uid:'exam',name:'পরীক্ষা কর্মকর্তা (ডেমো)',pass:'Exam@2026',role:'exam',on:true},{id:'u4',uid:'viewer',name:'দর্শক (ডেমো)',pass:'View@2026',role:'viewer',on:true}],
set:{name:'আমার ইউনিয়ন-দরগাপাশা',tag:'সুশিক্ষায় গড়ুন জাতি, সততায় গড়ুন দেশ, সাম্য-মৈত্রী-ঐক্যে গড়ুন ইউনিয়নের পরিবেশ',phone:'+447984983421',email:'amarunion.org@gmail.com',addr:'দরগাপাশা-৩০০১, শান্তিগঞ্জ, সুনামগঞ্জ',fb:'https://www.facebook.com/amaruniondargapasha',hero:'শিক্ষায় এগিয়ে দরগাপাশা',heroTxt:'শিক্ষা, স্বাস্থ্য, পরিবেশ ও সমাজকল্যাণে সবাই মিলে আমরা গড়ছি একটি সমৃদ্ধ ইউনিয়ন।',notice:'ইউনিয়ন স্কলারশিপ ২০২৬: আবেদন চলছে, শেষ তারিখ ২৫ অক্টোবর।',noticeShow:true},
sch:{open:true,start:'2026-10-11',end:'2026-10-25',exam:'নভেম্বর ২০২৬ (তারিখ ঘোষণা হবে)',center:'শান্তিগঞ্জ উপজেলা (কেন্দ্র নির্ধারণাধীন)',elig:'শান্তিগঞ্জ উপজেলার স্কুলের মেধাবী ছাত্র-ছাত্রী',cls:'পঞ্চম',total:100,pub:false,pz:{gold:10000,g1:5000,g2:3000,g3:1500},ct:{gold:1,g1:5,g2:10,g3:14},med:'উত্তীর্ণ প্রত্যেক শিক্ষার্থীর ১ জন অভিভাবককে বিশেষ সম্মাননা মেডেল দেওয়া হবে।'},
proj:[['স্কলারশিপ বৃত্তি','ইউনিয়ন স্কলারশিপ ২০২৬','প্রাথমিক স্তরের মেধাবী শিক্ষার্থীদের জন্য বৃত্তি পরীক্ষা। সনদ, উপহার ও নগদ পুরস্কার।','চলমান','শান্তিগঞ্জ উপজেলা','শিক্ষার্থীদের পড়ালেখায় মনোযোগ বাড়ানো\nমেধাবীদের সনদ, উপহার ও নগদ পুরস্কারে সম্মান\nঅভিভাবক সম্মাননা মেডেল\nঅনলাইনে রেজিস্ট্রেশন, অ্যাডমিট কার্ড ও ফলাফল'],['শিক্ষা সহায়তা','শিক্ষা সহায়তা তহবিল','পরীক্ষার ফি, বেতন ও শিক্ষা উপকরণে আবেদনের ভিত্তিতে যাচাই করে সহায়তা।','আবেদন চলছে','দরগাপাশা ইউনিয়ন','পরীক্ষার ফরম ও বেতনে সহায়তা\nশিক্ষা উপকরণ কিনে দেওয়া\nযাচাই করে সরাসরি অর্থ প্রদান'],['প্রশিক্ষণ','কারিগরি প্রশিক্ষণ','কম্পিউটার ও ইংরেজি ভাষার বিনামূল্যে প্রশিক্ষণ।','পরিকল্পনাধীন','দরগাপাশা ইউনিয়ন','কম্পিউটার প্রশিক্ষণ\nইংরেজি ভাষা প্রশিক্ষণ'],['স্বাস্থ্য','স্বাস্থ্য সেবা','মেডিকেল ক্যাম্প, চক্ষু শিবির ও অসুস্থদের সহায়তা।','চলমান','দরগাপাশা ইউনিয়ন','মেডিকেল ক্যাম্প ও চক্ষু শিবির\nঅসুস্থদের সহায়তা ও ঔষধ'],['পরিবেশ','বৃক্ষরোপণ ও চারা বিতরণ','পরিবেশ রক্ষায় বৃক্ষরোপণ ও চারা বিতরণ।','চলমান','দরগাপাশা ইউনিয়ন','বৃক্ষরোপণ\nচারা বিতরণ'],['সমাজকল্যাণ','সামাজিক বেষ্টনী','ইয়াতিম ও মিসকিনদের জন্য সহযোগিতা তহবিল।','চলমান','দরগাপাশা ইউনিয়ন','বিভিন্ন ভাতার ব্যবস্থা\nইয়াতিম ও মিসকিনদের তহবিল']].map(p=>({id:IDS()+p[0].length,cat:p[0],title:p[1],desc:p[2],status:p[3],area:p[4],goals:p[5],period:'',show:true})),
ppl:[['সভাপতি (নমুনা)','trustee','সভাপতি'],['সাধারণ সম্পাদক (নমুনা)','trustee','সাধারণ সম্পাদক'],['কোষাধ্যক্ষ (নমুনা)','trustee','কোষাধ্যক্ষ'],['স্বেচ্ছাসেবক (নমুনা ১)','vol','শিক্ষা দল'],['দাতা (নমুনা ১)','donor','শিক্ষা তহবিলে অবদান']].map((p,i)=>({id:'p'+i,name:p[0],type:p[1],role:p[2],bio:'নমুনা প্রোফাইল।',phone:'০১৭XXXXXXXXX',email:'sample@example.com',village:'দরগাপাশা',img:'',show:true})),
cm:[['b','পরীক্ষা নিয়ন্ত্রক (নমুনা)','চেয়ারম্যান, পরীক্ষা বোর্ড'],['b','সদস্য সচিব (নমুনা)','সদস্য সচিব'],['b','প্রশ্ন প্রণয়ন সদস্য (নমুনা)','সদস্য'],['a','প্রধান উপদেষ্টা (নমুনা)','প্রধান উপদেষ্টা'],['a','শিক্ষা উপদেষ্টা (নমুনা)','উপদেষ্টা']].map((m,i)=>({id:'c'+i,grp:m[0],name:m[1],role:m[2],bio:'নমুনা বিবরণ।',img:'',show:true})),
news:[{id:'n1',title:'ইউনিয়ন স্কলারশিপ ২০২৬: আবেদন শুরু',date:'2026-10-11',body:'শান্তিগঞ্জ উপজেলার শিক্ষার্থীদের জন্য অনলাইনে আবেদন চলছে। শেষ তারিখ ২৫ অক্টোবর ২০২৬।',show:true}]});
const seed=demo=>{const d=SEED();d.spn=[{id:'s1',name:'AJ Foundation',img:'',show:true},{id:'s2',name:'Syedshab Foundation',img:'',show:true}];d.proj[0].link='#/scholarship';d.proj[1].link='#/apply/edu';if(demo)demoData(d);return d};
function demoData(d){const N=['আরিফ হোসেন','তানিয়া আক্তার','রাহুল দাস','সুমাইয়া বেগম','ফাহিম আহমেদ','নুসরাত জাহান','জয় চক্রবর্তী','মাহিয়া খাতুন','সাদমান কবির','আয়েশা সিদ্দিকা','অর্ণব সরকার','ইসরাত জাহান'],M=[96,91,88,88,84,79,75,70,66];
N.forEach((n,i)=>{const ap=i<9;d.apps.push({id:IDS(),name:n,father:'পিতা '+n.split(' ')[0],mother:'মাতা',dob:'2015-0'+(i%9+1)+'-10',cls:'পঞ্চম',school:i%2?'দরগাপাশা সরকারি প্রাথমিক বিদ্যালয়':'শান্তিগঞ্জ আদর্শ বিদ্যালয়',village:'দরগাপাশা',mobile:'0171000000'+(i%10),hm:'প্রধান শিক্ষক (নমুনা)',hmp:'01800000000',no:'US26-'+String(++d.seq).padStart(4,'0'),st:ap?'approved':'pending',at:Date.now()-Math.floor(i*1.2*864e5)-i*3600e3,photo:i%5?PX:'',hasbc:i%3!=0,bc:i%3?PX:'',roll:ap?1001+i:undefined,vt:ap?'demo'+i:undefined,marks:ap?M[i]:undefined})});
d.vol.push({id:IDS(),name:'রফিক উদ্দিন',mobile:'01712345678',addr:'দরগাপাশা',skill:'শিক্ষাদান',job:'শিক্ষার্থী',note:'শিক্ষা কার্যক্রমে যুক্ত হতে চাই।',st:'নতুন',at:Date.now()},{id:IDS(),name:'শাহিনা আক্তার',mobile:'01812345678',addr:'শান্তিগঞ্জ',skill:'স্বাস্থ্য সেবা',job:'চাকরিজীবী',note:'',st:'নতুন',at:Date.now()});
d.edu.push({id:IDS(),name:'মিজানুর রহমান',mobile:'01912345678',addr:'দরগাপাশা',school:'দরগাপাশা উচ্চ বিদ্যালয়',type:'শিক্ষা উপকরণ',note:'বই কেনার সহায়তা প্রয়োজন।',st:'নতুন',at:Date.now()})}
const gradeOf=(d,r)=>{let c=0;for(const k of['gold','g1','g2','g3']){c+=+d.sch.ct[k];if(r<=c)return k}return null};
function ranking(d){const a=d.apps.filter(x=>x.roll&&x.marks!==undefined&&x.marks!==null&&x.marks!=='').sort((p,q)=>q.marks-p.marks);let r=0,pv=null;a.forEach((x,i)=>{if(x.marks!==pv){r=i+1;pv=x.marks}x._r=r;x._g=gradeOf(d,r)});return a}
const siteUrl=()=>C.siteUrl||(location.origin+location.pathname.replace(/admin\/(index\.html)?$/,'').replace(/index\.html$/,''));
const norm=s=>String(s==null?'':s).trim();
const closed=d=>!d.sch.open||Date.now()>new Date(d.sch.end+'T23:59:59').getTime();
const pubApp=x=>({no:x.no,name:x.name,father:x.father,mother:x.mother,dob:x.dob,cls:x.cls,school:x.school,village:x.village,mobile:x.mobile,hm:x.hm,hmp:x.hmp,photo:x.photo,hasbc:!!(x.hasbc||x.bc),st:x.st,roll:x.st=='approved'?x.roll:undefined,vt:x.st=='approved'&&x.roll?x.vt:undefined,at:x.at});
/* ---------------- LOCAL driver ---------------- */
const L={mode:'local',
get(){try{const s=localStorage.getItem(LK);if(s)return JSON.parse(s)}catch(e){}const d=seed(true);L.put(d);return d},
put(d){localStorage.setItem(LK,JSON.stringify(d))},
async content(){const d=L.get(),f=a=>a.filter(x=>x.show!==false);return{set:d.set,sch:d.sch,proj:f(d.proj),ppl:f(d.ppl),cm:f(d.cm),news:f(d.news),spn:f(d.spn)}},
async apply(kind,p){const d=L.get();
 if(kind=='scholar'){if(closed(d))throw new Error('closed');if(d.apps.some(x=>x.name==p.name&&x.dob==p.dob&&x.mobile==p.mobile))throw new Error('duplicate');
  const x={name:p.name,father:p.father,mother:p.mother,dob:p.dob,cls:p.cls,school:p.school,village:p.village,mobile:p.mobile,hm:p.hm,hmp:p.hmp,photo:p.photo,bc:p.bc,id:IDS(),no:'US26-'+String(++d.seq).padStart(4,'0'),st:'pending',at:Date.now(),hasbc:!!p.bc};d.apps.push(x);L.put(d);return{no:x.no,at:x.at}}
 if(kind!='vol'&&kind!='edu')throw new Error('invalid');const x={...p,id:IDS(),st:'নতুন',at:Date.now()};d[kind].push(x);L.put(d);return{no:x.id}},
async lookup(no,mobile){const d=L.get(),x=d.apps.find(a=>String(a.no).toUpperCase()==norm(no).toUpperCase()&&String(a.mobile)==norm(mobile));return x?pubApp(x):null},
async result(roll){const d=L.get();if(!d.sch.pub)return{hidden:true};const r=ranking(d).find(x=>String(x.roll)==norm(roll));return r?{name:r.name,roll:r.roll,school:r.school,marks:r.marks,rank:r._r,grade:r._g,total:d.sch.total}:null},
async verify(roll,key){const d=L.get(),x=d.apps.find(a=>String(a.roll)==norm(roll)&&a.st=='approved'&&a.vt&&a.vt==norm(key));return x?{name:x.name,roll:x.roll,cls:x.cls,school:x.school,photo:x.photo,center:d.sch.center,exam:d.sch.exam}:null},
async login(id,pw){const u=L.get().users.find(x=>x.uid==id&&x.pass==pw&&x.on);if(!u)throw new Error('bad');sessionStorage.setItem('au_sess',u.uid);return{id:u.id,uid:u.uid,name:u.name,role:u.role,on:true}},
async session(){const id=sessionStorage.getItem('au_sess');if(!id)return null;const u=L.get().users.find(x=>x.uid==id&&x.on);return u?{id:u.id,uid:u.uid,name:u.name,role:u.role,on:true}:null},
logout(){sessionStorage.removeItem('au_sess')},
async load(){return L.get()},async save(d){L.put(d)},async getBc(x){return x.bc||''},async createUser(){throw new Error('local mode')}};
/* ---------------- CLOUD driver (Supabase REST) ---------------- */
let SNAP={},Q=Promise.resolve();
const tk=()=>sessionStorage.getItem('au_tok');
async function rest(path,o,t){o=o||{};
 const go=async tok=>{const r=await fetch(C.supabaseUrl+path,{...o,headers:{apikey:C.supabaseKey,Authorization:'Bearer '+(tok||C.supabaseKey),'Content-Type':'application/json',...(o.headers||{})}});const x=await r.text();if(!r.ok){let m=x;try{const j=JSON.parse(x);m=j.message||j.msg||j.error_description||x}catch(e){}const er=new Error(m);er.status=r.status;throw er}return x?JSON.parse(x):null};
 try{return await go(t)}catch(e){if(t&&(e.status==401||/JWT/i.test(e.message))&&await refresh())return go(tk());throw e}}
async function refresh(){const rt=sessionStorage.getItem('au_rt');if(!rt)return false;try{const r=await rest('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:rt})});sessionStorage.setItem('au_tok',r.access_token);sessionStorage.setItem('au_rt',r.refresh_token);return true}catch(e){return false}}
const rpc=(fn,a)=>rest('/rest/v1/rpc/'+fn,{method:'POST',body:JSON.stringify(a||{})},tk());
const ARR=['apps','vol','edu','proj','ppl','cm','news','spn','roles','log'],ser=x=>JSON.stringify(x,(k,v)=>k[0]=='_'?undefined:v);
async function push(d){const t=tk(),up=[],del=[],seen={};
 const add=(coll,id,obj)=>{const key=coll+'|'+id,s=ser(obj);seen[key]=1;if(SNAP[key]!==s)up.push({coll,id,s,key})};
 ARR.forEach(k=>(d[k]||[]).forEach(x=>{if(!x.id)x.id=IDS();add(k,x.id,x)}));['set','sch'].forEach(k=>add(k,'main',d[k]));
 for(const key in SNAP)if(!seen[key]&&!key.startsWith('u|')&&!(d.users||[]).some(u=>'u|'+u.id==key))del.push(key);
 for(let i=0;i<up.length;i+=100){const b=up.slice(i,i+100);await rest('/rest/v1/docs?on_conflict=coll,id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:'['+b.map(u=>JSON.stringify({coll:u.coll,id:String(u.id),data:JSON.parse(u.s)})).join(',')+']'},t);b.forEach(u=>{SNAP[u.key]=u.s})}
 for(const key of del){if(key.startsWith('u|'))continue;const p=key.indexOf('|');await rest('/rest/v1/docs?coll=eq.'+encodeURIComponent(key.slice(0,p))+'&id=eq.'+encodeURIComponent(key.slice(p+1)),{method:'DELETE'},t);delete SNAP[key]}
 const uk={};(d.users||[]).forEach(u=>{const key='u|'+u.id,s=ser({uid:u.uid,name:u.name,role:u.role,on:u.on});uk[key]=1;if(SNAP[key]!==s){SNAP[key]=s;uk[key]=u}});
 for(const key in uk)if(uk[key]!==1)await rest('/rest/v1/profiles?on_conflict=user_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:uk[key].id,uid:uk[key].uid,name:uk[key].name,role:uk[key].role,active:!!uk[key].on})},t);
 for(const key in SNAP)if(key.startsWith('u|')&&!uk[key]){const id=key.slice(2);await rest('/rest/v1/profiles?user_id=eq.'+encodeURIComponent(id),{method:'DELETE'},t);delete SNAP[key]}}
const K={mode:'cloud',
content:()=>rpc('public_content'),
apply:(kind,p)=>rpc('submit_application',{kind,payload:p}),
lookup:(no,mobile)=>rpc('get_application',{p_no:norm(no),p_mobile:norm(mobile)}),
result:roll=>rpc('get_result',{p_roll:norm(roll)}),
verify:(roll,key)=>rpc('verify_roll',{p_roll:norm(roll),p_key:norm(key)}),
async profile(){const id=sessionStorage.getItem('au_uid'),t=tk();if(!t)return null;const r=await rest('/rest/v1/profiles?user_id=eq.'+encodeURIComponent(id)+'&select=*',{},t);return r&&r[0]&&r[0].active?{id:r[0].user_id,uid:r[0].uid,name:r[0].name,role:r[0].role,on:true}:null},
async login(id,pw){const r=await rest('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email:id,password:pw})});sessionStorage.setItem('au_tok',r.access_token);sessionStorage.setItem('au_rt',r.refresh_token);sessionStorage.setItem('au_uid',r.user.id);const p=await K.profile();if(!p){K.logout();throw new Error('no profile')}return p},
async session(){if(!tk())return null;try{return await K.profile()}catch(e){return null}},
logout(){['au_tok','au_rt','au_uid'].forEach(k=>sessionStorage.removeItem(k))},
async load(){const t=tk(),rows=[];for(let o=0;;o+=1000){const r=await rest('/rest/v1/docs?select=coll,id,data&order=coll.asc,id.asc',{headers:{Range:o+'-'+(o+999)}},t);rows.push(...r);if(r.length<1000)break}
 const d=seed(false);ARR.forEach(k=>{d[k]=[]});
 rows.forEach(x=>{if(x.coll=='set'||x.coll=='sch')d[x.coll]=x.data;else if(d[x.coll])d[x.coll].push(x.data)});
 d.log.sort((a,b)=>b.t-a.t);const pr=await rest('/rest/v1/profiles?select=*',{},t);d.users=pr.map(p=>({id:p.user_id,uid:p.uid,name:p.name,role:p.role,on:p.active}));
 if(!d.roles.length)d.roles=DR();
 SNAP={};ARR.forEach(k=>d[k].forEach(x=>{SNAP[k+'|'+x.id]=ser(x)}));['set','sch'].forEach(k=>{if(rows.some(r=>r.coll==k))SNAP[k+'|main']=ser(d[k])});d.users.forEach(u=>{SNAP['u|'+u.id]=ser({uid:u.uid,name:u.name,role:u.role,on:u.on})});return d},
save(d){const p=Q.catch(()=>{}).then(()=>push(d));Q=p;return p},
async getBc(x){const r=await rest('/rest/v1/docs?coll=eq.bc&id=eq.'+encodeURIComponent(x.id)+'&select=data',{},tk());return r&&r[0]?r[0].data.img:''},
async createUser(email,pw,name,role){const r=await rest('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password:pw})});const id=r.id||(r.user&&r.user.id);if(!id)throw new Error('Signup failed - check Supabase Auth settings');await rest('/rest/v1/profiles',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({user_id:id,uid:email,name,role,active:true})},tk());SNAP['u|'+id]=ser({uid:email,name,role,on:true});return id}};
const API=CLOUD?K:L;API.SEED=seed;API.DR=DR;API.demo=demoData;API.siteUrl=siteUrl;API.IDS=IDS;API.PX=PX;API.ranking=ranking;window.API=API;
})();
