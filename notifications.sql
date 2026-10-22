-- Account-owned inbox. Existing users, roles and manual data are unchanged.
begin;
create table public.helper_notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('reply','followup')),
 reference text not null,
 data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 available_at timestamptz not null default now(),
 read_at timestamptz,
 response text check(response in ('solved','unresolved','dismissed','completed')),
 unique(user_id,kind,reference)
);
alter table public.helper_notifications enable row level security;
create policy own_notifications on public.helper_notifications for select to authenticated
 using(user_id=auth.uid() and public.helper_has_access() and not public.helper_is_demo());
revoke all on public.helper_notifications from public,anon,authenticated;
grant select on public.helper_notifications to authenticated;
create index helper_notifications_owner on public.helper_notifications(user_id,available_at desc);

create function public.helper_reply_notification() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if btrim(new.reply)<>'' and new.reply is distinct from old.reply then
  insert into helper_notifications(user_id,kind,reference,data)
   values(new.user_id,'reply',new.id::text,jsonb_build_object('subject',left(new.body,100)))
   on conflict(user_id,kind,reference) do update set data=excluded.data,created_at=now(),available_at=now(),read_at=null,response=null;
 end if;
 return new;
end $$;
revoke all on function public.helper_reply_notification() from public,anon,authenticated;
create trigger helper_suggestion_reply_notification after update of reply on public.helper_suggestions
 for each row execute function public.helper_reply_notification();

-- Parse only the established version-2 attempt format; old free-text events are ignored.
create function public.helper_notification_attempt(detail text) returns text language plpgsql immutable set search_path=public,pg_temp as $$
declare meta jsonb;
begin
 meta:=detail::jsonb;
 if meta->>'v'='2' and length(meta->>'attempt') between 1 and 100 then return meta->>'attempt';end if;
 return null;
exception when invalid_text_representation then return null;
end $$;
revoke all on function public.helper_notification_attempt(text) from public,anon,authenticated;

create function public.helper_get_notifications() returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); result jsonb;
begin
 if uid is null or not helper_has_access() or helper_is_demo() then raise exception 'not authorized' using errcode='42501';end if;
 -- Follow up only recent, identifiable attempts after 30 minutes. Never infer a failure.
 insert into helper_notifications(user_id,kind,reference,data,created_at,available_at)
 select uid,'followup',helper_notification_attempt(e.detail),
 jsonb_build_object('symptomId',e.symptom_id,'brand',e.brand,'device',e.device,'branch',e.branch_name,'startedAt',e.created_at),e.created_at,e.created_at+interval '30 minutes'
 from events e where e.user_id=uid and e.event_type='symptom_click'
 and e.created_at between now()-interval '7 days' and now()-interval '30 minutes'
 and helper_notification_attempt(e.detail) is not null
 and not exists(select 1 from events newer where newer.user_id=uid and newer.event_type='symptom_click' and newer.symptom_id=e.symptom_id and newer.brand is not distinct from e.brand and newer.branch_name is not distinct from e.branch_name and newer.created_at>e.created_at)
 and not exists(select 1 from events o where o.user_id=uid and o.event_type='symptom_outcome' and helper_notification_attempt(o.detail)=helper_notification_attempt(e.detail))
 order by e.created_at desc limit 20
 on conflict(user_id,kind,reference) do nothing;
 update helper_notifications n set response='completed',read_at=coalesce(n.read_at,now())
 where n.user_id=uid and n.kind='followup' and n.response is null
 and (exists(select 1 from events e where e.user_id=uid and e.event_type='symptom_outcome' and helper_notification_attempt(e.detail)=n.reference) or exists(select 1 from events e where e.user_id=uid and e.event_type='symptom_click' and e.symptom_id=n.data->>'symptomId' and e.brand is not distinct from n.data->>'brand' and e.branch_name is not distinct from n.data->>'branch' and e.created_at>n.created_at));
 select jsonb_build_object('items',coalesce(jsonb_agg(to_jsonb(n) order by n.created_at desc),'[]'::jsonb)) into result
 from (select id,kind,reference,data,created_at,read_at,response from helper_notifications
 where user_id=uid and available_at<=now() and (kind='reply' or created_at>now()-interval '7 days')
 order by created_at desc limit 100) n;
 return result;
end $$;

create function public.helper_notification_action(notification_id uuid,action text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare n helper_notifications; uid uuid:=auth.uid();
begin
 if uid is null or not helper_has_access() or helper_is_demo() then raise exception 'not authorized' using errcode='42501';end if;
 select * into n from helper_notifications where id=notification_id and user_id=uid for update;
 if not found then raise exception 'notification not found' using errcode='42501';end if;
 if action='read' then update helper_notifications set read_at=now() where id=n.id;return;end if;
 if n.kind<>'followup' or action not in ('solved','unresolved') then raise exception 'invalid action';end if;
 if n.response is not null then return;end if;
 if exists(select 1 from events e where e.user_id=uid and e.event_type='symptom_outcome' and helper_notification_attempt(e.detail)=n.reference) then
  update helper_notifications set response='completed',read_at=now() where id=n.id;return;
 end if;
 if action in ('solved','unresolved') then
  insert into events(user_id,event_type,brand,device,symptom_id,outcome,detail,branch_name)
  values(uid,'symptom_outcome',n.data->>'brand',n.data->>'device',n.data->>'symptomId',action,jsonb_build_object('v',2,'attempt',n.reference,'source','notification_followup')::text,n.data->>'branch');
 end if;
 -- Both explicit answers are outcomes; unresolved is distinct from a support request.
 update helper_notifications set response=action,read_at=now() where id=n.id;
end $$;
revoke all on function public.helper_get_notifications(),public.helper_notification_action(uuid,text) from public,anon,authenticated;
grant execute on function public.helper_get_notifications(),public.helper_notification_action(uuid,text) to authenticated;

insert into public.helper_notifications(user_id,kind,reference,data)
select user_id,'reply',id::text,jsonb_build_object('subject',left(body,100)) from public.helper_suggestions where btrim(reply)<>''
on conflict(user_id,kind,reference) do nothing;
commit;
