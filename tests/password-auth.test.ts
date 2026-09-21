import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import path from 'node:path';
import {hashPassword,verifyPassword,validPasswordHash,authenticatePassword,LOGIN_WINDOW_MS} from '../lib/password-auth.ts';
const testPassword=randomBytes(24).toString('base64url');
const hash=await hashPassword(testPassword);
test('salted hashes verify the password and reject incorrect input',async()=>{
  assert.equal(validPasswordHash(hash),true);
  assert.equal(hash.includes(testPassword),false);
  assert.equal(await verifyPassword(testPassword,hash),true);
  assert.equal(await verifyPassword('incorrect',hash),false);
  assert.equal(await verifyPassword(testPassword,'invalid'),false);
  assert.notEqual(await hashPassword(testPassword),hash);
});
test('persistent throttling limits all usernames and recovers after the cooldown',async()=>{
  const root=path.resolve(process.cwd(),'../../work');await mkdir(root,{recursive:true});
  const directory=await mkdtemp(path.join(root,'password-test-'));
  const config={username:'ubentertainment',hash,directory};const now=1000000;
  for(let attempt=0;attempt<5;attempt++) assert.equal(await authenticatePassword({username:'wrong-'+attempt,password:testPassword},config,now+attempt),false);
  assert.equal(await authenticatePassword({username:'ubentertainment',password:testPassword},config,now+6),false);
  // New config instance reads the same state on disk; process restarts do not reset it.
  assert.equal(await authenticatePassword({username:'ubentertainment',password:testPassword},{...config},now+7),false);
  assert.equal(await authenticatePassword({username:'ubentertainment',password:testPassword},config,now+LOGIN_WINDOW_MS+10),true);
});
