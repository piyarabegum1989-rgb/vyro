'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CreateModal from './CreateModal';
import Icon from './Icons';
import { Avatar, ViroMark } from './ui';

export default function Shell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const [me, setMe] = useState(null);
  const [unread, setUnread] = useState(0);
  const [showCreate, setShowCreate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showExtras, setShowExtras] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me').then(async res => {
      if (!res.ok) { router.replace('/login'); return; }
      const data = await res.json();
      if (alive) setMe(data.user);
    }).catch(() => router.replace('/login'));
    fetch('/api/notifications').then(async res => {
      if (res.ok && alive) setUnread((await res.json()).unread || 0);
    });
    return () => { alive = false; };
  }, [path, router]);

  function active(href) {
    if (href === '/feed') return path === '/feed';
    if (href === '/profile') return path.startsWith('/u/');
    return path.startsWith(href);
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  }

  if (!me) return <div className="app-loading"><ViroMark size={48} word={false} /><span>Loading VIRO</span></div>;

  const isProfile = path.startsWith('/u/');
  return <div className="mobile-app">
    <header className="app-topbar">
      {isProfile ? <Link href={`/u/${me.username}`} className="profile-topname">{path === `/u/${me.username}` ? me.username : 'profile'} <Icon name="chevronDown" size={15} /></Link> : <Link href="/feed" aria-label="VIRO home"><ViroMark size={33} /></Link>}
      <div className="top-actions">
        {isProfile ? <><button className="icon-button" onClick={() => setShowCreate(true)} aria-label="Create"><Icon name="plusSquare" /></button><button className="icon-button" onClick={() => setShowMenu(true)} aria-label="Menu"><Icon name="menu" /></button></> : <>
          <Link href="/explore" className="icon-button" aria-label="Search"><Icon name="search" /></Link>
          <Link href="/notifications" className="icon-button bell-button" aria-label="Notifications"><Icon name="bell" />{unread > 0 && <i>{unread > 9 ? '9+' : unread}</i>}</Link>
          <button className="top-avatar" onClick={() => setShowMenu(true)} aria-label="Profile menu"><Avatar user={me} size={29} /></button>
        </>}
      </div>
    </header>

    <main className="app-content">{children}</main>

    <nav className="viro-bottomnav" aria-label="Main navigation">
      <Link href="/feed" className={active('/feed') ? 'active' : ''} aria-label="Home"><Icon name="home" /></Link>
      <Link href="/explore" className={active('/explore') ? 'active' : ''} aria-label="Explore"><Icon name="search" /></Link>
      <button className="create-nav" onClick={() => setShowCreate(true)} aria-label="Create post"><Icon name="plusSquare" size={27} /></button>
      <Link href="/reels" className={active('/reels') ? 'active' : ''} aria-label="Reels"><Icon name="reels" /></Link>
      <Link href={`/u/${me.username}`} className={active('/profile') ? 'active' : ''} aria-label="Profile"><Avatar user={me} size={24} /></Link>
    </nav>

    {showMenu && <div className="sheet-backdrop" onClick={() => setShowMenu(false)}>
      <aside className="profile-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={() => setShowMenu(false)} aria-label="Close"><Icon name="x" /></button>
        <Link href={`/u/${me.username}`} className="sheet-user" onClick={() => setShowMenu(false)}><Avatar user={me} size={48} /><div><b>{me.name}</b><span>@{me.username}</span></div></Link>
        <div className="sheet-rule" />
        <Link href={`/u/${me.username}`} onClick={() => setShowMenu(false)}><Icon name="user" /> Profile</Link>
        <Link href="/messages" onClick={() => setShowMenu(false)}><Icon name="message" /> Messages</Link>
        <button onClick={() => { setShowMenu(false); setShowExtras(true); }}><Icon name="grid" /> Community</button>
        <button onClick={() => { setShowMenu(false); router.push('/settings'); }}><Icon name="settings" /> Settings & privacy</button>
        {me.isAdmin && <Link href="/admin" onClick={() => setShowMenu(false)} className="admin-link"><Icon name="shield" /> Admin console</Link>}
        <button className="logout-sheet" onClick={logout}><Icon name="logout" /> Log out</button>
        <div className="sheet-brand"><ViroMark size={34} /><span>Connect &nbsp;·&nbsp; Share &nbsp;·&nbsp; Be Real</span></div>
      </aside>
    </div>}

    {showExtras && <div className="sheet-backdrop" onClick={() => setShowExtras(false)}>
      <aside className="profile-sheet feature-sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" /><button className="sheet-close" onClick={() => setShowExtras(false)}><Icon name="x" /></button>
        <h2>Community</h2><p>More ways to connect on VIRO.</p>
        <div className="feature-links">
          <button><span className="feature-icon market">৳</span><span><b>Marketplace</b><small>Buy and sell in BDT</small></span></button>
          <button><span className="feature-icon circle">◌</span><span><b>Circles</b><small>Find your people and vibe</small></span></button>
          <button><span className="feature-icon groups">◎</span><span><b>Groups</b><small>Communities that matter</small></span></button>
          <button><span className="feature-icon event">◇</span><span><b>Events</b><small>Discover what is happening</small></span></button>
        </div>
      </aside>
    </div>}

    {showCreate && <CreateModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); router.push('/feed'); router.refresh(); }} />}
  </div>;
}
