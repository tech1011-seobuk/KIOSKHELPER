import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createMembershipHandler} from './supabase/functions/_shared/cms-membership.mjs';
import {sha256} from './supabase/functions/_shared/cms-mapping.mjs';
const id='00000000-0000-4000-8000-000000000001';
function fixture({status='approved',admin=false,missing=false,rate=true,sourceError=false,loginUser=id,demo=false,demoActive=true,authError=null,demoEmail='demo-companydemo01@demos.kioskhelper.invalid',demoIdentity=id}={}){
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
  else if(u.pathname.endsWith('/helper_demo_accounts'))response=demo?[{user_id:id,login_id:'companydemo01',active:demoActive}]:[];
  else if(u.pathname.endsWith('/token'))response={user:{id:loginUser},access_token:'test-access',refresh_token:'test-refresh'};
  else if(u.pathname.endsWith('/admin/users/'+id))response={id:demoIdentity,email:demoEmail};
  else if(u.pathname.endsWith('/admin/users')&&authError)return new Response(JSON.stringify({code:authError}),{status:authError==='email_exists'?422:500});
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

test('company demo is provisioned only by a verified admin without CMS or admin privileges',async()=>{
 const body={action:'create-demo',demoId:'companydemo01',password:'long-test-password',created_by:'attacker',role:'admin'};
 for(const [f,token,status] of [[fixture({admin:true}),'anon',401],[fixture(),'staff-token',403],[fixture({demo:true}),'demo-token',403]]){
  assert.equal((await f.run(body,token)).status,status);assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));
 }
 const f=fixture({admin:true,sourceError:true});assert.deepEqual((await f.run(body,'admin-token')).body,{demoId:'companydemo01',status:'created'});
 const create=f.calls.find(x=>x.path.endsWith('/admin/users'));
 assert.equal(create.body.email,'demo-companydemo01@demos.kioskhelper.invalid');
 assert.deepEqual(create.body.app_metadata,{helper_demo_signup:'v1',demo_id:'companydemo01',created_by:id});
 assert.equal(create.body.user_metadata.role,undefined);assert.equal(create.body.ban_duration,undefined);
});
test('demo login and session bypass CMS mapping but require active matching identity',async()=>{
 const body={action:'login-demo',demoId:'companydemo01',password:'long-test-password'};
 const f=fixture({demo:true,sourceError:true});assert.equal((await f.run(body)).status,200);
 assert.deepEqual((await f.run({action:'session'},'demo-token')).body,{admin:false,demo:true,demoId:'companydemo01'});
 assert.ok(!f.calls.some(x=>x.path.endsWith('/helper_cms_memberships')));
 for(const options of [{demo:true,demoActive:false},{demo:false},{demo:true,loginUser:'someone-else'}]){
  assert.equal((await fixture(options).run(body)).status,401);
 }
 assert.equal((await fixture({demo:true,demoActive:false}).run({action:'session'},'demo-token')).status,403);
});
test('upstream database failures are not mislabeled as duplicate IDs',async()=>{
 const body={action:'create-demo',demoId:'companydemo01',password:'long-test-password'};
 assert.deepEqual(await fixture({admin:true,authError:'email_exists'}).run(body,'admin-token'),{status:409,body:{error:'ADMIN_ID_TAKEN'}});
 assert.deepEqual(await fixture({admin:true,authError:'unexpected_failure'}).run(body,'admin-token'),{status:503,body:{error:'ADMIN_CREATE_FAILED'}});
});

test('converted company accounts keep their credentials without accepting mismatched Auth identities',async()=>{
 const body={action:'login-demo',demoId:'companydemo01',password:'long-test-password',email:'attacker@example.test'};
 const f=fixture({demo:true,demoEmail:'admin-companydemo01@admins.kioskhelper.invalid'});
 assert.equal((await f.run(body)).status,200);
 assert.equal(f.calls.find(x=>x.path.endsWith('/token')).body.email,'admin-companydemo01@admins.kioskhelper.invalid');
 for(const options of [{demoEmail:'someone@example.test'},{demoIdentity:'another-user'}]){
  const rejected=fixture({demo:true,...options});assert.equal((await rejected.run(body)).status,401);
  assert.ok(!rejected.calls.some(x=>x.path.endsWith('/token')));
 }
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

function managedLoginFixture({membership={admin:true},authError=null,sessionError=null,membershipError=false}={}){
 const calls=[],user={id,email:'existing@example.test'};
 const context=vm.createContext({sb:{auth:{
  async signInWithPassword(values){calls.push({action:'password',email:values.email});return authError?{data:null,error:{code:authError}}:{data:{user},error:null};},
  async setSession(session){calls.push({action:'setSession'});return{data:{user},error:sessionError};},
  async signOut(){calls.push({action:'signOut'});}
 }}});
 vm.runInContext(fs.readFileSync(new URL('./cms-membership-ui.js',import.meta.url),'utf8'),context);
 context.cmsRequest=async(action,values)=>{calls.push({action,values});if(action==='login-demo')return{session:{access_token:'test',refresh_token:'test'}};if(membershipError)throw Error('inactive');return membership;};
 return{calls,user,login:(identity='helperadmin01')=>context.signInManagedAccount(identity,'fixture-password')};
}

test('one managed login accepts existing administrators and converted viewing accounts without changing roles',async()=>{
 for(const membership of [{admin:true},{demo:true,demoId:'helperadmin01'}]){
  const f=managedLoginFixture({membership});assert.equal(await f.login(),f.user);
  assert.deepEqual(f.calls.map(x=>x.action),['password','session']);
  assert.equal(membership.role,undefined);
 }
 const admin=managedLoginFixture();await admin.login('existing@example.test');assert.equal(admin.calls[0].email,'existing@example.test');
});

test('new viewing accounts use the server demo resolver after a namespace credential mismatch',async()=>{
 const f=managedLoginFixture({authError:'invalid_credentials',membership:{demo:true,demoId:'companydemo01'}});
 assert.equal(await f.login('companydemo01'),f.user);
 assert.deepEqual(f.calls.map(x=>x.action),['password','login-demo','setSession','session']);
 assert.equal(f.calls[1].values.demoId,'companydemo01');
});

test('managed login rejects CMS-only and inactive accounts and clears their authenticated session',async()=>{
 for(const options of [{membership:{cmsId:'0001',stores:['서울']}},{membership:{}},{membershipError:true}]){
  const f=managedLoginFixture(options);await assert.rejects(f.login());
  assert.equal(f.calls.at(-1).action,'signOut');
 }
});

test('managed login does not retry network, rate-limit, or email credential failures as demo login',async()=>{
 for(const code of ['over_request_rate_limit','request_timeout']){
  const f=managedLoginFixture({authError:code});await assert.rejects(f.login());assert.equal(f.calls.length,1);
 }
 const email=managedLoginFixture({authError:'invalid_credentials'});await assert.rejects(email.login('existing@example.test'));assert.equal(email.calls.length,1);
 const set=managedLoginFixture({authError:'invalid_credentials',sessionError:{message:'failed'}});await assert.rejects(set.login());assert.ok(!set.calls.some(x=>x.action==='session'));
});

test('published membership UI matches its source and has only one managed login entry',()=>{
 const source=fs.readFileSync(new URL('./cms-membership-ui.js',import.meta.url),'utf8');
 const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
 const embedded=html.split('/* CMS MEMBERSHIP START */')[1].split('/* CMS MEMBERSHIP END */')[0].trim();
 assert.equal(embedded,source.trim());assert.doesNotMatch(source,/authDemoBtn|체험용 로그인/);
 assert.match(source,/id="authAdminBtn">관리자 로그인/);
});
test('retired administrator creation cannot grant privileges, even from stale authenticated clients',async()=>{
 const body={action:'create-admin',adminId:'helperadmin01',password:'long-test-password',role:'admin'};
 for(const [f,token] of [[fixture({admin:true}),'anon'],[fixture(),'staff-token'],[fixture({demo:true}),'demo-token'],[fixture({admin:true}),'admin-token']]){
  assert.deepEqual(await f.run(body,token),{status:410,body:{error:'ADMIN_CREATION_DISABLED'}});
  assert.equal(f.calls.length,0);
 }
});
test('invalid account IDs, weak passwords and rate limiting prevent Auth account creation',async()=>{
 for(const body of [{demoId:'Abcd',password:'long-test-password'},{demoId:'companydemo01',password:'short'}]){
  const f=fixture({admin:true});assert.equal((await f.run({action:'create-demo',...body},'admin-token')).status,400);
  assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));
 }
 const f=fixture({admin:true,rate:false});assert.equal((await f.run({action:'create-demo',demoId:'companydemo01',password:'long-test-password'},'admin-token')).status,429);
 assert.ok(!f.calls.some(x=>x.path.endsWith('/admin/users')));
});
