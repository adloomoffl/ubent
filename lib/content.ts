import 'server-only';
import path from 'node:path';
import { createContentStore } from './content-store';
export const contentStore = createContentStore(path.join(process.cwd(), 'data'));
