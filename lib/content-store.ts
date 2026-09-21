import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { savedContentSchema, contentSchema, type SiteContent, type SavedContent } from './content-schema.ts';
import { defaultContent } from './default-content.ts';
export class ContentConflict extends Error {}

export function createContentStore(directory: string) {
  const filename = path.join(directory, 'site-content.json');
  async function read(): Promise<SavedContent> {
    try { return savedContentSchema.parse(JSON.parse(await readFile(filename, 'utf8'))); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { revision:'initial',updatedAt:null,content:structuredClone(defaultContent) };
      throw error;
    }
  }
  async function save(content: SiteContent, revision: string): Promise<SavedContent> {
    const validated = contentSchema.parse(content);
    await mkdir(directory, { recursive:true });
    const lockPath = path.join(directory, 'site-content.lock');
    let lock;
    try { lock = await open(lockPath, 'wx'); }
    catch (error) { if ((error as NodeJS.ErrnoException).code === 'EEXIST') throw new ContentConflict('Another save is in progress. Try again.'); throw error; }
    const temporary = path.join(directory, `${randomUUID()}.tmp`);
    try {
      const previous = await read();
      if (previous.revision !== revision) throw new ContentConflict('This content changed in another tab. Reload the saved version before editing again.');
      const next = { revision:randomUUID(),updatedAt:new Date().toISOString(),content:validated };
      await writeFile(path.join(directory,'site-content.backup.json'),JSON.stringify(previous,null,2),{mode:0o600});
      await writeFile(temporary,JSON.stringify(next,null,2),{mode:0o600});
      await rename(temporary,filename);
      return next;
    } finally {
      await lock.close();
      await unlink(lockPath);
      await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  return {read,save};
}
