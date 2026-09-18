'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ProviderButtons({ onMessage }) {
  return <div className="providers"><span>or continue with</span><div><button type="button" onClick={() => onMessage('Google sign-in will be added after Google OAuth is connected.')}>G &nbsp;&nbsp;Continue with Google</button><button type="button" onClick={() => onMessage('Facebook sign-in will be added after Meta OAuth is connected.')}>f &nbsp;&nbsp;Continue with Facebook</button><button type="button" onClick={() => onMessage('Phone sign-in will be added after an SMS provider is connected.')}>⌁ &nbsp;&nbsp;Continue with phone</button></div></div>;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetch('/api/auth/me').then(r => { if (r.ok) router.replace('/feed'); }); }, [router]);
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json(); setBusy(false);
    if (!res.ok) return setErr(data.error || 'Could not log in.');
    router.replace('/feed'); router.refresh();
  }
  return <main className="authwrap"><div className="authbox"><div className="authbrand"><img src="/viro-v-mark.png" alt="VIRO" /><b>VIRO</b><p>Connect &nbsp;·&nbsp; Share &nbsp;·&nbsp; Be Real</p></div><section className="authcard"><h1>Welcome back</h1><p>Log in with your email and password.</p>{err && <div className="err">{err}</div>}<form onSubmit={go}><div className="field"><label>Email address</label><input value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@gmail.com" required /></div><div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your password" required /></div><button className="btn" style={{ width:'100%' }} disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button></form><ProviderButtons onMessage={setErr} /><p className="center mut" style={{ margin:'18px 0 0',fontSize:13 }}>New to VIRO? <Link href="/signup">Create account</Link></p></section></div></main>;
}
