import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=file=>fs.readFileSync(new URL(file,import.meta.url),'utf8');
const html=read('index.html');
test('production build keeps CMS signup, admin entry, approval and store selection together',()=>{
 assert.match(html,/const APP_ENV = 'production'/);
 assert.match(html,/https:\/\/lsetixbyarexggxsihen\.supabase\.co/);
 assert.doesNotMatch(html,/mjzhljlhjsbnnxyekmwy|새 회원가입을 준비 중입니다/);
 assert.equal(html.split('/* CMS MEMBERSHIP START */')[1]?.split('/* CMS MEMBERSHIP END */')[0].trim(),read('cms-membership-ui.js').trim());
 for(const text of ['renderCmsAuthScreen();return;','appState = cmsNextScreen();',"appState === 'storeSelect') renderStoreSelection()","appState === 'cmsApprovals') renderCmsApprovals()",'id="cmsApprovalsBtn"','id="accountCreateBtn"'])assert.ok(html.includes(text),text);
 for(const script of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi))new vm.Script(script[1]);
});
test('membership failures fail closed and store-specific events preserve viewing-account exclusions',()=>{
 const profile=html.slice(html.indexOf('async function loadProfile('),html.indexOf('function updateUserInfoBar('));
 assert.match(profile,/currentUser=null/);assert.match(profile,/if\(error\|\|!data\)throw/);
 assert.match(profile,/cmsRequest\('session'\)/);assert.match(profile,/cmsChooseInitialStore/);
 const event=html.slice(html.indexOf('async function logEvent('),html.indexOf('async function logEvent(')+1000);
 assert.match(event,/currentUser\?\.role==='demo'\)return/);assert.match(event,/currentUser.cmsId && !currentUser.branchName/);assert.match(event,/branch_name: currentUser.branchName/);
 assert.match(html,/currentUser\?\.role==='demo'&&\['accountCreate'/);
});
test('first troubleshooting step keeps the greeting and top-of-page entry',()=>{
 const chat=html.slice(html.indexOf('function renderChat(){'),html.indexOf('function renderChat(){')+2200);
 assert.match(chat,/안녕하세요, 점주님\. 키오스크 챗봇입니다\./);
 assert.match(chat,/path.length===1&&!first.chosen/);
 assert.match(chat,/area.scrollTop=0/);
 assert.match(html,/\/\* EDITABLE MANUALS START \*\//);
 assert.match(html,/camera-after-replacement/);
});
test('production workflows deploy production code and include membership regression checks',()=>{
 for(const name of ['.github/workflows/apply-production.yml','.github/workflows/deploy-current-production.yml']){
  const workflow=read(name);assert.doesNotMatch(workflow,/repository: tech1011-seobuk\/kioskhelper-staging|node prepare-production/);
  assert.match(workflow,/npm test/);assert.match(workflow,/Package public production files/);
 }
 const script=JSON.parse(read('package.json')).scripts.test;
 for(const name of ['cms-membership.test.mjs','cms-mapping.test.mjs','production-contract.test.mjs'])assert.ok(script.includes(name));
});
