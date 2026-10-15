const encoder=new TextEncoder();
const origins=new Set(['https://tech1011-seobuk.github.io','http://127.0.0.1:4174','http://localhost:4174']);
class ApiError extends Error{constructor(code,status=400){super(code);this.code=code;this.status=status;}}
const fail=(code,status)=>{throw new ApiError(code,status);};
export function createMembershipHandler({url,serviceKey,anonKey,mapping,sha256,fetchImpl=fetch}){
 async function request(path,{method='GET',body,token=serviceKey,key=serviceKey,prefer}={}){
  const response=await fetchImpl(url+path,{method,headers:{apikey:key,Authorization:'Bearer '+token,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
  let data;try{data=await response.json();}catch{data=null;}
  if(!response.ok)throw new ApiError('SERVICE_REQUEST_FAILED',503);
  return data;
 }
 const rest=(path,options)=>request('/rest/v1/'+path,options);
 const member=async id=>(await rest('helper_cms_memberships?user_id=eq.'+encodeURIComponent(id)+'&select=*'))?.[0];
 const cmsMember=async id=>(await rest('helper_cms_memberships?cms_id=eq.'+encodeURIComponent(id)+'&select=*'))?.[0];
 const emailFor=async id=>'cms-'+await sha256(encoder.encode(id))+'@members.kioskhelper.invalid';
 async function authenticated(req){
  const token=req.headers.get('authorization')?.replace(/^Bearer\s+/i,'');
  if(!token||token===anonKey)fail('LOGIN_REQUIRED',401);
  let user;try{user=await request('/auth/v1/user',{token,key:anonKey});}catch{fail('LOGIN_REQUIRED',401);}
  if(!user?.id)fail('LOGIN_REQUIRED',401);
  const profile=(await rest('profiles?id=eq.'+encodeURIComponent(user.id)+'&select=role'))?.[0];
  return {user,admin:profile?.role==='admin'};
 }
 async function refresh(m){
  const latest=await mapping.lookup(m.cms_id);
  await rest('helper_cms_memberships?user_id=eq.'+m.user_id,{method:'PATCH',body:{stores:latest.stores,mapping_hash:latest.mappingHash}});
  return latest;
 }
 async function rate(req,id){
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
  for(const [value,limit] of [['id:'+id,8],['ip:'+ip,80],['global',500]]){
   const key=await sha256(encoder.encode(serviceKey+':cms-rate:'+value));
   if(!await rest('rpc/helper_cms_take_rate_limit',{method:'POST',body:{p_key:key,p_limit:limit}}))fail('TOO_MANY_REQUESTS',429);
  }
 }
 return async req=>{
  const origin=req.headers.get('origin');
  const headers={'Content-Type':'application/json','Cache-Control':'no-store',Vary:'Origin',...(origins.has(origin)?{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})};
  const respond=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin&&!origins.has(origin))return respond({error:'ORIGIN_NOT_ALLOWED'},403);
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(req.method!=='POST')return respond({error:'METHOD_NOT_ALLOWED'},405);
  try{
   if(Number(req.headers.get('content-length'))>8192)fail('REQUEST_TOO_LARGE',413);
   const raw=await req.text();if(raw.length>8192)fail('REQUEST_TOO_LARGE',413);
   let body;try{body=JSON.parse(raw);}catch{fail('INVALID_REQUEST');}
   if(!body||typeof body!=='object')fail('INVALID_REQUEST');
   const action=body.action;
   if(action==='signup'||action==='login'){
    const id=typeof body.cmsId==='string'?body.cmsId.trim():'';
    if(!id||id.length>100||/[\u0000-\u001f\u007f]/.test(id))fail('CMS_ID_INVALID');
    if(typeof body.password!=='string'||body.password.length<8||body.password.length>128)fail('PASSWORD_INVALID');
    await rate(req,id);
    if(action==='signup'){
     if(body.consent!==true)fail('CONSENT_REQUIRED');
     const latest=await mapping.lookup(id);
     if(await cmsMember(id))fail('ALREADY_REGISTERED',409);
     const email=await emailFor(latest.cmsId);
     try{await request('/auth/v1/admin/users',{method:'POST',body:{email,password:body.password,email_confirm:true,ban_duration:'876000h',user_metadata:{display_name:latest.cmsId},app_metadata:{helper_cms_signup:'v1',cms_id:latest.cmsId,stores:latest.stores,mapping_hash:latest.mappingHash}}});}
     catch{if(await cmsMember(id))fail('ALREADY_REGISTERED',409);fail('SIGNUP_FAILED',503);}
     return respond({status:'pending',storeCount:latest.stores.length});
    }
    const m=await cmsMember(id);
    // Avoid revealing approval status without a valid password. Banned accounts receive this generic message too.
    if(!m||m.status!=='approved')fail('LOGIN_NOT_AVAILABLE',401);
    let session;try{session=await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email:await emailFor(m.cms_id),password:body.password},token:anonKey,key:anonKey});}catch{fail('LOGIN_NOT_AVAILABLE',401);}
    // Authenticated identity is authoritative; never associate another user's membership.
    if(session?.user?.id!==m.user_id)fail('LOGIN_NOT_AVAILABLE',401);
    const latest=await refresh(m);
    return respond({session:{access_token:session.access_token,refresh_token:session.refresh_token},cmsId:m.cms_id,stores:latest.stores});
   }
   const caller=await authenticated(req);
   if(action==='session'){
    if(caller.admin)return respond({admin:true});
    const m=await member(caller.user.id);
    if(m?.status!=='approved')fail('APPROVAL_REQUIRED',403);
    const latest=await refresh(m);
    return respond({admin:false,cmsId:m.cms_id,stores:latest.stores});
   }
   if(!caller.admin)fail('ADMIN_REQUIRED',403);
   if(action==='list'){
    const offset=Number.isSafeInteger(body.offset)&&body.offset>=0?body.offset:0;
    const rows=await rest('helper_cms_memberships?select=user_id,cms_id,status,stores,created_at,reviewed_at&order=created_at.desc&limit=50&offset='+offset);
    return respond({members:rows});
   }
   if(action==='approve'||action==='reject'){
    if(typeof body.userId!=='string'||!/^[-0-9a-f]{36}$/.test(body.userId))fail('INVALID_REQUEST');
    const m=await member(body.userId);if(!m)fail('MEMBER_NOT_FOUND',404);
    if(action==='reject'){
     const changed=await rest('helper_cms_memberships?user_id=eq.'+m.user_id+'&status=eq.pending',{method:'PATCH',prefer:'return=representation',body:{status:'rejected',reviewed_at:new Date().toISOString(),reviewed_by:caller.user.id}});
     if(!changed?.length)fail('MEMBER_CHANGED',409);
     return respond({status:'rejected'});
    }
    if(m.status==='rejected')fail('MEMBER_CHANGED',409);
    const latest=await mapping.lookup(m.cms_id);
    const changed=await rest('helper_cms_memberships?user_id=eq.'+m.user_id+'&status=in.(pending,approved)',{method:'PATCH',prefer:'return=representation',body:{status:'approved',stores:latest.stores,mapping_hash:latest.mappingHash,reviewed_at:new Date().toISOString(),reviewed_by:caller.user.id}});
    if(!changed?.length)fail('MEMBER_CHANGED',409);
    // If unban fails, DB approval is safe: account remains banned; admin can retry the same approval.
    await request('/auth/v1/admin/users/'+m.user_id,{method:'PUT',body:{ban_duration:'none',app_metadata:{stores:null,mapping_hash:null}}});
    return respond({status:'approved'});
   }
   fail('INVALID_REQUEST');
  }catch(error){
   const code=error?.code;
   const known=typeof code==='string'&&/^(CMS_|LOGIN_|APPROVAL_|ADMIN_|MEMBER_|PASSWORD_|CONSENT_|ALREADY_|SIGNUP_|TOO_MANY_|INVALID_|REQUEST_|SERVICE_)/.test(code);
   return respond({error:known?code:'SERVICE_UNAVAILABLE'},error?.status||(known&&code.startsWith('CMS_ID')?400:503));
  }
 };
}
