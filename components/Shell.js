'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import CreateModal from './CreateModal';

export default function Shell({ children }) {
  const r = useRouter();
  const path = usePathname();
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(async res => {
      if (!res.ok) { r.push('/'); return; }
      setMe((await res.json()).user);
    });
    fetch('/api/notifications').then(async res => {
      if (res.ok) setUnread((await res.json()).unread || 0);
    });
  }, [path]);

  if (!me) return <div className="spin">লোড হচ্ছে... ✨</div>;

  const NAV = [
    { h: '/feed', e: '🏠', t: 'Feed' },
    { h: '/explore', e: '🔎', t: 'Explore' },
    { h: '/reels', e: '🎬', t: 'Reels' },
    { h: '/messages', e: '💬', t: 'Messages' },
    { h: '/notifications', e: '🔔', t: 'Notifications', badge: unread },
    { h: `/u/${me.username}`, e: '👤', t: 'Profile' },
    { h: '/settings', e: '⚙️', t: 'Settings' },
  ];

  return (
    <div className="shell">
      <aside className="side">
        <Link href="/feed" className="logo"><span>vyro</span></Link>
        {NAV.slice(0, 3).map(n => (
          <Link key={n.h} href={n.h} className={'navlink' + (path === n.h ? ' on' : '')}>{n.e} {n.t}</Link>
        ))}
        <button className="navlink" style={{ background: 'none', border: 0, color: 'inherit', fontSize: 16, width: '100%', textAlign: 'left' }} onClick={() => setShowCreate(true)}>➕ Create</button>
        {NAV.slice(3).map(n => (
          <Link key={n.h} href={n.h} className={'navlink' + (path.startsWith(n.h.split('?')[0]) && (n.h !== '/feed') ? ' on' : '')}>
            {n.e} {n.t}{n.badge > 0 && <span className="dot">{n.badge}</span>}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', padding: 12, fontSize: 13 }} className="mut">@{me.username}</div>
      </aside>
      <div className="topbar"><Link href="/feed" className="logo" style={{ fontSize: 24 }}><span>vyro</span></Link></div>
      <main className="main">{children}</main>
      <nav className="bottomnav"><div className="row">
        <Link href="/feed">🏠</Link>
        <Link href="/explore">🔎</Link>
        <button className="bn" onClick={() => setShowCreate(true)}>➕</button>
        <Link href="/reels">🎬</Link>
        <Link href="/messages">💬</Link>
        <Link href="/notifications" style={{ position: 'relative' }}>🔔{unread > 0 && <span className="dot" style={{ position: 'absolute', top: 2, right: 2, background: '#ec4899', color: '#fff', fontSize: 10, fontWeight: 800, minWidth: 18, height: 18, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}</Link>
        <Link href={`/u/${me.username}`}>👤</Link>
      </div></nav>
      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); r.push('/feed'); r.refresh(); window.location.reload(); }} />}
    </div>
  );
}
