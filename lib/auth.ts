import 'server-only';
import path from 'node:path';
import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { ADMIN_EMAIL, ADMIN_USERNAME, LOCAL_ADMIN_ID, isAllowedGoogleAccount, isAdminSession } from './admin-policy';
import { authenticatePassword, passwordVersion, validPasswordHash } from './password-auth';

const baseConfigured = () => Boolean(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length>=32 && process.env.NEXTAUTH_URL==='http://localhost:3001');
export const passwordIsConfigured = () => baseConfigured() && validPasswordHash(process.env.ADMIN_PASSWORD_HASH ?? '');
export const googleIsConfigured = () => baseConfigured() && Boolean(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
export const authIsConfigured = () => passwordIsConfigured() || googleIsConfigured();
const currentPasswordVersion = () => passwordVersion(process.env.ADMIN_PASSWORD_HASH ?? '');
export const authOptions: NextAuthOptions = {
  secret:process.env.NEXTAUTH_SECRET,
  providers:[
    CredentialsProvider({
      name:'Admin password',
      credentials:{username:{label:'Username',type:'text'},password:{label:'Password',type:'password'}},
      async authorize(credentials) {
        if(!passwordIsConfigured() || typeof credentials?.username!=='string' || typeof credentials?.password!=='string') return null;
        if(credentials.username.length>100 || credentials.password.length>256) return null;
        const valid=await authenticatePassword({username:credentials.username,password:credentials.password},{username:ADMIN_USERNAME,hash:process.env.ADMIN_PASSWORD_HASH!,directory:path.join(process.cwd(),'data')});
        return valid ? {id:LOCAL_ADMIN_ID,name:ADMIN_USERNAME,email:null,passwordProof:currentPasswordVersion()} : null;
      },
    }),
    ...(googleIsConfigured() ? [GoogleProvider({
      clientId:process.env.GOOGLE_CLIENT_ID!,clientSecret:process.env.GOOGLE_CLIENT_SECRET!,checks:['pkce','state','nonce'],
      authorization:{params:{scope:'openid email profile',prompt:'select_account'}},
    })] : []),
  ],
  pages:{signIn:'/admin/login',error:'/admin/login'},
  session:{strategy:'jwt',maxAge:2*60*60},
  callbacks:{
    async signIn({account,profile,user}) {
      if(account?.provider==='credentials') return passwordIsConfigured() && user.id===LOCAL_ADMIN_ID && user.passwordProof===currentPasswordVersion();
      return googleIsConfigured() && isAllowedGoogleAccount(account?.provider,profile);
    },
    async jwt({token,account,profile,user}) {
      // Only provider authorization can grant access; client session updates are ignored.
      if(account) {
        const local=account.provider==='credentials' && user?.id===LOCAL_ADMIN_ID && user.passwordProof===currentPasswordVersion();
        const google=isAllowedGoogleAccount(account.provider,profile);
        token.authorizedAdmin=local || google;
        token.authMethod=local ? 'password' : google ? 'google' : undefined;
        token.passwordProof=local ? user.passwordProof : undefined;
        token.name=local ? ADMIN_USERNAME : token.name;
        token.email=google ? ADMIN_EMAIL : null;
        token.adminExpiresAt=Date.now()+2*60*60*1000;
      }
      if(typeof token.adminExpiresAt!=='number' || token.adminExpiresAt<=Date.now()) token.authorizedAdmin=false;
      if(token.authMethod==='password' && (!passwordIsConfigured() || token.passwordProof!==currentPasswordVersion() || token.sub!==LOCAL_ADMIN_ID)) token.authorizedAdmin=false;
      if(token.authMethod==='google' && (!googleIsConfigured() || token.email!==ADMIN_EMAIL)) token.authorizedAdmin=false;
      return token;
    },
    async session({session,token}) {
      session.admin=token.authorizedAdmin===true;
      session.authMethod=token.authMethod;
      return session;
    },
    async redirect({url}) {
      const base='http://localhost:3001';
      if(url.startsWith('/') && !url.startsWith('//')) return base+url;
      try{if(new URL(url).origin===base)return url;}catch{/* reject invalid destinations */}
      return base+'/admin';
    },
  },
};
export async function adminSession() {
  if(!authIsConfigured())return null;
  const session=await getServerSession(authOptions);
  return isAdminSession(session) ? session : null;
}
