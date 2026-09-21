import 'next-auth';
import 'next-auth/jwt';
declare module 'next-auth' {
  interface Session { admin: boolean; authMethod?: 'google' | 'password' }
  interface User { passwordProof?: string }
}
declare module 'next-auth/jwt' {
  interface JWT { authorizedAdmin?: boolean; authMethod?: 'google' | 'password'; passwordProof?: string; adminExpiresAt?: number }
}
