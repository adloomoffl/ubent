import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { adminSession } from '@/lib/auth';
import { isLocalOrigin } from '@/lib/admin-policy';
import { prepareImage,MAX_IMAGE_BYTES,IMAGE_MIME_TYPES,InvalidImage } from '@/lib/image-upload';
export const runtime='nodejs';
export const dynamic='force-dynamic';
let processing=0;
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request) {
  if(!await adminSession())return json({error:'Sign in again before uploading an image.'},401);
  if(!isLocalOrigin(request.headers.get('origin')))return json({error:'Request origin not allowed.'},403);
  if(!IMAGE_MIME_TYPES.includes(request.headers.get('content-type') ?? ''))return json({error:'Choose a JPG, PNG, or WebP image.'},415);
  if(Number(request.headers.get('content-length'))>MAX_IMAGE_BYTES)return json({error:'Choose an image smaller than 8 MB.'},413);
  if(processing>=2)return json({error:'Another image is being processed. Please try again shortly.'},429);
  processing++;
  try {
    const reader=request.body?.getReader();if(!reader)return json({error:'Choose an image to upload.'},400);
    const chunks:Uint8Array[]=[];let bytes=0;
    while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.byteLength;if(bytes>MAX_IMAGE_BYTES){await reader.cancel();return json({error:'Choose an image smaller than 8 MB.'},413);}chunks.push(chunk.value);}
    const image=await prepareImage(Buffer.concat(chunks));
    const directory=path.join(process.cwd(),'data','uploads');await mkdir(directory,{recursive:true});
    const filename=randomUUID()+'.webp';await writeFile(path.join(directory,filename),image,{flag:'wx',mode:0o600});
    return json({url:'/media/'+filename},201);
  }catch(error){return error instanceof InvalidImage ? json({error:error.message},400) : json({error:'Upload failed. Your existing image is unchanged. Please try again.'},500);}
  finally{processing--;}
}
