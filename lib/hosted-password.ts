import { createHash, timingSafeEqual } from 'node:crypto';
import { verifyPassword } from './password-auth.ts';

export function redisIsConfigured() {
  try {
    const url = new URL(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '');
    return url.protocol === 'https:' && !url.username && !url.password &&
      Boolean(process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN);
  } catch { return false; }
}

export async function authenticateHostedPassword(
  input: { username: string; password: string },
  config: { username: string; hash: string },
) {
  if (!redisIsConfigured()) return false;
  try {
    const endpoint = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL!;
    const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN!;
    // Reserve an attempt atomically before expensive password verification.
    // All usernames and all Vercel instances share this budget.
    const key = `ubent:${process.env.VERCEL_ENV ?? 'production'}:admin-login`;
    const script = `local n = redis.call('INCR', KEYS[1])
      if n == 1 then redis.call('EXPIRE', KEYS[1], 900) end
      return n`;
    const response = await fetch(endpoint, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(5000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(['EVAL', script, 1, key]),
    });
    if (!response.ok) return false;
    const result = await response.json() as { result?: unknown; error?: unknown };
    if (result.error || typeof result.result !== 'number' || result.result < 1 || result.result > 5) return false;
    const matches = await verifyPassword(input.password, config.hash);
    const usernameMatches = timingSafeEqual(
      createHash('sha256').update(input.username).digest(),
      createHash('sha256').update(config.username).digest(),
    );
    return matches && usernameMatches;
  } catch { return false; } // A failed limiter must never permit a login.
}
