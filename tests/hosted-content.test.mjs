import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createHostedContentStore } from '../lib/hosted-content-store.ts';
import { ContentConflict } from '../lib/content-store.ts';
import { defaultContent } from '../lib/default-content.ts';
import { isPublishedImage } from '../lib/media-policy.ts';

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
after(() => { globalThis.fetch = originalFetch; process.env = originalEnv; });

test('hosted content validates input, preserves revisions, and uses an atomic save with backup', async () => {
  process.env.KV_REST_API_URL = 'https://test.upstash.io';
  process.env.KV_REST_API_TOKEN = 'test-only-token';
  let stored = null;
  let backup = null;
  globalThis.fetch = async (_url, options) => {
    const command = JSON.parse(options.body);
    if (command[0] === 'GET') return Response.json({ result: stored });
    assert.equal(command[0], 'EVAL');
    assert.match(command[1], /cjson.decode/);
    assert.match(command[1], /KEYS\[2\]/);
    const expected = stored ? JSON.parse(stored).revision : 'initial';
    if (command[5] !== expected) return Response.json({ result: 0 });
    backup = stored ?? command[7];
    stored = command[6];
    return Response.json({ result: 1 });
  };
  const store = createHostedContentStore();
  const initial = await store.read();
  assert.equal(initial.revision, 'initial');
  const saved = await store.save(initial.content, initial.revision);
  assert.deepEqual((await store.read()).content, defaultContent);
  assert.notEqual(saved.revision, initial.revision);
  assert.equal(JSON.parse(backup).revision, 'initial');
  await assert.rejects(() => store.save(initial.content, initial.revision), ContentConflict);
  await assert.rejects(() => store.save({}, saved.revision));
  stored = '{broken';
  await assert.rejects(() => store.read());
  globalThis.fetch = async () => { throw new Error('offline'); };
  await assert.rejects(() => store.save(initial.content, saved.revision));
});

test('draft image URLs are private until explicitly selected in saved content', () => {
  const content = structuredClone(defaultContent);
  const image = '/media/00000000-0000-0000-0000-000000000001.webp';
  assert.equal(isPublishedImage(content, image), false);
  content.gallery.items[0].image = image;
  assert.equal(isPublishedImage(content, image), true);
  content.gallery.items[0].image = '/assets/film-crew.jpg';
  assert.equal(isPublishedImage(content, image), false);
});
