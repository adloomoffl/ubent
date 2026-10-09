export const ADMIN_EMAIL = 'ubentertainments2026@gmail.com';
export const ADMIN_USERNAME = 'ubentertainment';
export const LOCAL_ADMIN_ID = 'ub-local-admin';

export function isAllowedGoogleAccount(provider: unknown, profile: unknown): boolean {
  if (provider !== 'google' || !profile || typeof profile !== 'object') return false;
  const data = profile as Record<string, unknown>;
  return data.email_verified === true && typeof data.email === 'string'
    && data.email.toLowerCase() === ADMIN_EMAIL
    && typeof data.sub === 'string' && data.sub.length > 0;
}

export function isAdminSession(session: unknown): boolean {
  if (!session || typeof session !== 'object') return false;
  const data = session as { admin?: unknown; authMethod?: unknown; user?: { email?: unknown; name?: unknown } };
  return data.admin === true && (
    (data.authMethod === 'google' && data.user?.email === ADMIN_EMAIL) ||
    (data.authMethod === 'password' && data.user?.name === ADMIN_USERNAME)
  );
}

export function isLocalOrigin(origin: string | null): boolean {
  return origin !== null && origin === (configuredAdminOrigin() ?? (!process.env.VERCEL ? 'http://localhost:3001' : null));
}


// Trust the configured UB origin, never a request Host header.
export function configuredAdminOrigin(): string | null {
  try {
    const value = process.env.NEXTAUTH_URL;
    if (!value) return null;
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash || url.pathname !== '/') return null;
    if (!process.env.VERCEL && url.origin === 'http://localhost:3001') return url.origin;
    if (url.protocol === 'https:' && !url.port && ['ubentertainments.in', 'www.ubentertainments.in'].includes(url.hostname)) return url.origin;
    return null;
  } catch { return null; }
}
