import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {prepareImage,MAX_IMAGE_BYTES,InvalidImage,UPLOAD_FILENAME} from '../lib/image-upload.ts';
import {contentSchema} from '../lib/content-schema.ts';
import {defaultContent} from '../lib/default-content.ts';
test('images are decoded, bounded, stripped of metadata and encoded as WebP',async()=>{
  const source=await sharp({create:{width:3000,height:30,channels:3,background:'#123456'}}).withMetadata().png().toBuffer();
  const output=await prepareImage(source);const metadata=await sharp(output).metadata();
  assert.equal(metadata.format,'webp');assert.equal(metadata.width,2400);assert.equal(metadata.exif,undefined);assert.equal(metadata.icc,undefined);
});
test('all advertised image types are accepted',async()=>{
  for(const format of ['jpeg','png','webp'] as const){
    const source=await sharp({create:{width:16,height:16,channels:3,background:'#123456'}}).toFormat(format).toBuffer();
    assert.equal((await sharp(await prepareImage(source)).metadata()).format,'webp');
  }
});
test('oversized, empty, corrupt, SVG and disguised executable files are rejected',async()=>{
  for(const source of [Buffer.alloc(MAX_IMAGE_BYTES+1),Buffer.alloc(0),Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>'),Buffer.from('<script>alert(1)</script>'),Buffer.from([255,216,255,0])])await assert.rejects(prepareImage(source),InvalidImage);
});
test('only generated image paths can be saved as local uploaded media',()=>{
  const valid='12345678-1234-1234-1234-123456789abc.webp';assert.equal(UPLOAD_FILENAME.test(valid),true);
  const draft=structuredClone(defaultContent);draft.hero.image='/media/'+valid;assert.equal(contentSchema.safeParse(draft).success,true);
  for(const invalid of ['../.env.local','image.svg','../../data/site-content.json','123.webp']){assert.equal(UPLOAD_FILENAME.test(invalid),false);draft.hero.image='/media/'+invalid;assert.equal(contentSchema.safeParse(draft).success,false);}
});
