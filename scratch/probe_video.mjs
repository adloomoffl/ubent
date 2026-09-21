import fs from 'fs';

// MP4 box parser to get video resolution from moov -> trak -> mdia -> minf -> stbl -> stsd or tkhd
const buffer = fs.readFileSync('public/assets/logo-anime.mp4');

// Search for 'tkhd' box
const tkhdIdx = buffer.indexOf('tkhd');
if (tkhdIdx !== -1) {
  // tkhd version is at tkhdIdx + 4
  const version = buffer.readUInt8(tkhdIdx + 4);
  const widthOffset = version === 1 ? tkhdIdx + 88 : tkhdIdx + 76;
  const heightOffset = widthOffset + 4;
  const width = buffer.readUInt32BE(widthOffset) >> 16;
  const height = buffer.readUInt32BE(heightOffset) >> 16;
  console.log(`Video resolution: ${width}x${height}`);
} else {
  console.log('tkhd box not found');
}
