import { redirect } from 'next/navigation';
import { adminSession, passwordIsConfigured, googleIsConfigured } from '@/lib/auth';
import LoginButton from './login-button';
export const dynamic='force-dynamic';
export default async function Login({searchParams}:{searchParams:Promise<{error?:string}>}) {
  if(await adminSession())redirect('/admin');
  const configured=passwordIsConfigured();const googleConfigured=googleIsConfigured();const {error}=await searchParams;
  return <main className="admin-login"><a className="admin-back" href="/">← Back to website</a><div className="login-card"><img src="/assets/ub-logo.png" alt="UB Entertainments" width="96" height="64"/><p className="eyebrow">UB Entertainments / Admin</p><h1>Your studio.<br/><span className="gold">Your stories.</span></h1><p>Sign in to manage your website.</p>{error && <p className="admin-alert" role="alert">Sign-in could not be completed. Check your details and try again.</p>}<LoginButton configured={configured} googleConfigured={googleConfigured}/>{!configured && <div className="setup-notice"><strong>Admin sign-in is not configured</strong><p>Set the local password hash before signing in.</p></div>}<p className="login-footnote">Protected access. Your session expires after two hours.</p></div><span className="login-location">KOCHI, KERALAM · EST. 2026</span></main>;
}
