import 'server-only';
import path from 'node:path';
import { createContentStore } from './content-store';
import { createHostedContentStore } from './hosted-content-store';
export const contentStore = process.env.VERCEL ? createHostedContentStore() : createContentStore(path.join(process.cwd(), 'data'));

