import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { configuredAdminOrigin, isLocalOrigin } from '../lib/admin-policy.ts';
import { authenticateHostedPassword, redisIsConfigured } from '../lib/hosted-password.ts';
import { hashPassword } from '../lib/password-auth.ts';

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;
after(() => { process.env = originalEnv; globalThis.fetch = originalFetch; });

test('production accepts only configured HTTPS UB origin', () => {
  process.env.VERCEL = '1';
  process.env.NEXTAUTH_URL = 'https://www.ubentertainments.in';
  assert.equal(configuredAdminOrigin(), process.env.NEXTAUTH_URL);
  assert.equal(isLocalOrigin('https://www.ubentertainments.in'), true);
  assert.equal(isLocalOrigin('http://localhost:3001'), false);
  assert.equal(isLocalOrigin('https://evil.example'), false);
  for (const url of ['http://www.ubentertainments.in', 'https://evil.example', 'https://www.ubentertainments.in@evil.example', 'https://www.ubentertainments.in/admin', 'http://localhost:3001']) {
    process.env.NEXTAUTH_URL = url;
    assert.equal(configuredAdminOrigin(), null);
  }
  delete process.env.VERCEL;
  process.env.NEXTAUTH_URL = 'http://localhost:3001';
  assert.equal(configuredAdminOrigin(), process.env.NEXTAUTH_URL);
});

test('hosted login fails closed without storage or when storage is unavailable', async () => {
  delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN;
  delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
  assert.equal(redisIsConfigured(), false);
  assert.equal(await authenticateHostedPassword({ username: 'owner', password: 'example' }, { username: 'owner', hash: '' }), false);
  process.env.KV_REST_API_URL = 'https://test.upstash.io';
  process.env.KV_REST_API_TOKEN = 'test-only-token';
  globalThis.fetch = async () => { throw new Error('offline'); };
  assert.equal(await authenticateHostedPassword({ username: 'owner', password: 'example' }, { username: 'owner', hash: '' }), false);
});

test('valid login is verified and every username shares an atomic attempt budget', async () => {
  const password = 'Test password only 123';
  const hash = await hashPassword(password);
  let attempt = 0;
  const keys = [];
  globalThis.fetch = async (_url, options) => {
    assert.equal(options.cache, 'no-store');
    const command = JSON.parse(options.body);
    assert.equal(command[0], 'EVAL');
    assert.match(command[1], /INCR/); assert.match(command[1], /EXPIRE/); assert.match(command[1], /900/);
    keys.push(command[3]);
    return Response.json({ result: ++attempt });
  };
  const config = { username: 'owner', hash };
  assert.equal(await authenticateHostedPassword({ username: 'owner', password }, config), true);
  for (let n = 0; n < 4; n++) assert.equal(await authenticateHostedPassword({ username: 'unknown' + n, password }, config), false);
  assert.equal(await authenticateHostedPassword({ username: 'owner', password }, config), false);
  assert.equal(new Set(keys).size, 1);
});

