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
  return origin === 'http://localhost:3001';
}
