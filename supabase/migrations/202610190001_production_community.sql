-- Production lsetixbyarexggxsihen only. Add new community tables without changing existing records or roles.
begin;
create table public.helper_announcements (
 id uuid primary key default gen_random_uuid(),
 title text not null check(length(btrim(title)) between 1 and 120),
 body text not null check(length(btrim(body)) between 1 and 10000),
 kind text not null default '안내' check(kind in ('안내','업데이트 예정','업데이트 완료','점검')),
 published boolean not null default false,
 important boolean not null default false,
 starts_at timestamptz not null default now(),
 ends_at timestamptz,
 created_at timestamptz not null default now(),
 check(ends_at is null or ends_at>starts_at)
);
create table public.helper_notice_reads (
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 notice_id uuid not null references public.helper_announcements(id) on delete cascade,
 created_at timestamptz not null default now(),primary key(user_id,notice_id)
);
create table public.helper_suggestions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 category text not null check(category in ('조치 안내','사진·영상','사용 불편','기타')),
 body text not null check(length(btrim(body)) between 1 and 3000),
 context text not null default '' check(length(context)<=300),
 status text not null default '접수' check(status in ('접수','검토 중','반영 예정','반영 완료','보류')),
 reply text not null default '' check(length(reply)<=3000),
 created_at timestamptz not null default now()
);
alter table public.helper_announcements enable row level security;
alter table public.helper_notice_reads enable row level security;
alter table public.helper_suggestions enable row level security;
-- Same approved-member and administrator boundary as production, excluding guidance-only viewing accounts.
create policy community_access on public.helper_announcements as restrictive for all to authenticated
 using(public.helper_has_access() and not public.helper_is_demo())
 with check(public.helper_has_access() and not public.helper_is_demo());
create policy community_access on public.helper_notice_reads as restrictive for all to authenticated
 using(public.helper_has_access() and not public.helper_is_demo())
 with check(public.helper_has_access() and not public.helper_is_demo());
create policy community_access on public.helper_suggestions as restrictive for all to authenticated
 using(public.helper_has_access() and not public.helper_is_demo())
 with check(public.helper_has_access() and not public.helper_is_demo());
create policy notices_read on public.helper_announcements for select to authenticated
 using(public.is_admin() or (published and starts_at<=now() and (ends_at is null or ends_at>now())));
create policy notices_insert on public.helper_announcements for insert to authenticated with check(public.is_admin());
create policy notices_update on public.helper_announcements for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy reads_select on public.helper_notice_reads for select to authenticated using(user_id=auth.uid());
create policy reads_insert on public.helper_notice_reads for insert to authenticated with check(user_id=auth.uid() and exists(select 1 from public.helper_announcements where id=notice_id));
create policy suggestions_read on public.helper_suggestions for select to authenticated using(user_id=auth.uid() or public.is_admin());
create policy suggestions_insert on public.helper_suggestions for insert to authenticated with check(user_id=auth.uid() and status='접수' and reply='');
create policy suggestions_update on public.helper_suggestions for update to authenticated using(public.is_admin()) with check(public.is_admin());
revoke all on public.helper_announcements,public.helper_notice_reads,public.helper_suggestions from public,anon,authenticated;
grant select on public.helper_announcements,public.helper_notice_reads,public.helper_suggestions to authenticated;
grant insert(title,body,kind,published,important,starts_at,ends_at),update(title,body,kind,published,important,starts_at,ends_at) on public.helper_announcements to authenticated;
grant insert(notice_id) on public.helper_notice_reads to authenticated;
grant insert(id,category,body,context),update(status,reply) on public.helper_suggestions to authenticated;
grant all on public.helper_announcements,public.helper_notice_reads,public.helper_suggestions to service_role;
create index helper_announcements_date on public.helper_announcements(created_at desc);
create index helper_suggestions_date on public.helper_suggestions(created_at desc,id);
create index helper_suggestions_owner on public.helper_suggestions(user_id,created_at desc);
commit;
