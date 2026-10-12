-- =====================================================================
-- Amar Union - Supabase schema (run once in Supabase > SQL Editor)
-- Generic document store + row level security + public RPC functions.
-- Collections (docs.coll): set, sch, proj, ppl, cm, news, spn, apps, bc, vol, edu, roles, log
-- =====================================================================
create extension if not exists pgcrypto;

create table if not exists public.docs(
  coll text not null, id text not null, data jsonb not null,
  updated_at timestamptz not null default now(), primary key(coll,id));
create index if not exists docs_app_no   on public.docs((data->>'no'))   where coll='apps';
create index if not exists docs_app_roll on public.docs((data->>'roll')) where coll='apps';

create table if not exists public.profiles(
  user_id uuid primary key references auth.users(id) on delete cascade,
  uid text not null, name text not null, role text not null default 'viewer', active boolean not null default true);

create sequence if not exists public.app_seq start 1;

alter table public.docs enable row level security;
alter table public.profiles enable row level security;
revoke all on public.docs, public.profiles from anon;
grant select,insert,update,delete on public.docs, public.profiles to authenticated;

-- ---------- permission helpers ----------
create or replace function public.my_role() returns text language sql stable security definer set search_path=public as $$
  select role from public.profiles where user_id=auth.uid() and active $$;

create or replace function public.perm(m text) returns text language plpgsql stable security definer set search_path=public as $$
declare r jsonb; rl text:=public.my_role();
begin
  if rl is null then return 'none'; end if;
  if rl='super' then return 'edit'; end if;
  select data into r from public.docs where coll='roles' and id=rl;
  if r is null then return 'none'; end if;
  return coalesce(r->'perm'->>m,'none');
end $$;

create or replace function public.can_view(c text) returns boolean language sql stable security definer set search_path=public as $$
  select case c
    when 'apps'  then public.perm('apps')<>'none' or public.perm('res')<>'none'
    when 'bc'    then public.perm('apps')<>'none'
    when 'roles' then public.my_role() is not null
    when 'log'   then public.my_role()='super'
    else public.perm(c)<>'none' end $$;

create or replace function public.can_edit(c text) returns boolean language sql stable security definer set search_path=public as $$
  select case c
    when 'apps'  then public.perm('apps')='edit' or public.perm('res')='edit'
    when 'sch'   then public.perm('sch')='edit'  or public.perm('res')='edit'
    when 'bc'    then false
    when 'roles' then public.my_role()='super'
    when 'log'   then public.my_role() is not null
    else public.perm(c)='edit' end $$;

drop policy if exists docs_select on public.docs;
create policy docs_select on public.docs for select to authenticated using (public.can_view(coll));
drop policy if exists docs_insert on public.docs;
create policy docs_insert on public.docs for insert to authenticated with check (public.can_edit(coll));
drop policy if exists docs_update on public.docs;
create policy docs_update on public.docs for update to authenticated using (public.can_edit(coll)) with check (public.can_edit(coll));
drop policy if exists docs_delete on public.docs;
create policy docs_delete on public.docs for delete to authenticated using (public.can_edit(coll) and coll<>'log');

drop policy if exists prof_select on public.profiles;
create policy prof_select on public.profiles for select to authenticated using (user_id=auth.uid() or public.my_role()='super');
drop policy if exists prof_write on public.profiles;
create policy prof_write on public.profiles for all    to authenticated using (public.my_role()='super') with check (public.my_role()='super');

-- ---------- public RPC functions (anon may call; they expose only what is safe) ----------
create or replace function public.public_content() returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'set',  coalesce((select data from docs where coll='set' and id='main'),'{}'::jsonb),
    'sch',  coalesce((select data from docs where coll='sch' and id='main'),'{}'::jsonb),
    'proj', coalesce((select jsonb_agg(data order by id) from docs where coll='proj' and coalesce((data->>'show')::boolean,true)),'[]'::jsonb),
    'ppl',  coalesce((select jsonb_agg(data order by id) from docs where coll='ppl'  and coalesce((data->>'show')::boolean,true)),'[]'::jsonb),
    'cm',   coalesce((select jsonb_agg(data order by id) from docs where coll='cm'   and coalesce((data->>'show')::boolean,true)),'[]'::jsonb),
    'news', coalesce((select jsonb_agg(data order by id) from docs where coll='news' and coalesce((data->>'show')::boolean,true)),'[]'::jsonb),
    'spn',  coalesce((select jsonb_agg(data order by id) from docs where coll='spn'  and coalesce((data->>'show')::boolean,true)),'[]'::jsonb)) $$;

create or replace function public.submit_application(kind text, payload jsonb) returns jsonb language plpgsql security definer set search_path=public as $$
declare s jsonb; n text; did text; d jsonb; bc text;
begin
  if length(payload::text)>600000 then raise exception 'invalid'; end if;
  if kind='scholar' then
    select data into s from docs where coll='sch' and id='main';
    if s is null or not coalesce((s->>'open')::boolean,false) or now()>((s->>'end')||'T23:59:59+06')::timestamptz then raise exception 'closed'; end if;
    if coalesce(payload->>'name','')='' or coalesce(payload->>'father','')='' or (payload->>'mobile') !~ '^01[0-9]{9}$' or coalesce(payload->>'photo','')='' then raise exception 'invalid'; end if;
    if exists(select 1 from docs where coll='apps' and data->>'name'=payload->>'name' and data->>'dob'=payload->>'dob' and data->>'mobile'=payload->>'mobile') then raise exception 'duplicate'; end if;
    n:='US26-'||lpad(nextval('public.app_seq')::text,4,'0'); did:=gen_random_uuid()::text; bc:=coalesce(payload->>'bc','');
    d:=jsonb_strip_nulls(jsonb_build_object('id',did,'no',n,'st','pending','at',(extract(epoch from now())*1000)::bigint,'hasbc',bc<>'',
      'name',left(payload->>'name',120),'father',left(payload->>'father',120),'mother',left(payload->>'mother',120),'dob',left(payload->>'dob',20),'cls',left(payload->>'cls',30),
      'school',left(payload->>'school',200),'village',left(payload->>'village',120),'mobile',payload->>'mobile','hm',left(payload->>'hm',120),'hmp',left(payload->>'hmp',20),'photo',payload->>'photo'));
    insert into docs(coll,id,data) values('apps',did,d);
    if bc<>'' then insert into docs(coll,id,data) values('bc',did,jsonb_build_object('img',bc)); end if;
    return jsonb_build_object('no',n,'at',d->'at');
  elsif kind in ('vol','edu') then
    if coalesce(payload->>'name','')='' or (payload->>'mobile') !~ '^01[0-9]{9}$' then raise exception 'invalid'; end if;
    did:=gen_random_uuid()::text;
    d:=jsonb_strip_nulls(jsonb_build_object('id',did,'st','নতুন','at',(extract(epoch from now())*1000)::bigint,
      'name',left(payload->>'name',120),'mobile',payload->>'mobile','addr',left(payload->>'addr',200),'skill',left(payload->>'skill',200),'job',left(payload->>'job',60),
      'school',left(payload->>'school',200),'type',left(payload->>'type',60),'note',left(payload->>'note',2000)));
    insert into docs(coll,id,data) values(kind,did,d);
    return jsonb_build_object('no',did);
  end if;
  raise exception 'invalid';
end $$;

create or replace function public.get_application(p_no text, p_mobile text) returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_strip_nulls(jsonb_build_object('no',data->>'no','name',data->>'name','father',data->>'father','mother',data->>'mother','dob',data->>'dob','cls',data->>'cls',
    'school',data->>'school','village',data->>'village','mobile',data->>'mobile','hm',data->>'hm','hmp',data->>'hmp','photo',data->>'photo','hasbc',data->'hasbc','st',data->>'st','at',data->'at',
    'roll',case when data->>'st'='approved' then data->>'roll' end,'vt',case when data->>'st'='approved' and data ? 'roll' then data->>'vt' end))
  from docs where coll='apps' and upper(data->>'no')=upper(trim(p_no)) and data->>'mobile'=trim(p_mobile) limit 1 $$;

create or replace function public.get_result(p_roll text) returns jsonb language plpgsql stable security definer set search_path=public as $$
declare s jsonb; res jsonb; g int; g1 int; g2 int; g3 int;
begin
  select data into s from docs where coll='sch' and id='main';
  if s is null or not coalesce((s->>'pub')::boolean,false) then return jsonb_build_object('hidden',true); end if;
  g:=coalesce((s#>>'{ct,gold}')::int,0); g1:=g+coalesce((s#>>'{ct,g1}')::int,0); g2:=g1+coalesce((s#>>'{ct,g2}')::int,0); g3:=g2+coalesce((s#>>'{ct,g3}')::int,0);
  with a as (select data, (data->>'marks')::numeric m from docs where coll='apps' and data ? 'roll' and coalesce(data->>'marks','')<>''),
       r as (select data,m,rank() over(order by m desc) rk from a)
  select jsonb_build_object('name',data->>'name','roll',data->>'roll','school',data->>'school','marks',m,'rank',rk,'total',s->'total',
    'grade',case when rk<=g then 'gold' when rk<=g1 then 'g1' when rk<=g2 then 'g2' when rk<=g3 then 'g3' end)
  into res from r where data->>'roll'=trim(p_roll) limit 1;
  return res;
end $$;

create or replace function public.verify_roll(p_roll text, p_key text) returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('name',a.data->>'name','roll',a.data->>'roll','cls',a.data->>'cls','school',a.data->>'school','photo',a.data->>'photo',
    'center',(select data->>'center' from docs where coll='sch' and id='main'),'exam',(select data->>'exam' from docs where coll='sch' and id='main'))
  from docs a where a.coll='apps' and a.data->>'roll'=trim(p_roll) and a.data->>'st'='approved' and coalesce(a.data->>'vt','')<>'' and a.data->>'vt'=trim(p_key) limit 1 $$;

grant execute on function public.public_content(), public.get_application(text,text), public.get_result(text), public.verify_roll(text,text), public.submit_application(text,jsonb) to anon, authenticated;

-- ---------- default data (roles, site settings, scholarship settings) ----------
insert into public.docs(coll,id,data) values('roles','super','{"id": "super", "name": "সুপার অ্যাডমিন", "perm": "all"}'::jsonb) on conflict(coll,id) do nothing;
insert into public.docs(coll,id,data) values('roles','editor','{"id": "editor", "name": "কনটেন্ট এডিটর", "perm": {"set": "edit", "proj": "edit", "ppl": "edit", "cm": "edit", "news": "edit", "spn": "edit", "sch": "none", "apps": "none", "res": "none", "vol": "edit", "edu": "edit"}}'::jsonb) on conflict(coll,id) do nothing;
insert into public.docs(coll,id,data) values('roles','exam','{"id": "exam", "name": "পরীক্ষা কর্মকর্তা", "perm": {"set": "none", "proj": "none", "ppl": "none", "cm": "edit", "news": "none", "spn": "none", "sch": "edit", "apps": "edit", "res": "edit", "vol": "none", "edu": "none"}}'::jsonb) on conflict(coll,id) do nothing;
insert into public.docs(coll,id,data) values('roles','viewer','{"id": "viewer", "name": "দর্শক (শুধু দেখা)", "perm": {"set": "view", "proj": "view", "ppl": "view", "cm": "view", "news": "view", "spn": "view", "sch": "view", "apps": "view", "res": "view", "vol": "view", "edu": "view"}}'::jsonb) on conflict(coll,id) do nothing;
insert into public.docs(coll,id,data) values('set','main','{"name": "আমার ইউনিয়ন-দরগাপাশা", "tag": "সুশিক্ষায় গড়ুন জাতি, সততায় গড়ুন দেশ, সাম্য-মৈত্রী-ঐক্যে গড়ুন ইউনিয়নের পরিবেশ", "phone": "+447984983421", "email": "amarunion.org@gmail.com", "addr": "দরগাপাশা-৩০০১, শান্তিগঞ্জ, সুনামগঞ্জ", "fb": "https://www.facebook.com/amaruniondargapasha", "hero": "শিক্ষায় এগিয়ে দরগাপাশা", "heroTxt": "শিক্ষা, স্বাস্থ্য, পরিবেশ ও সমাজকল্যাণে সবাই মিলে আমরা গড়ছি একটি সমৃদ্ধ ইউনিয়ন।", "notice": "ইউনিয়ন স্কলারশিপ ২০২৬: আবেদন চলছে, শেষ তারিখ ২৫ অক্টোবর।", "noticeShow": true}'::jsonb) on conflict(coll,id) do nothing;
insert into public.docs(coll,id,data) values('sch','main','{"open": true, "start": "2026-10-11", "end": "2026-10-25", "exam": "নভেম্বর ২০২৬ (তারিখ ঘোষণা হবে)", "center": "শান্তিগঞ্জ উপজেলা (কেন্দ্র নির্ধারণাধীন)", "elig": "শান্তিগঞ্জ উপজেলার স্কুলের মেধাবী ছাত্র-ছাত্রী", "cls": "পঞ্চম", "total": 100, "pub": false, "pz": {"gold": 10000, "g1": 5000, "g2": 3000, "g3": 1500}, "ct": {"gold": 1, "g1": 5, "g2": 10, "g3": 14}, "med": "উত্তীর্ণ প্রত্যেক শিক্ষার্থীর ১ জন অভিভাবককে বিশেষ সম্মাননা মেডেল দেওয়া হবে।"}'::jsonb) on conflict(coll,id) do nothing;

-- ---------- FIRST SUPER ADMIN ----------
-- 1) Supabase > Authentication > Users > "Add user" (email + password, tick "Auto Confirm User").
-- 2) Copy that user's UUID, then run this (edit the 3 values):
-- insert into public.profiles(user_id,uid,name,role,active) values ('PASTE-USER-UUID','you@example.com','Your Name','super',true);
