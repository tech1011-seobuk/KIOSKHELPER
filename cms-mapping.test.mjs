import test from 'node:test';
import assert from 'node:assert/strict';
import {sha256, parseManifest, parseMapping, matchCmsId, createMappingService, createS3Reader, CMS_S3} from './supabase/functions/_shared/cms-mapping.mjs';
const enc = new TextEncoder();
const xml = rows => enc.encode('<?xml version="1.0" encoding="UTF-8"?>\n<user_store_list>\n' + rows.map(([id,store]) => `  <item><user_id>${id}</user_id><store_name>${store}</store_name></item>`).join('\n') + '\n</user_store_list>');
const manifest = async bytes => ({hash:await sha256(bytes),rowCount:(new TextDecoder().decode(bytes).match(/<item>/g)||[]).length});
test('mapping preserves CMS identity, leading zeros, entities and every mapped store',async()=>{
  const bytes=xml([['001','서울 &amp; 경기'],['001','부산'],['001','부산'],['ABC','대전']]);
  const data=await parseMapping(bytes,await manifest(bytes));
  assert.deepEqual(matchCmsId(data,' 001 ').stores,['부산','서울 & 경기']);
  assert.equal(matchCmsId(data,'001').cmsId,'001');
  assert.throws(()=>matchCmsId(data,'abc'),/CMS_ID_NOT_FOUND/);
});
test('source whitespace collisions are never silently merged',async()=>{
  const bytes=xml([['one','A'],['one ','B'],[' two','C']]);
  const data=await parseMapping(bytes,await manifest(bytes));
  for(const id of ['one','two'])assert.throws(()=>matchCmsId(data,id),/CMS_ID_NEEDS_REVIEW/);
});
test('source store names may contain XML whitespace without changing their identity',async()=>{
 const bytes=xml([['001','서울\t테스트점']]);
 const data=await parseMapping(bytes,await manifest(bytes));
 assert.equal(matchCmsId(data,'001').stores[0],'서울\t테스트점');
});
test('mapping rejects bad hash, record count, malformed schema and entities',async()=>{
  const bytes=xml([['001','서울']]);
  await assert.rejects(parseMapping(bytes,{hash:'0'.repeat(64),rowCount:1}),/CMS_HASH_MISMATCH/);
  await assert.rejects(parseMapping(bytes,{...await manifest(bytes),rowCount:2}),/CMS_COUNT_MISMATCH/);
  for(const text of ['<users><user/></users>','<!DOCTYPE a [<!ENTITY x "y">]><user_store_list/>','<user_store_list><item><user_id>x</user_id><store_name>A</store_name><role>admin</role></item></user_store_list>']){
    const invalid=enc.encode(text); await assert.rejects(parseMapping(invalid,{hash:await sha256(invalid),rowCount:1}));
  }
  assert.throws(()=>parseManifest(enc.encode(JSON.stringify({dataSha256:'0'.repeat(64),rowCount:1}))),/CMS_MANIFEST_INVALID/);
});
test('lookup refreshes mapping and fails closed on outage instead of serving stale stores',async()=>{
  let bytes=xml([['001','A']]), unavailable=false, reads=0;
  const service=createMappingService(async path=>{
    if(unavailable)throw new Error('unavailable');
    if(path===CMS_S3.xml){reads++;return bytes;}
    return enc.encode(JSON.stringify({xmlSha256:await sha256(bytes),rowCount:1}));
  });
  assert.deepEqual((await service.lookup('001')).stores,['A']);
  await service.lookup('001'); assert.equal(reads,1);
  bytes=xml([['001','B']]); assert.deepEqual((await service.lookup('001')).stores,['B']);
  unavailable=true; await assert.rejects(service.lookup('001'),/unavailable/);
});
test('S3 reader only signs the two read-only object requests',async()=>{
  const requests=[];
  const read=createS3Reader({accessKeyId:'example',secretAccessKey:'example',fetchImpl:async(url,options)=>{requests.push({url,options});return new Response('ok');}});
  await read(CMS_S3.manifest); await assert.rejects(read('/elsewhere'),/CMS_PATH_NOT_ALLOWED/);
  assert.equal(requests.length,1); assert.equal(requests[0].options.method,'GET');
  assert.equal(requests[0].options.redirect,'error');
  assert.match(requests[0].options.headers.authorization,/AWS4-HMAC-SHA256/);
});
