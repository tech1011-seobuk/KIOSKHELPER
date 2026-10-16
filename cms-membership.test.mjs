import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createMembershipHandler} from './supabase/functions/_shared/cms-membership.mjs';
import {sha256} from './supabase/functions/_shared/cms-mapping.mjs';
const id='00000000-0000-4000-8000-000000000001';
function fixture({status='approved',admin=false,missing=false,rate=true,sourceError=false,loginUser=id}={}){
 const calls=[];const row={user_id:id,cms_id:'0001',status,stores:['이전 지점']};
 const handler=createMembershipHandler({url:'https://example.test',anonKey:'anon',serviceKey:'service',sha256,
 mapping:{async lookup(cmsId){if(sourceError)throw Object.assign(new Error(),{code:'CMS_ID_NOT_FOUND'});return{cmsId,stores:['서울','부산'],mappingHash:'a'.repeat(64)};}},
 fetchImpl:async(url,options)=>{
  const u=new URL(url),body=options.body?JSON.parse(options.body):null;calls.push({path:u.pathname,query:u.search,options,body});
  let response;
  if(u.pathname.endsWith('helper_cms_take_rate_limit'))response=rate;
  else if(u.pathname.endsWith('/user'))response={id};
  else if(u.pathname.endsWith('/profiles'))response=[{role:admin?'admin':'staff'}];
  else if(u.pathname.endsWith('/helper_cms_memberships'))response=options.method==='PATCH'?[{...row,...body}]:missing?[]:[row];
  else if(u.pathname.endsWith('/token'))response={user:{id:loginUser},access_token:'test-access',refresh_token:'test-refresh'};
  else response={id};
  return new Response(JSON.stringify(response),{status:200,headers:{'Content-Type':'application/json'}});
 }});
 return {calls,async run(body,token='anon'){
  const res=await handler(new Request('https://example.test/function',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json',Origin:'https://tech1011-seobuk.github.io'},body:JSON.stringify(body)}));return{status:res.status,body:await res.json()};
 }};
}
test('signup validates source and creates only a banned pending account without returning tokens',async()=>{
 const f=fixture({missing:true});const result=await f.run({action:'signup',cmsId:'0001',password:'example-password',consent:true});
 assert.deepEqual(result,{status:200,body:{status:'pending',storeCount:2}});
 const create=f.calls.find(x=>x.path.endsWith('/admin/users'));
 assert.equal(create.body.ban_duration,'876000h');assert.equal(create.body.app_metadata.cms_id,'0001');
 assert.deepEqual(create.body.app_metadata.stores,['서울','부산']);assert.match(create.body.email,/^cms-[a-f0-9]{64}@members\.kioskhelper\.invalid$/);
 assert.equal(create.body.user_metadata.role,undefined);
});
test('unknown CMS ID, missing consent and rate limit prevent creation',async()=>{
 for(const opts of [{sourceError:true},{rate:false}]){const f=fixture({...opts,missing:true});assert.notEqual((await f.run({action:'signup',cmsId:'0001',password:'example-password',consent:true})).status,200);assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));}
 const f=fixture({missing:true});assert.equal((await f.run({action:'signup',cmsId:'0001',password:'example-password'})).body.error,'CONSENT_REQUIRED');
});
test('pending, rejected or mismatched login identities never receive a session',async()=>{
 for(const status of ['pending','rejected']){const f=fixture({status});assert.equal((await f.run({action:'login',cmsId:'0001',password:'example-password'})).status,401);assert.ok(!f.calls.some(x=>x.path.endsWith('/token')));}
 const f=fixture({loginUser:'someone-else'});assert.equal((await f.run({action:'login',cmsId:'0001',password:'example-password'})).status,401);
});
test('approved login returns latest full store list with Supabase session',async()=>{
 const f=fixture();const result=await f.run({action:'login',cmsId:'0001',password:'example-password'});
 assert.deepEqual(result.body.stores,['서울','부산']);assert.equal(result.body.cmsId,'0001');
 assert.equal(result.body.session.access_token,'test-access');
 assert.ok(f.calls.some(x=>x.options.method==='PATCH'&&x.body.stores?.includes('부산')));
});
test('approval requires authenticated server-verified admin and fresh CMS mapping',async()=>{
 const anonymous=fixture({admin:true});assert.equal((await anonymous.run({action:'approve',userId:id})).status,401);
 const staff=fixture();assert.equal((await staff.run({action:'approve',userId:id},'user-token')).status,403);
 const invalid=fixture({admin:true,sourceError:true});assert.notEqual((await invalid.run({action:'approve',userId:id},'admin-token')).status,200);assert.ok(!invalid.calls.some(x=>x.options.method==='PUT'));
 const admin=fixture({admin:true,status:'pending'});assert.equal((await admin.run({action:'approve',userId:id},'admin-token')).body.status,'approved');
 const unban=admin.calls.find(x=>x.options.method==='PUT');assert.equal(unban.body.ban_duration,'none');assert.equal(unban.body.app_metadata.stores,null);
});
test('session access is denied for unapproved accounts, while existing admin is preserved',async()=>{
 const pending=fixture({status:'pending'});assert.equal((await pending.run({action:'session'},'user-token')).status,403);
 const admin=fixture({admin:true,sourceError:true});assert.deepEqual((await admin.run({action:'session'},'admin-token')).body,{admin:true});
});
test('single store auto-selects, multi-store requires selection and stale stored choice is rejected',()=>{
 const source=fs.readFileSync(new URL('./cms-membership-ui.js',import.meta.url),'utf8');
 const context=vm.createContext({});vm.runInContext(source,context);
 const choose=context.cmsChooseInitialStore;
 assert.equal(choose(['서울'],null),'서울');assert.equal(choose(['서울','부산'],null),null);
 assert.equal(choose(['서울','부산'],'서울'),'서울');assert.equal(choose(['부산','대구'],'서울'),null);
});
test('database guard requires approved membership and a mapped event store',()=>{
 const sql=fs.readFileSync(new URL('./supabase/migrations/202610150001_cms_membership.sql',import.meta.url),'utf8');
 assert.match(sql,/raw_app_meta_data->>'helper_cms_signup'/);assert.match(sql,/new\.banned_until :=/);
 assert.match(sql,/as restrictive for all/);assert.match(sql,/new\.branch_name=any\(m\.stores\)/);
 assert.match(sql,/revoke all on function public\.helper_cms_take_rate_limit/);
});

test('administrator IDs map to an isolated address namespace and existing email login is preserved',()=>{
 const source=fs.readFileSync(new URL('./cms-membership-ui.js',import.meta.url),'utf8');
 const context=vm.createContext({});vm.runInContext(source,context);
 assert.equal(context.adminLoginEmail('helperadmin01'),'admin-helperadmin01@admins.kioskhelper.invalid');
 assert.equal(context.adminLoginEmail(' existing@example.com '),'existing@example.com');
 for(const input of ['ab','../admin','AABB','한글관리자','a b c'])assert.throws(()=>context.adminLoginEmail(input));
});
test('only an authenticated current administrator may create another administrator',async()=>{
 const body={action:'create-admin',adminId:'helperadmin01',password:'long-test-password',role:'admin'};
 for(const [f,token,status] of [[fixture({admin:true}),'anon',401],[fixture(),'staff-token',403]]){
  assert.equal((await f.run(body,token)).status,status);
  assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));
 }
 const f=fixture({admin:true,sourceError:true});const result=await f.run({...body,created_by:'attacker'},'admin-token');
 assert.deepEqual(result,{status:200,body:{adminId:'helperadmin01',status:'created'}});
 const create=f.calls.find(x=>x.path.endsWith('/admin/users'));
 assert.equal(create.body.email,'admin-helperadmin01@admins.kioskhelper.invalid');
 assert.deepEqual(create.body.app_metadata,{helper_admin_signup:'v1',admin_id:'helperadmin01',created_by:id});
 assert.equal(create.body.user_metadata.role,undefined);assert.equal(result.body.session,undefined);
});
test('invalid administrator IDs, weak passwords and rate limiting prevent Auth account creation',async()=>{
 for(const body of [{adminId:'Abcd',password:'long-test-password'},{adminId:'helperadmin01',password:'short'}]){
  const f=fixture({admin:true});assert.equal((await f.run({action:'create-admin',...body},'admin-token')).status,400);
  assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));
 }
 const f=fixture({admin:true,rate:false});assert.equal((await f.run({action:'create-admin',adminId:'helperadmin01',password:'long-test-password'},'admin-token')).status,429);
 assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));
});
