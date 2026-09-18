'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ProviderButtons({ onMessage }) {
  return <div className="providers"><span>or create account with</span><div><button type="button" onClick={() => onMessage('Google signup will be available after Google OAuth is connected.')}>G&nbsp;&nbsp;Continue with Google</button><button type="button" onClick={() => onMessage('Facebook signup will be available after Meta OAuth is connected.')}>f&nbsp;&nbsp;Continue with Facebook</button><button type="button" onClick={() => onMessage('Phone signup will be available after an SMS provider is connected.')}>⌁&nbsp;&nbsp;Continue with phone</button></div></div>;
}

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const set = (key, value) => setForm(old => ({ ...old, [key]: value }));
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json(); setBusy(false);
    if (!res.ok) return setErr(data.error || 'Signup failed');
    router.push('/feed'); router.refresh();
  }
  return <main className="authwrap clean"><div className="authbox"><div className="authbrand"><span>V</span><b>VYRO</b><p>Connect. Create. Share.</p></div><section className="card authcard"><h1>Create account</h1><p>Join the VYRO community.</p>{err && <div className="err">{err}</div>}<form onSubmit={go}><div className="field"><label>Name</label><input value={form.name} onChange={e => set('name', e.target.value)} autoComplete="name" placeholder="Your name" /></div><div className="field"><label>Username</label><input value={form.username} onChange={e => set('username', e.target.value)} autoComplete="username" placeholder="username" /></div><div className="field"><label>Email</label><input value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" placeholder="you@example.com" /></div><div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => set('password', e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" /></div><button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button></form><ProviderButtons onMessage={setErr} /><p className="center mut" style={{ marginTop: 18, fontSize: 14 }}>Already have an account? <Link href="/login">Log in</Link></p></section></div></main>;
}
