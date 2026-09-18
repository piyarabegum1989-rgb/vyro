'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ProviderButtons({ onMessage }) {
  return <div className="providers"><span>or continue with</span><div><button type="button" onClick={() => onMessage('Google sign-in will be available after Google OAuth is connected.')}>G&nbsp;&nbsp;Continue with Google</button><button type="button" onClick={() => onMessage('Facebook sign-in will be available after Meta OAuth is connected.')}>f&nbsp;&nbsp;Continue with Facebook</button><button type="button" onClick={() => onMessage('Phone sign-in will be available after an SMS provider is connected.')}>⌁&nbsp;&nbsp;Continue with phone</button></div></div>;
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('demo@vyro.app');
  const [password, setPassword] = useState('password123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json(); setBusy(false);
    if (!res.ok) return setErr(data.error || 'Login failed');
    router.push('/feed'); router.refresh();
  }
  return <main className="authwrap clean"><div className="authbox"><div className="authbrand"><span>V</span><b>VYRO</b><p>Connect. Create. Share.</p></div><section className="card authcard"><h1>Welcome back</h1><p>Log in to your VYRO account.</p>{err && <div className="err">{err}</div>}<form onSubmit={go}><div className="field"><label>Email address</label><input value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" /></div><div className="field"><label>Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" placeholder="Your password" /></div><button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button></form><ProviderButtons onMessage={setErr} /><p className="center mut" style={{ marginTop: 18, fontSize: 14 }}>New to VYRO? <Link href="/signup">Create account</Link></p></section></div></main>;
}
