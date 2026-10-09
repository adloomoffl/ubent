export function redisIsConfigured() {
  try {
    const url = new URL(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? '');
    return url.protocol === 'https:' && !url.username && !url.password &&
      Boolean(process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN);
  } catch { return false; }
}

export const storagePrefix = () => `ubent:${process.env.VERCEL_ENV ?? 'production'}`;

export async function redisCommand(command: (string | number)[]): Promise<unknown> {
  if (!redisIsConfigured()) throw new Error('Hosted storage is not configured.');
  const response = await fetch(process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL!, {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(8000),
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!response.ok) throw new Error('Hosted storage is unavailable.');
  const result = await response.json() as { result?: unknown; error?: unknown };
  if (result.error || !Object.hasOwn(result, 'result')) throw new Error('Hosted storage request failed.');
  return result.result;
}
