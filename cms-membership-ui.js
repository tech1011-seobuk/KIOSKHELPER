/* CMS membership UI. Embedded by sync-community.cjs; contains no S3 credentials. */
const CMS_MESSAGES={
 CMS_ID_NOT_FOUND:'CMS에 등록된 ID를 찾지 못했어요. ID를 확인해주세요.',
 CMS_ID_NEEDS_REVIEW:'CMS 원본 ID에 공백 또는 중복 문제가 있어요. 관리자에게 확인을 요청해주세요.',
 CMS_ID_INVALID:'CMS ID를 확인해주세요.',
 ALREADY_REGISTERED:'이미 가입 신청된 CMS ID예요. 승인 여부를 관리자에게 확인해주세요.',
 LOGIN_NOT_AVAILABLE:'ID·비밀번호 또는 관리자 승인 여부를 확인해주세요.',
 PASSWORD_INVALID:'헬퍼 비밀번호는 8~128자로 입력해주세요.',
 APPROVAL_REQUIRED:'관리자 승인 후 이용할 수 있어요.',
 LOGIN_REQUIRED:'다시 로그인해주세요.',
 ADMIN_REQUIRED:'관리자 계정만 이용할 수 있어요.',
 ADMIN_ID_INVALID:'ID는 영문 소문자로 시작하는 4~40자의 영문·숫자·밑줄로 입력해주세요.',
 ADMIN_PASSWORD_INVALID:'새 계정 비밀번호는 12~128자로 입력해주세요.',
 ADMIN_CREATION_DISABLED:'관리자 계정 추가는 종료됐어요. 새로고침 후 계정 추가 메뉴를 이용해주세요.',
 ADMIN_CREATE_FAILED:'계정을 만들지 못했어요. 서버 처리 오류일 수 있으니 관리자에게 확인을 요청해주세요.',
 ADMIN_ID_TAKEN:'이미 사용 중인 ID예요. 다른 ID를 입력해주세요.',
 TOO_MANY_REQUESTS:'요청이 많아요. 10분 뒤 다시 시도해주세요.',
 MEMBER_CHANGED:'다른 관리자가 처리한 신청이에요. 목록을 새로 확인해주세요.'
};
async function cmsRequest(action,values={}){
 const {data,error}=await sb.functions.invoke('cms-membership',{body:{action,...values}});
 if(error||data?.error){
  let code=data?.error;
  if(!code&&error?.context)try{code=(await error.context.json()).error;}catch{}
  throw new Error(CMS_MESSAGES[code]||'회원 정보를 확인하지 못했어요. 잠시 후 다시 시도해주세요.');
 }
 return data;
}
function cmsStoreKey(userId){return 'helperSelectedStore:'+APP_ENV+':'+userId;}
function cmsChooseInitialStore(stores,saved){
 return stores.length===1?stores[0]:stores.includes(saved)?saved:null;
}
function cmsNextScreen(){return currentUser?.cmsId&&!currentUser.branchName?'storeSelect':'hub';}
function adminLoginEmail(identity){
 const value=identity.trim();
 if(value.includes('@'))return value;
 if(!/^[a-z][a-z0-9_]{3,39}$/.test(value))throw new Error(CMS_MESSAGES.ADMIN_ID_INVALID);
 return 'admin-'+value+'@admins.kioskhelper.invalid';
}
async function signInManagedAccount(identity,password){
 let {data,error}=await sb.auth.signInWithPassword({email:adminLoginEmail(identity),password});
 if(error){
  // New viewing accounts use a separate namespace resolved by the server.
  if(identity.includes('@')||error.code!=='invalid_credentials')throw new Error('ID 또는 비밀번호를 확인해주세요.');
  const result=await cmsRequest('login-demo',{demoId:identity,password});
  ({data,error}=await sb.auth.setSession(result.session));
  if(error)throw new Error('로그인을 완료하지 못했어요. 다시 시도해주세요.');
 }
 try{
  const membership=await cmsRequest('session');
  if(membership.admin!==true&&membership.demo!==true)throw new Error('발급받은 계정으로 로그인해주세요. CMS 회원은 일반 로그인을 이용해주세요.');
  return data.user;
 }catch(error){await sb.auth.signOut();throw error;}
}
function renderCmsAuthScreen(){
 const area=document.getElementById('chatArea'),signup=authMode==='signup',admin=authMode==='admin'||authMode==='demo';
 const wrap=document.createElement('div');wrap.className='login-screen';
 wrap.innerHTML='<div class="hub-title">'+(signup?'회원가입':admin?'관리자 로그인':'로그인')+'</div>'+
 '<div class="hub-sub">'+(signup?'CMS ID를 확인한 뒤 관리자에게 가입 승인을 요청합니다.':admin?'발급받은 ID와 비밀번호를 입력해주세요.':'CMS ID와 헬퍼 비밀번호를 입력해주세요.')+'</div>'+
 (authNotice?'<div role="status" class="'+(authNotice.type==='error'?'login-error':'login-notice')+'">'+escapeHtml(authNotice.text)+'</div>':'')+
 '<form id="authForm"><div class="login-field"><label for="authIdentity">'+(admin?'관리자 ID':'CMS ID')+'</label><input id="authIdentity" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" maxlength="100" '+(admin?'value="'+escapeHtml(getRememberedEmail())+'"':'')+' required></div>'+
 '<div class="login-field"><label for="authPassword">'+(admin?'비밀번호':'헬퍼 비밀번호')+'</label><input id="authPassword" type="password" autocomplete="'+(signup?'new-password':'current-password')+'" minlength="'+(admin?6:8)+'" maxlength="128" required></div>'+
 (signup?'<div class="field-hint">CMS 비밀번호와 별도로, 헬퍼에서 사용할 비밀번호를 만들어주세요.</div><div class="login-field"><label for="authPasswordConfirm">비밀번호 확인</label><input id="authPasswordConfirm" type="password" autocomplete="new-password" minlength="8" maxlength="128" aria-describedby="passwordMatchStatus" required><span id="passwordMatchStatus" class="field-hint" role="status" aria-live="polite"></span></div>'+PRIVACY_CONSENT_HTML:'<label class="remember-email-row"><input id="authAutoLogin" type="checkbox" '+(helperAuthStorage.persistent?'checked':'')+'> 자동 로그인</label>')+
 (admin?'<label class="remember-email-row"><input id="authRememberEmail" type="checkbox" checked> 다음에도 관리자 ID 기억하기</label>':'')+
 '<button class="login-submit" id="authSubmitBtn" type="submit">'+(signup?'가입 승인 요청':'로그인')+'</button></form>'+
 '<div class="login-switch"><button id="authSwitchBtn">'+(signup||admin?'일반 로그인으로 돌아가기':'회원가입')+'</button></div>'+
 (!signup&&!admin?'<div class="login-switch"><button id="authAdminBtn">관리자 로그인</button></div><div class="field-hint">가입 승인·비밀번호 문의는 관리자에게 요청해주세요.</div>':'')+
 (admin?'<div class="login-switch"><button id="authForgotBtn">관리자 비밀번호 찾기</button></div>':'');
 area.replaceChildren(wrap);document.getElementById('breadcrumb').textContent='PHOTOISM 헬퍼';
 wrap.querySelector('#authSwitchBtn').onclick=()=>{authMode=signup||admin?'login':'signup';authNotice=null;render();};
 const adminBtn=wrap.querySelector('#authAdminBtn');if(adminBtn)adminBtn.onclick=()=>{authMode='admin';authNotice=null;render();};
 const forgot=wrap.querySelector('#authForgotBtn');if(forgot)forgot.onclick=()=>{
  const identity=wrap.querySelector('#authIdentity').value.trim();
  if(identity&&!identity.includes('@')){authNotice={type:'info',text:'ID로 만든 관리자 계정의 비밀번호는 운영 담당자에게 재설정을 요청해주세요.'};render();return;}
  authMode='forgot';authNotice=null;render();
 };
 if(signup){
  const first=wrap.querySelector('#authPassword'),confirm=wrap.querySelector('#authPasswordConfirm'),status=wrap.querySelector('#passwordMatchStatus');
  const check=()=>{const s=signupPasswordState(first.value,confirm.value);status.textContent=s.message;confirm.setCustomValidity(s.matches?'':s.message);confirm.setAttribute('aria-invalid',String(!s.empty&&!s.matches));};
  first.oninput=confirm.oninput=check;check();
  wrap.querySelector('#privacyDetailToggle').onclick=()=>{const box=wrap.querySelector('#privacyDetailBox');box.style.display=box.style.display==='none'?'block':'none';};
 }
 wrap.querySelector('#authForm').onsubmit=async e=>{
  e.preventDefault();if(!sb)return;
  const button=wrap.querySelector('#authSubmitBtn'),identity=wrap.querySelector('#authIdentity').value.trim(),password=wrap.querySelector('#authPassword').value;
  button.disabled=true;button.textContent='확인 중...';
  try{
   if(signup){
    if(!await showSharedAccountPolicy())return;
    const result=await cmsRequest('signup',{cmsId:identity,password,consent:wrap.querySelector('#authPrivacyConsent').checked});
    authMode='login';authNotice={type:'info',text:'가입 신청이 접수됐어요. 연결된 지점 '+result.storeCount+'개를 확인했으며, 관리자 승인 후 로그인할 수 있어요.'};render();return;
   }
   helperAuthStorage.setPersistent(wrap.querySelector('#authAutoLogin').checked);
   let user;
   if(admin){
    user=await signInManagedAccount(identity,password);
    if(wrap.querySelector('#authRememberEmail').checked)setRememberedEmail(identity);else clearRememberedEmail();
   }else{
    const result=await cmsRequest('login',{cmsId:identity,password});
    const {data,error}=await sb.auth.setSession(result.session);if(error)throw new Error('로그인을 완료하지 못했어요. 다시 시도해주세요.');user=data.user;
   }
   try{sessionStorage.removeItem(cmsStoreKey(user.id));}catch{}
   await loadProfile(user);appState=cmsNextScreen();authNotice=null;flushOfflineQueue();updateUserInfoBar();render();
  }catch(error){currentUser=null;authNotice={type:'error',text:error.message};render();}
  finally{button.disabled=false;button.textContent=signup?'가입 승인 요청':'로그인';}
 };
}
function renderStoreSelection(){
 const area=document.getElementById('chatArea');
 if(!currentUser?.cmsId){appState='login';render();return;}
 const wrap=document.createElement('div');wrap.className='login-screen';wrap.style.maxWidth='580px';
 wrap.innerHTML='<div class="hub-title">이용할 지점 선택</div><div class="hub-sub">'+escapeHtml(currentUser.cmsId)+'에 연결된 '+currentUser.stores.length+'개 지점 중 선택해주세요.</div><div class="login-field"><label for="cmsStoreSearch">지점명 검색</label><input id="cmsStoreSearch" type="search" autocomplete="off" placeholder="지점 이름을 입력해주세요"></div><div id="cmsStoreResults" role="status" aria-live="polite" class="field-hint"></div><div id="cmsStoreList" style="display:grid;gap:10px;max-height:52vh;overflow:auto;padding:8px 2px"></div>';
 area.replaceChildren(wrap);document.getElementById('breadcrumb').textContent='지점 선택';
 const list=wrap.querySelector('#cmsStoreList');
 const draw=()=>{
  const query=wrap.querySelector('#cmsStoreSearch').value.trim().toLocaleLowerCase('ko');
  const stores=currentUser.stores.filter(s=>s.toLocaleLowerCase('ko').includes(query));list.replaceChildren();
  wrap.querySelector('#cmsStoreResults').textContent=stores.length?stores.length+'개 지점':'검색된 지점이 없어요.';
  for(const store of stores){const b=document.createElement('button');b.type='button';b.className='signup-store-option';b.style.cssText='width:100%;text-align:left;padding:18px;border:1px solid var(--border);border-radius:12px;white-space:normal;overflow-wrap:anywhere';b.textContent=store+' →';b.onclick=()=>{
   currentUser.branchName=store;try{sessionStorage.setItem(cmsStoreKey(currentUser.id),store);}catch{}
   path=[];if(typeof helperAttempt!=='undefined')helperAttempt=null;selectedDevice=null;appState='hub';updateUserInfoBar();render();
  };list.appendChild(b);}
 };wrap.querySelector('#cmsStoreSearch').oninput=draw;draw();
}
function updateCmsStoreButton(){
 let button=document.getElementById('cmsStoreSwitch');
 if(!button){button=document.createElement('button');button.id='cmsStoreSwitch';button.className='reset-btn';button.style.maxWidth='100%';button.style.whiteSpace='normal';document.getElementById('userInfo').after(button);}
 button.hidden=!currentUser?.cmsId;
 if(!currentUser?.cmsId)return;
 button.textContent=(currentUser.branchName||'지점 선택')+(currentUser.stores.length>1?' · 변경':'');
 button.disabled=currentUser.stores.length<2;
 button.onclick=()=>{path=[];if(typeof helperAttempt!=='undefined')helperAttempt=null;selectedDevice=null;currentUser.branchName=null;try{sessionStorage.removeItem(cmsStoreKey(currentUser.id));}catch{}appState='storeSelect';updateUserInfoBar();render();};
}
async function renderCmsApprovals(offset=0){
 const area=document.getElementById('chatArea');
 if(currentUser?.role!=='admin'){appState='login';render();return;}
 const owner=currentUser.id;
 area.innerHTML='<div class="admin-screen"><div class="hub-title">회원 가입 승인</div><div role="status">불러오는 중...</div></div>';
 document.getElementById('breadcrumb').textContent='관리자 · 회원 가입 승인';
 try{
  const {members}=await cmsRequest('list',{offset});
  if(currentUser?.id!==owner||appState!=='cmsApprovals')return;
  const wrap=document.createElement('div');wrap.className='admin-screen cms-approvals';wrap.style.cssText='width:100%;max-width:1440px;box-sizing:border-box;padding:0 16px';
  wrap.innerHTML='<div class="hub-title">회원 가입 승인</div><div class="hub-sub">CMS ID와 연결 지점을 확인한 뒤 이용을 승인해주세요.</div>';
  if(!members.length){const p=document.createElement('p');p.textContent='가입 신청이 없어요.';wrap.appendChild(p);}
  const grid=document.createElement('div');grid.className='cms-approval-grid';grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:16px;align-items:start;margin:24px 0';wrap.appendChild(grid);
  for(const m of members){
   const card=document.createElement('section');card.style.cssText='border:1px solid var(--border);border-radius:14px;padding:20px;margin:0;min-width:0;box-sizing:border-box;overflow-wrap:anywhere';
   card.innerHTML='<h3>'+escapeHtml(m.cms_id)+'</h3><p>'+({pending:'승인 대기',approved:'승인 완료',rejected:'신청 반려'}[m.status]||'확인 필요')+' · '+escapeHtml(new Date(m.created_at).toLocaleString('ko-KR'))+'</p><details><summary>연결 지점 '+m.stores.length+'개 보기</summary><ul>'+m.stores.map(s=>'<li>'+escapeHtml(s)+'</li>').join('')+'</ul></details>';
   const status=document.createElement('p');status.setAttribute('role','status');card.appendChild(status);
   const action=(label,name)=>{const b=document.createElement('button');b.className='signup-store-option';b.textContent=label;b.style.margin='12px 8px 0 0';b.onclick=async()=>{const buttons=[...card.querySelectorAll('button')];buttons.forEach(x=>x.disabled=true);try{await cmsRequest(name,{userId:m.user_id});await renderCmsApprovals(offset);}catch(e){status.textContent=e.message;buttons.forEach(x=>x.disabled=false);}};card.appendChild(b);};
   if(m.status==='pending'){action('이용 승인','approve');action('신청 반려','reject');}
   if(m.status==='approved')action('로그인 활성화 재시도','approve');
   grid.appendChild(card);
  }
  const nav=document.createElement('div');
  for(const [label,next] of [['이전',Math.max(0,offset-50)],['다음',offset+50]]){const b=document.createElement('button');b.className='signup-store-option';b.textContent=label;b.disabled=label==='이전'?offset===0:members.length<50;b.onclick=()=>renderCmsApprovals(next);nav.appendChild(b);}
  wrap.appendChild(nav);area.replaceChildren(wrap);
 }catch(e){if(currentUser?.id===owner&&appState==='cmsApprovals'){area.textContent=e.message;}}
}
function renderAccountCreateScreen(){
 if(currentUser?.role!=='admin'){appState='login';render();return;}
 const area=document.getElementById('chatArea'),wrap=document.createElement('div');
 wrap.className='admin-screen';wrap.style.maxWidth='580px';
 wrap.innerHTML='<div class="hub-title">계정 추가</div><div class="hub-sub">일반 회원이 보는 조치 안내를 이용할 수 있는 계정입니다.<br>CMS 확인 없이 발급하고, 관리자 로그인에서 이용합니다.</div>';
 document.getElementById('breadcrumb').textContent='관리자 · 계정 추가';
 appendAccountCreateForm(wrap);
 const back=document.createElement('button');back.className='admin-export-btn';back.textContent='관리자 화면으로';
 back.onclick=()=>{appState='adminDashboard';render();};wrap.appendChild(back);
 area.replaceChildren(wrap);
}
function appendAccountCreateForm(wrap){
 const box=document.createElement('section');box.style.cssText='border:1px solid var(--border);border-radius:14px;padding:20px;margin:20px 0';
 box.innerHTML='<p class="field-hint">조치 안내·사진·영상을 볼 수 있습니다. 관리자 기능과 다이어그램은 이용할 수 없습니다.</p><form id="accountCreateForm"><div class="login-field"><label for="newAccountId">새 계정 ID</label><input id="newAccountId" type="text" value="companydemo01" pattern="[a-z][a-z0-9_]{3,39}" minlength="4" maxlength="40" autocomplete="off" autocapitalize="none" spellcheck="false" required><span class="field-hint">영문 소문자로 시작하는 4~40자의 영문·숫자·밑줄</span></div><div class="login-field"><label for="newAccountPassword">비밀번호</label><input id="newAccountPassword" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></div><div class="login-field"><label for="newAccountPasswordConfirm">비밀번호 확인</label><input id="newAccountPasswordConfirm" type="password" minlength="12" maxlength="128" autocomplete="new-password" required></div><p class="field-hint">비밀번호는 12자 이상 입력해주세요.</p><button class="login-submit" type="submit">계정 만들기</button><p id="accountCreateStatus" role="status" aria-live="polite"></p></form>';
 const form=box.querySelector('form'),password=box.querySelector('#newAccountPassword'),confirm=box.querySelector('#newAccountPasswordConfirm'),status=box.querySelector('#accountCreateStatus');
 password.oninput=confirm.oninput=()=>confirm.setCustomValidity(password.value===confirm.value?'':'비밀번호가 일치하지 않습니다.');
 form.onsubmit=async e=>{
  e.preventDefault();const button=form.querySelector('button');button.disabled=true;status.textContent='계정을 만드는 중...';
  try{const identity=box.querySelector('#newAccountId').value.trim();const result=await cmsRequest('create-demo',{demoId:identity,password:password.value});password.value='';confirm.value='';status.textContent='계정 '+result.demoId+'을 만들었어요. 관리자 로그인에서 조치 안내를 볼 수 있습니다.';}
  catch(e){status.textContent=e.message;}
  finally{button.disabled=false;}
 };
 wrap.appendChild(box);
}
