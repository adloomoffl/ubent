import sharp from 'sharp';
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;
export const IMAGE_MIME_TYPES = ['image/jpeg','image/png','image/webp'];
export const UPLOAD_FILENAME = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;
export class InvalidImage extends Error {}
export async function prepareImage(input:Buffer) {
  if(!input.length || input.length>MAX_IMAGE_BYTES) throw new InvalidImage('Choose an image smaller than 8 MB.');
  const jpeg=input.subarray(0,3).equals(Buffer.from([255,216,255]));
  const png=input.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const webp=input.toString('ascii',0,4)==='RIFF' && input.toString('ascii',8,12)==='WEBP';
  if(!jpeg && !png && !webp)throw new InvalidImage('Choose a JPG, PNG, or WebP image.');
  try {
    const image=sharp(input,{limitInputPixels:MAX_IMAGE_PIXELS,failOn:'warning'});
    const metadata=await image.metadata();
    if(!['jpeg','png','webp'].includes(metadata.format ?? '') || (metadata.pages ?? 1)>1) throw new InvalidImage('Choose a still JPG, PNG, or WebP image.');
    return await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:85}).toBuffer();
  } catch(error) {
    if(error instanceof InvalidImage) throw error;
    throw new InvalidImage('This image could not be read. Use a JPG, PNG, or WebP photo up to 40 megapixels.');
  }
}
