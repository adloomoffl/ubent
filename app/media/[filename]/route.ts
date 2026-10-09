import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { get } from '@vercel/blob';
import { adminSession } from '@/lib/auth';
import { contentStore } from '@/lib/content';
import { isPublishedImage } from '@/lib/media-policy';
import { UPLOAD_FILENAME } from '@/lib/image-upload';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!UPLOAD_FILENAME.test(filename)) return new Response('Not found', { status: 404 });
  try {
    const saved = await contentStore.read();
    // Draft uploads stay private. Saving an image into website content publishes it.
    if (!isPublishedImage(saved.content, `/media/${filename}`) && !await adminSession()) {
      return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
    const headers = { 'Content-Type': 'image/webp', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'private, no-store' };
    if (process.env.VERCEL) {
      const blob = await get(`ubent/${process.env.VERCEL_ENV ?? 'production'}/${filename}`, { access: 'private' });
      if (!blob || blob.statusCode !== 200) return new Response('Not found', { status: 404 });
      return new Response(blob.stream, { headers });
    }
    const image = await readFile(path.join(process.cwd(), 'data', 'uploads', filename));
    return new Response(new Uint8Array(image), { headers });
  } catch (error) {
    return new Response('Image unavailable', { status: (error as NodeJS.ErrnoException).code === 'ENOENT' ? 404 : 503 });
  }
}
