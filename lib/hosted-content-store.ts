import { randomUUID } from 'node:crypto';
import { contentSchema, savedContentSchema, type SiteContent, type SavedContent } from './content-schema.ts';
import { defaultContent } from './default-content.ts';
import { ContentConflict } from './content-store.ts';
import { redisCommand, storagePrefix } from './redis-store.ts';

const initial = (): SavedContent => ({ revision: 'initial', updatedAt: null, content: structuredClone(defaultContent) });

export function createHostedContentStore() {
  const key = () => `${storagePrefix()}:site-content`;
  async function read(): Promise<SavedContent> {
    const value = await redisCommand(['GET', key()]);
    if (value === null) return initial();
    if (typeof value !== 'string') throw new Error('Saved content could not be read.');
    return savedContentSchema.parse(JSON.parse(value));
  }
  async function save(content: SiteContent, revision: string): Promise<SavedContent> {
    const next = { revision: randomUUID(), updatedAt: new Date().toISOString(), content: contentSchema.parse(content) };
    // Compare the revision, preserve a backup, and publish the new content in
    // one Redis transaction. Concurrent Vercel functions cannot overwrite edits.
    const script = `local previous = redis.call('GET', KEYS[1])
      local revision = 'initial'
      if previous then revision = cjson.decode(previous).revision end
      if revision ~= ARGV[1] then return 0 end
      redis.call('SET', KEYS[2], previous or ARGV[3])
      redis.call('SET', KEYS[1], ARGV[2])
      return 1`;
    const result = await redisCommand(['EVAL', script, 2, key(), `${key()}:backup`, revision, JSON.stringify(next), JSON.stringify(initial())]);
    if (result === 0) throw new ContentConflict('This content changed in another tab. Reload the saved version before editing again.');
    if (result !== 1) throw new Error('Content was not saved.');
    return next;
  }
  return { read, save };
}
