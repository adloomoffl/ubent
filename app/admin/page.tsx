import { redirect } from 'next/navigation';
import { adminSession } from '@/lib/auth';
import { contentStore } from '@/lib/content';
import Editor from './editor';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default async function Admin() {
  const session = await adminSession();
  if (!session) redirect('/admin/login');
  const saved = await contentStore.read();
  return <Editor initial={saved} email={session.user?.name === 'ubentertainment' ? session.user.name : session.user?.email ?? ''}/>;
}
