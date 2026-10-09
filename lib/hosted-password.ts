import { createHash, timingSafeEqual } from 'node:crypto';
import { verifyPassword } from './password-auth.ts';

import { redisCommand, storagePrefix } from './redis-store.ts';
export { redisIsConfigured } from './redis-store.ts';

export async function authenticateHostedPassword(
  input: { username: string; password: string },
  config: { username: string; hash: string },
) {
  
  try {
    // Reserve an attempt atomically before expensive password verification.
    // All usernames and all Vercel instances share this budget.
    const key = `${storagePrefix()}:admin-login`;
    const script = `local n = redis.call('INCR', KEYS[1])
      if n == 1 then redis.call('EXPIRE', KEYS[1], 900) end
      return n`;
    const result = await redisCommand(['EVAL', script, 1, key]);
    if (typeof result !== 'number' || result < 1 || result > 5) return false;
    const matches = await verifyPassword(input.password, config.hash);
    const usernameMatches = timingSafeEqual(
      createHash('sha256').update(input.username).digest(),
      createHash('sha256').update(config.username).digest(),
    );
    return matches && usernameMatches;
  } catch { return false; } // A failed limiter must never permit a login.
}

