'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Login() {
  const r = useRouter();
  const [email, setEmail] = useState('demo@vyro.app');
  const [pw, setPw] = useState('password123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function go(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pw }) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || 'Login failed');
    r.push('/feed'); r.refresh();
  }

  return (
    <div className="authwrap">
      <div className="authbox">
        <span className="logo"><span>vyro</span></span>
        <p className="center mut" style={{ marginBottom: 20 }}>Connect. Create. Share. ✨</p>
        <div className="card">
          <h2 style={{ marginBottom: 14 }}>লগ ইন 🔑</h2>
          {err && <div className="err">{err}</div>}
          <form onSubmit={go}>
            <div className="field"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mail.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••" /></div>
            <button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? '...' : 'লগ ইন'}</button>
          </form>
          <p className="center mut" style={{ marginTop: 14, fontSize: 14 }}>অ্যাকাউন্ট নেই? <Link href="/signup" style={{ color: '#c4b5fd', fontWeight: 700 }}>সাইন আপ করো</Link></p>
        </div>
      </div>
    </div>
  );
}
