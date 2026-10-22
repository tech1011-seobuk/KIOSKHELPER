begin;
create or replace function public.helper_notification_action(notification_id uuid,action text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
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

commit;
