'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import { Avatar } from '@/components/ui';

export default function Profile({ params }) {
  const r = useRouter();
  const [d, setD] = useState(null);
  const [tab, setTab] = useState('post');
  const [menu, setMenu] = useState(false);
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ name: '', bio: '' });
  const [busy, setBusy] = useState(false);

  const load = () => fetch(`/api/users/${params.username}`).then(async res => setD({ status: res.status, ...(await res.json()) }));
  useEffect(() => { load(); }, [params.username]);

  async function follow() {
    setBusy(true);
    const isF = d.followStatus === 'accepted' || d.followStatus === 'pending';
    const res = await fetch(`/api/users/${params.username}/follow`, { method: isF ? 'DELETE' : 'POST' });
    const j = await res.json();
    setBusy(false);
    if (res.ok) { setD({ ...d, followStatus: j.status }); load(); }
  }
  async function block() {
    if (!confirm(d.isBlockedByMe ? 'Unblock করবে?' : 'Block করবে? তারা তোমার প্রোফাইল দেখতে পাবে না।')) return;
    await fetch(`/api/users/${params.username}/block`, { method: d.isBlockedByMe ? 'DELETE' : 'POST' });
    setMenu(false); load();
  }
  async function message() {
    const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: params.username }) });
    const j = await res.json();
    if (res.ok) r.push('/messages');
    else alert(j.error || 'মেসেজ শুরু করা যায়নি');
  }
  async function saveEdit(e) {
    e.preventDefault();
    const res = await fetch('/api/users/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    if (res.ok) { setEdit(false); load(); }
  }

  if (!d) return <Shell><div className="spin">লোড হচ্ছে...</div></Shell>;
  if (d.status === 404) return <Shell><div className="card center" style={{ marginTop: 40 }}><div style={{ fontSize: 48 }}>🚫</div><h2>Not found</h2><p className="mut">এই প্রোফাইল পাওয়া যায়নি বা block করা হয়েছে।</p></div></Shell>;

  const u = d.user;
  const posts = (d.posts || []).filter(p => p.type === tab);

  return (
    <Shell>
      <div className="card">
        <div className="row" style={{ alignItems: 'center' }}>
          <Avatar user={u} size={76} />
          <div style={{ flex: 1 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>@{u.username} {u.isPrivate && <span title="Private">🔒</span>}</h2>
            <div className="mut">{u.name}</div>
          </div>
          {!d.isOwn && (
            <div className="menu">
              <button className="btn ghost sm" onClick={() => setMenu(!menu)}>⋯</button>
              {menu && <div className="dd">
                <button onClick={message}>💬 Message</button>
                <button onClick={block} style={{ color: d.isBlockedByMe ? '#86efac' : '#fca5a5' }}>{d.isBlockedByMe ? '✅ Unblock' : '🚫 Block'}</button>
              </div>}
            </div>
          )}
        </div>
        {u.bio && <p style={{ marginTop: 10 }}>{u.bio}</p>}
        <div className="row center" style={{ marginTop: 14 }}>
          <div style={{ flex: 1 }}><b>{u.stats.posts}</b><div className="mut" style={{ fontSize: 12 }}>Posts</div></div>
          <div style={{ flex: 1 }}><b>{u.stats.followers}</b><div className="mut" style={{ fontSize: 12 }}>Followers</div></div>
          <div style={{ flex: 1 }}><b>{u.stats.following}</b><div className="mut" style={{ fontSize: 12 }}>Following</div></div>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          {d.isOwn ? <>
            <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => { setF({ name: u.name, bio: u.bio }); setEdit(true); }}>✏️ Edit profile</button>
            <Link href="/settings" className="btn ghost sm" style={{ flex: 1 }}>⚙️ Settings</Link>
          </> : <>
            <button className="btn sm" style={{ flex: 1 }} onClick={follow} disabled={busy}>
              {d.followStatus === 'accepted' ? '✓ Following' : d.followStatus === 'pending' ? '⏳ Requested' : '＋ Follow'}
            </button>
            <button className="btn ghost sm" style={{ flex: 1 }} onClick={message}>💬 Message</button>
          </>}
        </div>
      </div>

      {!d.canView ? (
        <div className="lock">
          <div className="big">🔒</div>
          <h3>This account is private</h3>
          <p className="mut">পোস্ট দেখতে ফলো করো — owner approve করলে দেখা যাবে।</p>
        </div>
      ) : <>
        <div className="tabs">
          <button className={tab === 'post' ? 'on' : ''} onClick={() => setTab('post')}>📸 Posts</button>
          <button className={tab === 'reel' ? 'on' : ''} onClick={() => setTab('reel')}>🎬 Reels</button>
        </div>
        {posts.length === 0 ? <div className="card center mut">কিছু নেই</div> : (
          <div className="grid3">
            {posts.map(p => (
              <div key={p.id} className="cell" title={(p.caption || '').slice(0, 80)}>
                {p.type === 'reel' ? <video src={p.mediaUrl} preload="metadata" /> : <img src={p.mediaUrl} alt="" loading="lazy" />}
                {p.type === 'reel' && <span className="rtype">🎬</span>}
              </div>
            ))}
          </div>
        )}
      </>}

      {edit && (
        <div className="overlay" onClick={() => setEdit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>✏️ Edit profile</h2>
            <form onSubmit={saveEdit}>
              <div className="field"><label>Name</label><input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></div>
              <div className="field"><label>Bio</label><textarea rows={3} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} /></div>
              <div className="row">
                <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={() => setEdit(false)}>বাতিল</button>
                <button className="btn" style={{ flex: 1 }}>সেভ করো</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
