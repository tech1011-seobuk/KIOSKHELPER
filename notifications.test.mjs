import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('./notifications-ui.js',import.meta.url),'utf8');
function harness(rpc){const c=vm.createContext({currentUser:{id:'a'},sb:{rpc},document:{getElementById(){return null;}}});vm.runInContext(source,c);vm.runInContext("helperInboxOwner='a'",c);return c;}
test('only unread and unanswered notifications count towards badge',()=>{const c=harness();assert.equal(c.helperInboxUnread([{read_at:null,response:null},{read_at:'date'},{read_at:null,response:'solved'}]),1);});
test('an old account response cannot populate the new account inbox',async()=>{let finish;const c=harness(()=>new Promise(r=>finish=r));const pending=c.helperInboxRefresh();vm.runInContext("currentUser={id:'b'};helperInboxOwner='b';helperInboxEpoch++",c);finish({data:{items:[{id:'private-a'}]}});await pending;assert.equal(vm.runInContext('helperInboxItems.length',c),0);});
test('opening while a fetch is pending awaits that fetch rather than displaying empty state',async()=>{let finish,calls=0;const c=harness(()=>{calls++;return new Promise(r=>finish=r);});const first=c.helperInboxRefresh();const second=c.helperInboxRefresh();finish({data:{items:[{id:'reply'}]}});await Promise.all([first,second]);assert.equal(calls,1);assert.equal(vm.runInContext('helperInboxItems[0].id',c),'reply');});
test('server errors remain distinguishable from an empty inbox',async()=>{const c=harness(async()=>({error:{message:'offline'}}));await c.helperInboxRefresh();assert.equal(vm.runInContext('helperInboxError',c),true);assert.equal(vm.runInContext('helperInboxBusy',c),false);});
test('failed actions do not pretend to acknowledge a notification',async()=>{const c=harness(async()=>({error:new Error('offline')}));await assert.rejects(c.helperInboxAction({id:'n'},'read'));assert.equal(vm.runInContext('helperInboxItems.length',c),0);});
