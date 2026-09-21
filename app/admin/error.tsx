'use client';
export default function AdminError({reset}:{reset:()=>void}) {
  return <main className="admin-login"><div className="login-card"><h1>Unable to load.</h1><p>The saved content could not be read. Your existing data has not been replaced.</p><button className="pill" onClick={reset}>Try again</button><a href="/">Back to website</a></div></main>;
}
