'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function LoginButton({configured,googleConfigured}:{configured:boolean;googleConfigured:boolean}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  return <><form className="password-login" onSubmit={async event=>{
    event.preventDefault();if(busy)return;setBusy(true);setError('');
    try {
      const result=await signIn('credentials',{username,password,redirect:false,callbackUrl:'/admin'});
      setPassword('');
      if(result?.ok && !result.error) {window.location.assign('/admin');return;}
      setError('Sign-in failed. Check your details. After repeated attempts, wait 15 minutes before trying again.');
    }catch{setError('Unable to sign in. Please try again.');}
    setBusy(false);
  }}><label className="admin-field"><span>Username</span><Input autoComplete="username" name="username" required maxLength={100} value={username} onChange={event=>setUsername(event.target.value)} disabled={busy}/></label><label className="admin-field"><span>Password</span><Input type="password" autoComplete="current-password" name="password" required maxLength={256} value={password} onChange={event=>setPassword(event.target.value)} disabled={busy}/></label>{error && <p className="admin-alert" role="alert">{error}</p>}<Button className="google-button" type="submit" disabled={!configured || busy}>{busy ? 'Signing in…' : 'Sign in to admin'}</Button></form>{googleConfigured && <><p className="login-divider">or</p><Button className="google-button" disabled={busy} onClick={async()=>{setBusy(true);try{await signIn('google',{callbackUrl:'/admin'});}catch{setError('Unable to connect to Google.');setBusy(false);}}}>Continue with Google</Button></>}</>;
}
