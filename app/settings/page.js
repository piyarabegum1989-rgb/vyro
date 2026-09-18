'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { Avatar } from '@/components/ui';

export default function Settings() {
  const r = useRouter();
  const [me, setMe] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });

  useEffect(() => {
    fetch('/api/auth/me').then(async res => { if (res.ok) setMe((await res.json()).user); });
    fetch('/api/users/blocked').then(async res => { if (res.ok) setBlocked((await res.json()).users || []); });
  }, []);

  async function togglePrivate(v) {
    const res = await fetch('/api/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPrivate: v }) });
    if (res.ok) { setMe((await res.json()).user); setMsg(v ? '🔒 অ্যাকাউন্ট এখন private' : '🌍 অ্যাকাউন্ট এখন public'); }
  }
  async function unblock(username) {
    await fetch(`/api/users/${username}/block`, { method: 'DELETE' });
    setBlocked(blocked.filter(u => u.username !== username));
  }
  async function changePw(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    if (pw.next !== pw.confirm) return setErr('নতুন password দুটো মিলছে না');
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ current: pw.current, next: pw.next }) });
    const d = await res.json();
    if (!res.ok) return setErr(d.error || 'Failed');
    setMsg('✅ Password বদলে গেছে!');
    setPw({ current: '', next: '', confirm: '' });
  }
  async function logoutOthers() {
    const res = await fetch('/api/auth/logout-others', { method: 'POST' });
    const d = await res.json();
    if (res.ok) setMsg(`✅ ${d.closed}টা অন্য session বন্ধ করা হয়েছে`);
  }
  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    r.push('/'); r.refresh();
  }

  return (
    <Shell>
      <h2 style={{ marginBottom: 14 }}>⚙️ Settings</h2>
      {msg && <div className="okmsg">{msg}</div>}
      {err && <div className="err">{err}</div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <h3>🔐 Privacy & Security <span className="badge new">✨ Notun!</span></h3>
        <div className="setrow">
          <div style={{ flex: 1 }}>
            <b>🔒 Private account</b>
            <div className="mut" style={{ fontSize: 13 }}>On করলে শুধু follower-রা পোস্ট দেখবে, অন্যরা lock screen দেখবে।</div>
          </div>
          <label className="switch">
            <input type="checkbox" checked={!!me?.isPrivate} onChange={e => togglePrivate(e.target.checked)} />
            <span className="sw" />
          </label>
        </div>
        <div className="setrow" style={{ display: 'block' }}>
          <b>🚫 Blocked accounts ({blocked.length})</b>
          {blocked.length === 0 ? <div className="mut" style={{ fontSize: 13, marginTop: 6 }}>কাউকে block করোনি</div> :
            blocked.map(u => (
              <div key={u.id} className="row" style={{ alignItems: 'center', marginTop: 8 }}>
                <Avatar user={u} size={34} />
                <div style={{ flex: 1 }}><b>@{u.username}</b><div className="mut" style={{ fontSize: 12 }}>{u.name}</div></div>
                <button className="btn ghost sm" onClick={() => unblock(u.username)}>Unblock</button>
              </div>
            ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 10 }}>🔑 Change password</h3>
        <form onSubmit={changePw}>
          <div className="field"><label>Current password</label><input type="password" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} /></div>
          <div className="field"><label>নতুন password</label><input type="password" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} /></div>
          <div className="field"><label>নতুন password (আবার)</label><input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} /></div>
          <button className="btn sm">Password বদলাও</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h3 style={{ marginBottom: 10 }}>📱 Sessions</h3>
        <p className="mut" style={{ fontSize: 13, marginBottom: 10 }}>Logged in as <b>{me?.email}</b></p>
        <button className="btn ghost sm" onClick={logoutOthers}>🚪 Log out other devices</button>
      </div>

      <div className="card">
        <div className="row">
          <Link href={me ? `/u/${me.username}` : '/feed'} className="btn ghost" style={{ flex: 1 }}>👤 My profile</Link>
          <button className="btn danger" style={{ flex: 1 }} onClick={logout}>Log out</button>
        </div>
      </div>
      <p className="center mut" style={{ marginTop: 20, fontSize: 12 }}>VYRO v1.0 • Made with ❤️ in Bangladesh</p>
    </Shell>
  );
}
