import { readFile } from 'node:fs/promises';
import path from 'node:path';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const safeName=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}) {
  const {filename}=await params;
  if(!safeName.test(filename))return new Response('Not found',{status:404});
  try{
    const image=await readFile(path.join(process.cwd(),'data','uploads',filename));
    return new Response(new Uint8Array(image),{headers:{'Content-Type':'image/webp','X-Content-Type-Options':'nosniff','Cache-Control':'public, max-age=31536000, immutable'}});
  }catch(error){return new Response((error as NodeJS.ErrnoException).code==='ENOENT' ? 'Not found' : 'Image unavailable',{status:(error as NodeJS.ErrnoException).code==='ENOENT' ? 404 : 500});}
}
