-- GoTrue inserts auth.users before applying server-controlled app_metadata.
-- Validate the completed row in the same transaction, before commit.
begin;
create table public.helper_demo_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 login_id text unique not null check(login_id ~ '^[a-z][a-z0-9_]{3,39}$'),
 active boolean not null default true,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now()
);
alter table public.helper_demo_accounts enable row level security;
revoke all on public.helper_demo_accounts from public,anon,authenticated;
grant all on public.helper_demo_accounts to service_role;
create function public.helper_is_demo() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.helper_demo_accounts where user_id=auth.uid());
$$;
revoke all on function public.helper_is_demo() from public,anon;
grant execute on function public.helper_is_demo() to authenticated;
create or replace function public.helper_has_access() returns boolean language sql stable security definer set search_path='' as $$
 select public.is_admin()
 or exists(select 1 from public.helper_cms_memberships where user_id=auth.uid() and status='approved')
 or exists(select 1 from public.helper_demo_accounts where user_id=auth.uid() and active);
$$;
-- A demo can read the published guide and its own profile, but cannot write application data.
do $$ declare t text; begin
 foreach t in array array['profiles','events','diagnosis_trees','diagnosis_tree_revisions','helper_announcements','helper_notice_reads','helper_suggestions','helper_ratings','helper_manual_reviews','helper_ending_guides','helper_symptom_catalog'] loop
  if to_regclass('public.'||t) is null then continue; end if;
  execute format('create policy demo_no_insert on public.%I as restrictive for insert to authenticated with check(not public.helper_is_demo())',t);
  execute format('create policy demo_no_update on public.%I as restrictive for update to authenticated using(not public.helper_is_demo()) with check(not public.helper_is_demo())',t);
  execute format('create policy demo_no_delete on public.%I as restrictive for delete to authenticated using(not public.helper_is_demo())',t);
  if t not in ('profiles','diagnosis_trees','helper_ending_guides','helper_symptom_catalog') then
   execute format('create policy demo_guide_only on public.%I as restrictive for select to authenticated using(not public.helper_is_demo())',t);
  end if;
 end loop;
end $$;
create policy demo_media_read on storage.objects as restrictive for select to authenticated
 using(not public.helper_is_demo() or (bucket_id='diagnosis-media' and public.helper_has_access()));
create policy demo_no_upload on storage.objects as restrictive for insert to authenticated with check(not public.helper_is_demo());
create policy demo_no_update on storage.objects as restrictive for update to authenticated using(not public.helper_is_demo()) with check(not public.helper_is_demo());
create policy demo_no_delete on storage.objects as restrictive for delete to authenticated using(not public.helper_is_demo());
create function public.helper_finalize_signup() returns trigger
language plpgsql security definer set search_path='' as $$
declare account auth.users;
begin
 select * into account from auth.users where id=new.id;
 if not found then return null; end if;
 if account.raw_app_meta_data->>'helper_demo_signup'='v1' then
  if (account.raw_app_meta_data->>'demo_id') is null
    or (account.raw_app_meta_data->>'demo_id') !~ '^[a-z][a-z0-9_]{3,39}$'
    or account.email is distinct from ('demo-'||(account.raw_app_meta_data->>'demo_id')||'@demos.kioskhelper.invalid')
    or not exists(select 1 from public.profiles where id::text=account.raw_app_meta_data->>'created_by' and role='admin') then
   raise exception 'DEMO_PROVISIONING_INVALID';
  end if;
  update public.profiles set role='staff',display_name=account.raw_app_meta_data->>'demo_id',branch_name=null where id=account.id;
  if not found then raise exception 'DEMO_PROFILE_MISSING'; end if;
  insert into public.helper_demo_accounts(user_id,login_id,created_by)
   values(account.id,account.raw_app_meta_data->>'demo_id',(account.raw_app_meta_data->>'created_by')::uuid);
  return null;
 end if;
 if account.raw_app_meta_data->>'helper_admin_signup'='v1' then
  if (account.raw_app_meta_data->>'admin_id') is null
    or (account.raw_app_meta_data->>'admin_id') !~ '^[a-z][a-z0-9_]{3,39}$'
    or account.email is distinct from ('admin-'||(account.raw_app_meta_data->>'admin_id')||'@admins.kioskhelper.invalid')
    or not exists(select 1 from public.profiles where id::text=account.raw_app_meta_data->>'created_by' and role='admin') then
   raise exception 'ADMIN_PROVISIONING_INVALID';
  end if;
  update public.profiles set role='admin',display_name=account.raw_app_meta_data->>'admin_id' where id=account.id;
  if not found then raise exception 'ADMIN_PROFILE_MISSING'; end if;
  return null;
 end if;
 if coalesce(account.raw_app_meta_data->>'helper_cms_signup','') <> 'v1'
   or account.raw_app_meta_data->>'cms_id' is null
   or jsonb_typeof(account.raw_app_meta_data->'stores') is distinct from 'array' then
  raise exception 'CMS_SIGNUP_REQUIRED';
 end if;
 insert into public.helper_cms_memberships(user_id,cms_id,stores,mapping_hash)
 values(account.id,account.raw_app_meta_data->>'cms_id',array(select jsonb_array_elements_text(account.raw_app_meta_data->'stores')),account.raw_app_meta_data->>'mapping_hash');
 update auth.users set banned_until=now()+interval '100 years' where id=account.id;
 return null;
end $$;
revoke all on function public.helper_finalize_signup() from public,anon,authenticated;
drop trigger helper_require_cms_signup on auth.users;
drop trigger helper_create_cms_membership on auth.users;
drop trigger zz_helper_finish_admin_signup on auth.users;
create constraint trigger helper_finalize_signup after insert on auth.users
 deferrable initially deferred for each row execute function public.helper_finalize_signup();
commit;
