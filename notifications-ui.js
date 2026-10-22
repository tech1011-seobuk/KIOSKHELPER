/* Embedded by sync-community.cjs. The server scopes every inbox request to auth.uid(). */
let helperInboxOwner=null,helperInboxItems=[],helperInboxBusy=false,helperInboxEpoch=0,helperInboxTimer=null,helperInboxDialog=null,helperInboxError=false;
let helperSuggestionFocus=null,helperInboxPending=null;
function helperInboxUnread(items){return items.filter(n=>!n.read_at&&!n.response).length;}
function helperInboxSync(){
 const owner=helperCommunityAllowed()?currentUser.id:null;
 let button=document.getElementById('helperInboxButton');
 if(!button){
  const anchor=document.getElementById('adminDashBtn');if(!anchor)return;
  button=document.createElement('button');button.id='helperInboxButton';button.className='admin-nav-btn';button.type='button';button.setAttribute('aria-haspopup','dialog');button.style.cssText='min-height:44px;min-width:44px;position:relative';button.onclick=helperOpenInbox;anchor.before(button);
 }
 button.hidden=!owner;button.style.display=owner?'inline-flex':'none';
 if(owner!==helperInboxOwner){helperInboxEpoch++;helperInboxOwner=owner;helperInboxItems=[];helperInboxBusy=false;helperInboxError=false;helperInboxDialog?.close();clearInterval(helperInboxTimer);helperInboxTimer=null;
  if(owner){helperInboxRefresh();helperInboxTimer=setInterval(()=>{if(!document.hidden)helperInboxRefresh();},60000);}
 }
 helperInboxBadge();
}
function helperInboxBadge(){
 const b=document.getElementById('helperInboxButton');if(!b)return;
 const count=helperInboxUnread(helperInboxItems);b.textContent='🔔'+(count?' '+(count>99?'99+':count):'');b.setAttribute('aria-label','알림'+(count?' · 읽지 않은 알림 '+count+'개':''));b.title=helperInboxError?'알림을 불러오지 못했어요. 눌러서 다시 시도':'내 알림';
}
async function helperInboxRefresh(){
 if(!helperInboxOwner)return;
 if(helperInboxBusy)return helperInboxPending;
 const owner=helperInboxOwner,epoch=helperInboxEpoch;helperInboxBusy=true;
 helperInboxPending=(async()=>{
 try{const {data,error}=await sb.rpc('helper_get_notifications');if(error)throw error;
  if(currentUser?.id!==owner||epoch!==helperInboxEpoch)return;
  helperInboxItems=Array.isArray(data?.items)?data.items:[];helperInboxError=false;helperInboxBadge();
 }catch{if(epoch===helperInboxEpoch){helperInboxError=true;helperInboxBadge();}}
 finally{if(epoch===helperInboxEpoch)helperInboxBusy=false;}
 })();return helperInboxPending;
}
async function helperInboxAction(n,action){
 const owner=helperInboxOwner,epoch=helperInboxEpoch;
 const {error}=await sb.rpc('helper_notification_action',{notification_id:n.id,action});if(error)throw error;
 if(owner!==currentUser?.id||epoch!==helperInboxEpoch)throw Error('account changed');
 await helperInboxRefresh();
}
async function helperOpenInbox(){
 if(!helperCommunityAllowed())return;
 helperInit();helperInboxDialog?.close();
 const owner=currentUser.id,d=document.createElement('dialog');d.className='helper-dialog helper-inbox';helperInboxDialog=d;d.setAttribute('aria-labelledby','helperInboxTitle');
 d.style.cssText='position:fixed;inset:76px 16px auto auto;margin:0;width:min(420px,calc(100% - 32px));max-height:calc(100dvh - 100px)';
 d.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px"><h2 id="helperInboxTitle">내 알림</h2><button data-close aria-label="알림 닫기">닫기</button></div><div data-items role="status">불러오는 중...</div>';
 d.querySelector('[data-close]').onclick=()=>d.close();d.addEventListener('close',()=>{d.remove();if(helperInboxDialog===d)helperInboxDialog=null;});document.body.appendChild(d);d.showModal();
 await helperInboxRefresh();if(currentUser?.id!==owner||!d.isConnected)return;
 const host=d.querySelector('[data-items]');
 function draw(){
  host.innerHTML='';
  if(helperInboxError){const p=document.createElement('p');p.textContent='알림을 불러오지 못했어요.';const b=document.createElement('button');b.textContent='다시 시도';b.onclick=async()=>{b.disabled=true;await helperInboxRefresh();if(d.isConnected)draw();};host.append(p,b);return;}
  if(!helperInboxItems.length){host.textContent='아직 받은 알림이 없어요.';return;}
  for(const n of helperInboxItems){
   const card=document.createElement('article');card.className='helper-card';card.style.padding='14px';
   const title=document.createElement('strong');title.textContent=n.kind==='reply'?'의견에 답변이 도착했어요':'지난번 조치는 해결되셨나요?';
   const text=document.createElement('p');text.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';
   const sid=n.data?.symptomId;const label=typeof hotTopicLabel==='function'?hotTopicLabel(sid):sid;
   text.textContent=n.kind==='reply'?(n.data?.subject||'접수한 의견'):[n.data?.device,label,n.data?.branch].filter(Boolean).join(' · ');
   const stamp=document.createElement('p');stamp.className='helper-small';stamp.textContent=helperStamp(n.created_at)+(n.read_at?' · 읽음':' · 새 알림');
   const status=document.createElement('p');status.setAttribute('role','status');card.append(title,text,stamp,status);
   const add=(label,fn)=>{const b=document.createElement('button');b.textContent=label;b.style.cssText='margin:4px;min-height:44px';b.onclick=async()=>{card.querySelectorAll('button').forEach(x=>x.disabled=true);try{await fn();}catch{status.textContent='처리하지 못했어요. 다시 시도해주세요.';card.querySelectorAll('button').forEach(x=>x.disabled=false);}};card.appendChild(b);};
   if(n.kind==='reply')add('답변 보기',async()=>{await helperInboxAction(n,'read');helperSuggestionFocus=n.reference;d.close();appState='suggestions';render();});
   else if(n.response){status.textContent={solved:'해결됐다고 알려주셨어요.',unresolved:'아직 해결되지 않았다고 알려주셨어요.',dismissed:'확인 요청을 닫았어요.',completed:'조치 결과가 이미 기록됐어요.'}[n.response]||'확인 완료';}
   else{
    const hint=document.createElement('p');hint.className='helper-small';hint.textContent='결과가 기록되지 않아 확인하는 알림이에요. 미해결로 판단한 것은 아닙니다.';card.appendChild(hint);
    add('해결했어요',async()=>{await helperInboxAction(n,'solved');draw();});
    add('못했어요',async()=>{await helperInboxAction(n,'unresolved');draw();});
   }
   host.appendChild(card);
  }
 }
 draw();
}
