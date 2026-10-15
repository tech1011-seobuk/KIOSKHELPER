-- Additive CMS membership migration. Existing accounts, profiles and events are retained.
begin;
create table public.helper_cms_memberships (
 user_id uuid primary key references auth.users(id) on delete cascade,
 cms_id text unique not null check(length(cms_id) between 1 and 100 and cms_id=btrim(cms_id)),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 stores text[] not null check(cardinality(stores)>0),
 mapping_hash text not null check(mapping_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id)
);
alter table public.helper_cms_memberships enable row level security;
revoke all on public.helper_cms_memberships from anon,authenticated;
grant select on public.helper_cms_memberships to authenticated;
grant all on public.helper_cms_memberships to service_role;
create policy cms_membership_read on public.helper_cms_memberships for select to authenticated
 using(user_id=auth.uid() or public.is_admin());

-- app_metadata is written only by the server Admin API, never from user_metadata.
create function public.helper_require_cms_signup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if coalesce(new.raw_app_meta_data->>'helper_cms_signup','') <> 'v1'
   or new.raw_app_meta_data->>'cms_id' is null
   or jsonb_typeof(new.raw_app_meta_data->'stores') is distinct from 'array' then
   raise exception 'CMS_SIGNUP_REQUIRED';
 end if;
 new.banned_until := now()+interval '100 years';
 return new;
end $$;
create trigger helper_require_cms_signup before insert on auth.users for each row execute function public.helper_require_cms_signup();
create function public.helper_create_cms_membership() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.helper_cms_memberships(user_id,cms_id,stores,mapping_hash)
 values(new.id,new.raw_app_meta_data->>'cms_id',array(select jsonb_array_elements_text(new.raw_app_meta_data->'stores')),new.raw_app_meta_data->>'mapping_hash');
 return new;
end $$;
create trigger helper_create_cms_membership after insert on auth.users for each row execute function public.helper_create_cms_membership();
revoke all on function public.helper_require_cms_signup(), public.helper_create_cms_membership() from public;

create function public.helper_has_access() returns boolean language sql stable security definer set search_path='' as $$
 select public.is_admin() or exists(select 1 from public.helper_cms_memberships where user_id=auth.uid() and status='approved');
$$;
revoke all on function public.helper_has_access() from public;
grant execute on function public.helper_has_access() to authenticated;
-- Restrictive policies complement, rather than replace, existing row ownership rules.
do $$ declare t text; begin
 foreach t in array array['profiles','events','diagnosis_trees','diagnosis_tree_revisions','helper_announcements','helper_notice_reads','helper_suggestions','helper_ratings','helper_manual_reviews','helper_ending_guides','helper_symptom_catalog'] loop
  if to_regclass('public.'||t) is null then continue; end if;
  execute format('create policy cms_approved_access on public.%I as restrictive for all to authenticated using(public.helper_has_access()) with check(public.helper_has_access())',t);
 end loop;
end $$;

alter table public.events add column branch_name text;
create function public.helper_validate_event_store() returns trigger language plpgsql security definer set search_path='' as $$
declare m public.helper_cms_memberships;
begin
 if auth.uid() is null then return new; end if; -- trusted maintenance only; RLS blocks anonymous writes
 if new.user_id<>auth.uid() then raise exception 'EVENT_OWNER_MISMATCH'; end if;
 if public.is_admin() then return new; end if;
 select * into m from public.helper_cms_memberships where user_id=auth.uid();
 if m.status is distinct from 'approved' or new.branch_name is null or not(new.branch_name=any(m.stores)) then
  raise exception 'CMS_STORE_REQUIRED';
 end if;
 return new;
end $$;
create trigger helper_validate_event_store before insert on public.events for each row execute function public.helper_validate_event_store();
revoke all on function public.helper_validate_event_store() from public;

create table public.helper_cms_rate_limits(key_hash text primary key, window_start timestamptz not null, attempts integer not null);
alter table public.helper_cms_rate_limits enable row level security;
revoke all on public.helper_cms_rate_limits from public,anon,authenticated;
create function public.helper_cms_take_rate_limit(p_key text,p_limit integer) returns boolean language plpgsql security definer set search_path='' as $$
declare n integer; begin
 if p_key !~ '^[a-f0-9]{64}$' or p_limit not between 1 and 500 then raise exception 'INVALID_LIMIT'; end if;
 insert into public.helper_cms_rate_limits values(p_key,now(),1)
 on conflict(key_hash) do update set attempts=case when helper_cms_rate_limits.window_start<now()-interval '10 minutes' then 1 else helper_cms_rate_limits.attempts+1 end,
 window_start=case when helper_cms_rate_limits.window_start<now()-interval '10 minutes' then now() else helper_cms_rate_limits.window_start end
 returning attempts into n;
 delete from public.helper_cms_rate_limits where window_start<now()-interval '1 day';
 return n<=p_limit;
end $$;
revoke all on function public.helper_cms_take_rate_limit(text,integer) from public,anon,authenticated;
grant execute on function public.helper_cms_take_rate_limit(text,integer) to service_role;
commit;
