import { adminSession } from '@/lib/auth';
import { isLocalOrigin } from '@/lib/admin-policy';
import { contentStore } from '@/lib/content';
import { ContentConflict } from '@/lib/content-store';
import { saveInputSchema } from '@/lib/content-schema';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET() {
  if (!await adminSession()) return json({error:'Sign in with the administrator account.'},401);
  try { return json(await contentStore.read()); }
  catch { return json({error:'Saved content could not be loaded. Please check the local data file.'},500); }
}
export async function PUT(request: Request) {
  if (!await adminSession()) return json({error:'Your session has expired. Sign in again before saving.'},401);
  if (!isLocalOrigin(request.headers.get('origin'))) return json({error:'Request origin not allowed.'},403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json({error:'Send JSON content.'},415);
  const maxBytes = 256 * 1024;
  if (Number(request.headers.get('content-length')) > maxBytes) return json({error:'Content is too large.'},413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return json({error:'Missing content.'},400);
    const chunks: Uint8Array[] = []; let bytes = 0;
    while (true) {
      const chunk = await reader.read(); if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); return json({error:'Content is too large.'},413); }
      chunks.push(chunk.value);
    }
    const parsed = saveInputSchema.safeParse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
    if (!parsed.success) return json({error:parsed.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).slice(0,4).join(' ')},400);
    return json(await contentStore.save(parsed.data.content,parsed.data.revision));
  } catch (error) {
    if (error instanceof ContentConflict) return json({error:error.message},409);
    if (error instanceof SyntaxError) return json({error:'Invalid JSON content.'},400);
    return json({error:'Unable to save. Your edits are still on this page; please try again.'},500);
  }
}
