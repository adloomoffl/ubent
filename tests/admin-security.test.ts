import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { ADMIN_EMAIL,isAllowedGoogleAccount,isAdminSession,isLocalOrigin } from '../lib/admin-policy.ts';
import { contentSchema } from '../lib/content-schema.ts';
import { defaultContent } from '../lib/default-content.ts';
import { createContentStore,ContentConflict } from '../lib/content-store.ts';

const identity = {email:ADMIN_EMAIL,email_verified:true,sub:'google-subject-123'};
test('only the verified target Google identity is accepted',()=>{
  assert.equal(isAllowedGoogleAccount('google',identity),true);
  assert.equal(isAllowedGoogleAccount('google',{...identity,email:ADMIN_EMAIL.toUpperCase()}),true);
  for(const email of ['someone@gmail.com','ubentertainments2026+admin@gmail.com','ubentertainments2026@gmail.com.evil.test','ubentertainments2026@googlemail.com',' '+ADMIN_EMAIL]) {
    assert.equal(isAllowedGoogleAccount('google',{...identity,email}),false);
  }
});
test('unverified or incomplete Google claims and other providers fail closed',()=>{
  for(const value of [false,'true',undefined,null]) assert.equal(isAllowedGoogleAccount('google',{...identity,email_verified:value}),false);
  assert.equal(isAllowedGoogleAccount('credentials',identity),false);
  assert.equal(isAllowedGoogleAccount('google',{...identity,sub:''}),false);
  assert.equal(isAllowedGoogleAccount('google',null),false);
  assert.equal(isAllowedGoogleAccount(undefined,identity),false);
});
test('admin session requires both the trusted admin flag and exact email',()=>{
  assert.equal(isAdminSession({admin:true,authMethod:'google',user:{email:ADMIN_EMAIL}}),true);
  assert.equal(isAdminSession({admin:true,authMethod:'password',user:{name:'ubentertainment'}}),true);
  assert.equal(isAdminSession({admin:true,user:{name:'ubentertainment'}}),false);
  assert.equal(isAdminSession({admin:true,authMethod:'password',user:{name:'other'}}),false);
  assert.equal(isAdminSession({user:{email:ADMIN_EMAIL}}),false);
  assert.equal(isAdminSession({admin:'true',user:{email:ADMIN_EMAIL}}),false);
  assert.equal(isAdminSession({admin:true,user:{email:'someone@gmail.com'}}),false);
  assert.equal(isAdminSession(null),false);
});
test('writes reject missing and cross-site origins',()=>{
  assert.equal(isLocalOrigin('http://localhost:3001'),true);
  for(const origin of [null,'null','https://evil.test','http://localhost:3001.evil.test','http://localhost:3000','http://127.0.0.1:3001']) assert.equal(isLocalOrigin(origin),false);
});
test('content rejects script URLs, traversal, unsupported local files, and unexpected fields',()=>{
  assert.equal(contentSchema.safeParse(defaultContent).success,true);
  for(const image of ['javascript:alert(1)','data:text/html,test','//evil.test/pic.jpg','/assets/../../.env.local','/assets/test.svg','/api/admin/content','http://example.com/image.jpg']) {
    const draft=structuredClone(defaultContent);draft.hero.image=image;
    assert.equal(contentSchema.safeParse(draft).success,false,image);
  }
  assert.equal(contentSchema.safeParse({...defaultContent,admin:true}).success,false);
});
test('content validates size, dates, unique IDs and contact protocols',()=>{
  const draft=structuredClone(defaultContent);
  draft.news[0].date='2026-02-31';assert.equal(contentSchema.safeParse(draft).success,false);
  draft.news[0].date='2026-02-28';draft.contact.instagram='javascript:alert(1)';assert.equal(contentSchema.safeParse(draft).success,false);
  draft.contact.instagram='https://www.instagram.com/example/';draft.contact.whatsapp='invalid-phone#%';assert.equal(contentSchema.safeParse(draft).success,false);
  draft.contact.whatsapp='+91 98765 43210';assert.equal(contentSchema.safeParse(draft).success,true);
  draft.hero.line1='x'.repeat(161);assert.equal(contentSchema.safeParse(draft).success,false);
  draft.hero.line1='Stories';draft.gallery.items.push(draft.gallery.items[0]);assert.equal(contentSchema.safeParse(draft).success,false);
});

async function fixture(){
  const root=path.resolve(process.cwd(),'../../work');await mkdir(root,{recursive:true});
  const directory=await mkdtemp(path.join(root,'admin-content-test-'));
  return {directory,store:createContentStore(directory)};
}
test('content saves persist across fresh store instances and keep a backup',async()=>{
  const {directory,store}=await fixture();
  const initial=await store.read();assert.equal(initial.revision,'initial');
  const draft=structuredClone(initial.content);draft.about.lead='A persistence test.';
  const next=await store.save(draft,initial.revision);
  assert.notEqual(next.revision,'initial');
  assert.equal((await createContentStore(directory).read()).content.about.lead,'A persistence test.');
  assert.equal(JSON.parse(await readFile(path.join(directory,'site-content.backup.json'),'utf8')).revision,'initial');
});
test('stale edits cannot overwrite a newer save',async()=>{
  const {store}=await fixture();
  const first=await store.save(structuredClone(defaultContent),'initial');
  await assert.rejects(store.save(structuredClone(defaultContent),'initial'),ContentConflict);
  assert.equal((await store.read()).revision,first.revision);
});
test('concurrent saves cannot silently overwrite one another',async()=>{
  const {store}=await fixture();
  const attempts=await Promise.allSettled([store.save(structuredClone(defaultContent),'initial'),store.save(structuredClone(defaultContent),'initial')]);
  assert.equal(attempts.filter(result=>result.status==='fulfilled').length,1);
  assert.equal(attempts.filter(result=>result.status==='rejected').length,1);
});
test('corrupt saved data is reported instead of silently replaced',async()=>{
  const {directory,store}=await fixture();
  await writeFile(path.join(directory,'site-content.json'),'{invalid');
  await assert.rejects(store.read());
  await assert.rejects(store.save(structuredClone(defaultContent),'initial'));
  assert.equal(await readFile(path.join(directory,'site-content.json'),'utf8'),'{invalid');
});
