'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const r = useRouter();
  const [f, setF] = useState({ name: '', username: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  async function go(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || 'Signup failed');
    r.push('/feed'); r.refresh();
  }

  return (
    <div className="authwrap">
      <div className="authbox">
        <span className="logo"><span>vyro</span></span>
        <p className="center mut" style={{ marginBottom: 20 }}>নতুন অ্যাকাউন্ট খোলো 🎉</p>
        <div className="card">
          <h2 style={{ marginBottom: 14 }}>সাইন আপ 📝</h2>
          {err && <div className="err">{err}</div>}
          <form onSubmit={go}>
            <div className="field"><label>নাম (Name)</label><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="তোমার নাম" /></div>
            <div className="field"><label>Username</label><input value={f.username} onChange={e => set('username', e.target.value)} placeholder="username" /></div>
            <div className="field"><label>Email</label><input value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@mail.com" /></div>
            <div className="field"><label>Password</label><input type="password" value={f.password} onChange={e => set('password', e.target.value)} placeholder="কমপক্ষে ৬ অক্ষর" /></div>
            <button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? '...' : 'অ্যাকাউন্ট খোলো'}</button>
          </form>
          <p className="center mut" style={{ marginTop: 14, fontSize: 14 }}>আগেই অ্যাকাউন্ট আছে? <Link href="/login" style={{ color: '#c4b5fd', fontWeight: 700 }}>লগ ইন</Link></p>
        </div>
      </div>
    </div>
  );
}
