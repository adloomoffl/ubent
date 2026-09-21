import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { mkdir, open, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import path from 'node:path';

const COST = { N:131072, r:8, p:1, maxmem:256 * 1024 * 1024 };
const derive = (password:string,salt:Buffer) => new Promise<Buffer>((resolve,reject)=>{
  scrypt(password,salt,64,COST,(error,key)=>error ? reject(error) : resolve(key));
});
export function validPasswordHash(hash:string) {
  return /^scrypt:131072:8:1:[a-f0-9]{32}:[a-f0-9]{128}$/.test(hash);
}
export async function hashPassword(password:string) {
  const salt=randomBytes(16);const key=await derive(password,salt);
  return `scrypt:131072:8:1:${salt.toString('hex')}:${key.toString('hex')}`;
}
export async function verifyPassword(password:string,hash:string) {
  if(!validPasswordHash(hash) || password.length>256) return false;
  const parts=hash.split(':');const derived=await derive(password,Buffer.from(parts[4],'hex'));
  return timingSafeEqual(derived,Buffer.from(parts[5],'hex'));
}
export const passwordVersion = (hash:string) => createHash('sha256').update(hash).digest('hex');
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const MAX_LOGIN_FAILURES = 5;
type AttemptState = { failures:number; windowStart:number; blockedUntil:number };

// All submitted usernames share the single-admin budget. Forwarded IP headers
// are deliberately ignored, so changing them cannot bypass the limiter.
export async function authenticatePassword(input:{username:string;password:string},config:{username:string;hash:string;directory:string},now=Date.now()) {
  if(!validPasswordHash(config.hash)) return false;
  await mkdir(config.directory,{recursive:true});
  const filename=path.join(config.directory,'login-attempts.json');
  const lockPath=path.join(config.directory,'login-attempts.lock');
  let lock;
  try { lock=await open(lockPath,'wx'); }
  catch(error) { if((error as NodeJS.ErrnoException).code==='EEXIST') return false; throw error; }
  const temporary=path.join(config.directory,`login-${randomBytes(12).toString('hex')}.tmp`);
  try {
    let state:AttemptState={failures:0,windowStart:now,blockedUntil:0};
    try {
      const value=JSON.parse(await readFile(filename,'utf8'));
      if(!Number.isSafeInteger(value.failures)||value.failures<0||!Number.isFinite(value.windowStart)||!Number.isFinite(value.blockedUntil)) return false;
      state=value;
    } catch(error) { if((error as NodeJS.ErrnoException).code!=='ENOENT') return false; }
    if(state.blockedUntil>now) return false;
    if(now-state.windowStart>=LOGIN_WINDOW_MS) state={failures:0,windowStart:now,blockedUntil:0};
    // Perform the expensive check even for an unknown username.
    const passwordMatches=await verifyPassword(input.password,config.hash);
    const usernameMatches=timingSafeEqual(createHash('sha256').update(input.username).digest(),createHash('sha256').update(config.username).digest());
    const accepted=passwordMatches && usernameMatches;
    if(accepted) state={failures:0,windowStart:now,blockedUntil:0};
    else { state.failures++;if(state.failures>=MAX_LOGIN_FAILURES) state.blockedUntil=now+LOGIN_WINDOW_MS; }
    await writeFile(temporary,JSON.stringify(state),{mode:0o600});await rename(temporary,filename);
    return accepted;
  } finally {
    await lock.close();await unlink(lockPath);
    await unlink(temporary).catch(error=>{if(error.code!=='ENOENT')throw error;});
  }
}
