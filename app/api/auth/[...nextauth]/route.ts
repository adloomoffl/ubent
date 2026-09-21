import NextAuth from 'next-auth';
import { authOptions, authIsConfigured } from '@/lib/auth';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const handler = NextAuth(authOptions);
const unavailable = () => Response.json({error:'Admin sign-in has not been configured.'},{status:503,headers:{'Cache-Control':'no-store'}});
export async function GET(...args: Parameters<typeof handler>) { return authIsConfigured() ? handler(...args) : unavailable(); }
export async function POST(...args: Parameters<typeof handler>) { return authIsConfigured() ? handler(...args) : unavailable(); }
