import Home from '@/components/site-home';
import { contentStore } from '@/lib/content';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default async function Page() {
  const saved = await contentStore.read();
  return <Home content={saved.content}/>;
}
