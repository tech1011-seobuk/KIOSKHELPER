-- Trusted admin provisioning; public signup still requires CMS approval.
begin;
create or replace function public.helper_require_cms_signup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.raw_app_meta_data->>'helper_admin_signup'='v1' then
  if (new.raw_app_meta_data->>'admin_id') is null
    or (new.raw_app_meta_data->>'admin_id') !~ '^[a-z][a-z0-9_]{3,39}$'
    or new.email is distinct from ('admin-'||(new.raw_app_meta_data->>'admin_id')||'@admins.kioskhelper.invalid')
    or not exists(select 1 from public.profiles where id::text=new.raw_app_meta_data->>'created_by' and role='admin') then
   raise exception 'ADMIN_PROVISIONING_INVALID';
  end if;
  return new;
 end if;
 if coalesce(new.raw_app_meta_data->>'helper_cms_signup','') <> 'v1'
   or new.raw_app_meta_data->>'cms_id' is null
   or jsonb_typeof(new.raw_app_meta_data->'stores') is distinct from 'array' then
   raise exception 'CMS_SIGNUP_REQUIRED';
 end if;
 new.banned_until := now()+interval '100 years';
 return new;
end $$;
create or replace function public.helper_create_cms_membership() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.raw_app_meta_data->>'helper_admin_signup'='v1' then return new; end if;
 insert into public.helper_cms_memberships(user_id,cms_id,stores,mapping_hash)
 values(new.id,new.raw_app_meta_data->>'cms_id',array(select jsonb_array_elements_text(new.raw_app_meta_data->'stores')),new.raw_app_meta_data->>'mapping_hash');
 return new;
end $$;
-- Runs after on_auth_user_created has created the normal profile. All is atomic.
create function public.helper_finish_admin_signup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.raw_app_meta_data->>'helper_admin_signup'='v1' then
  update public.profiles set role='admin',display_name=new.raw_app_meta_data->>'admin_id' where id=new.id;
  if not found then raise exception 'ADMIN_PROFILE_MISSING'; end if;
 end if;
 return new;
end $$;
create trigger zz_helper_finish_admin_signup after insert on auth.users for each row execute function public.helper_finish_admin_signup();
revoke all on function public.helper_require_cms_signup(),public.helper_create_cms_membership(),public.helper_finish_admin_signup() from public;
commit;
