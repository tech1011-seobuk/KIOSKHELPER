import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const read=n=>fs.readFileSync(new URL(n,import.meta.url),'utf8');
const context=vm.createContext({});vm.runInContext(read('dashboard.js')+';globalThis.api=HelperDashboard;',context);const {model,esc}=context.api;
const now=Date.parse('2026-10-19T03:00:00Z');
const profiles=[{id:'u',role:'staff',display_name:'점주'},{id:'a',role:'admin'},{id:'v',role:'demo'}];
let nextId=0;
const event=(type,attempt='one',outcome=null,extra={})=>({id:++nextId,user_id:'u',brand:'photoism',device:'카메라',symptom_id:'CAM-3',branch_name:'지점 A',event_type:type,detail:attempt?JSON.stringify({v:2,attempt}):null,outcome,created_at:'2026-10-19T01:00:00Z',...extra});
const after=(type,id,outcome,extra={})=>event(type,id,outcome,{created_at:'2026-10-19T02:00:00Z',...extra});
test('dashboard counts one final result per attempt and includes info only in response coverage',()=>{
 const es=[event('symptom_click','x'),event('symptom_click','x'),after('symptom_outcome','x','escalate'),after('symptom_outcome','x','solved',{created_at:'2026-10-19T02:30:00Z'}),event('symptom_click','y'),after('symptom_outcome','y','info'),event('symptom_click','z')];
 const m=model(es,profiles,{},now);assert.equal(m.attempts.length,3);assert.equal(m.counts.solved,1);assert.equal(m.counts.escalate,0);assert.equal(m.rate,100);assert.equal(m.responseRate,66.7);assert.equal(m.counts.pending,1);
});
test('dashboard keeps legacy outcomes separate and never estimates missing outcomes by subtraction',()=>{
 const m=model([event('symptom_click',null),event('symptom_outcome',null,'info'),event('symptom_outcome',null,'escalate')],profiles,{days:'all'},now);
 assert.equal(m.attempts.length,0);assert.equal(m.rate,null);assert.equal(m.responseRate,null);assert.equal(m.counts.pending,0);assert.equal(m.legacy.length,2);assert.equal(m.unpairedStarts,1);
});
test('dashboard rejects outcomes without starts, wrong brands and wrong symptoms',()=>{
 const m=model([event('symptom_click'),after('symptom_outcome','one','solved',{brand:'snapism'}),after('symptom_outcome','one','as',{symptom_id:'CAM-1'}),after('symptom_outcome','missing','solved')],profiles,{},now);
 assert.equal(m.counts.pending,1);assert.equal(m.decided,0);
});
test('dashboard cohort follows start date; later results do not create new starts',()=>{
 const es=[event('symptom_click','old',null,{created_at:'2026-09-01T00:00:00Z'}),after('symptom_outcome','old','solved'),event('symptom_click','new'),after('symptom_outcome','new','as')];
 const m=model(es,profiles,{days:'7'},now);assert.equal(m.attempts.length,1);assert.equal(m.counts.as,1);assert.equal(m.counts.solved,0);
});
test('dashboard defaults to members, permits explicit admin inclusion and always excludes viewing users',()=>{
 const es=['u','a','v','unknown'].map(user_id=>event('symptom_click','same',null,{user_id}));
 assert.equal(model(es,profiles,{},now).attempts.length,1);assert.equal(model(es,profiles,{audience:'all'},now).attempts.length,3);
});
test('dashboard keeps brand and device statistics separate',()=>{
 const es=[event('symptom_click','a'),event('symptom_click','b',null,{brand:'snapism'}),event('symptom_click','c',null,{device:'PC'})];
 assert.equal(model(es,profiles,{},now).symptoms.length,3);assert.equal(model(es,profiles,{brand:'photoism',device:'카메라'},now).attempts.length,1);
});
test('dashboard review candidates need enough results and are not triggered by AS or unanswered visits',()=>{
 const es=[];for(let i=0;i<10;i++){es.push(event('symptom_click','a'+i),after('symptom_outcome','a'+i,'as'));}
 assert.equal(model(es,profiles,{},now).priorities.length,0);
 es.push(after('symptom_outcome','a0','escalate',{created_at:'2026-10-19T02:30:00Z'}));assert.equal(model(es,profiles,{},now).priorities.length,1);
 assert.equal(model(es.slice(0,18).concat(es.at(-1)),profiles,{},now).priorities.length,0);
});
test('dashboard uses historical branch attribution and excludes feedback from click counts',()=>{
 const m=model([event('device_click',null,null,{branch_name:'옛 지점'}),event('device_click',null,null,{branch_name:null}),event('feedback',null,null,{feedback:'어려워요'})],[{id:'u',role:'staff',branch_name:'새 지점'}],{},now);
 assert.equal(m.clicks.length,2);assert.equal(m.branchRows.get('옛 지점'),1);assert.equal(m.branchRows.has('새 지점'),false);assert.equal(m.unknownBranch,1);assert.equal(m.feedback.length,1);
});
test('dashboard hours use Korea time regardless of the browser timezone',()=>{
 const m=model([event('device_click',null,null,{created_at:'2026-10-18T16:00:00Z'})],profiles,{},now);assert.equal(m.hours[1],1);assert.equal(m.daily.at(-1).count,1);
});
test('dashboard ignores invalid dates/future events and unknown outcome types',()=>{
 const m=model([event('symptom_click'),after('symptom_outcome','one','bogus'),event('device_click',null,null,{created_at:'invalid'}),event('device_click',null,null,{created_at:'2027-01-01'})],profiles,{},now);
 assert.equal(m.period.length,2);assert.equal(m.counts.pending,1);
});
test('dashboard excludes both current demo accounts and converted viewing accounts without excluding OPS admins',()=>{
 const ps=[{id:'d',role:'staff',email:'demo-team@demos.kioskhelper.invalid'},{id:'c',role:'staff',email:'admin-helperadmin01@admins.kioskhelper.invalid'},{id:'o',role:'admin',email:'admin-opsadmin01@admins.kioskhelper.invalid'}];
 const es=ps.map(p=>event('symptom_click',p.id,null,{user_id:p.id}));const m=model(es,ps,{audience:'all'},now);assert.equal(m.attempts.length,1);assert.equal(m.attempts[0].user_id,'o');assert.equal(m.inactive.length,0);
});
test('dashboard reports CMS movement separately from contact guidance and limits 7-day charts',()=>{
 const m=model([event('symptom_click'),after('symptom_outcome','one','escalate'),after('support_click','one')],profiles,{days:'7'},now);assert.equal(m.support,1);assert.equal(m.counts.escalate,1);assert.equal(m.daily.length,7);
});
test('dashboard escapes account, guide and feedback markup',()=>{assert.equal(esc('<img src=x onerror="bad">'), '&lt;img src=x onerror=&quot;bad&quot;&gt;');});
test('dashboard source is included in generated page and keeps admin authorization',()=>{
 const html=read('index.html');assert.equal(html.split('/* BALANCED DASHBOARD START */')[1]?.split('/* BALANCED DASHBOARD END */')[0].trim(),read('dashboard.js').trim());
 assert.match(html,/function renderAdminDashboardContent[\s\S]{0,180}currentUser.role !== 'admin'/);
 for(const id of ['cmsApprovalsBtn','accountCreateBtn','csvExportBtn'])assert.ok(html.includes('id="'+id+'"'));
 assert.match(read('package.json'),/dashboard.test.mjs/);
});
