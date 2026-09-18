'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '@/components/Shell';
import { Avatar } from '@/components/ui';

function Inner() {
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [data, setData] = useState(null);

  async function load(query) {
    const res = await fetch('/api/explore?q=' + encodeURIComponent(query || ''));
    setData(await res.json());
  }
  useEffect(() => { load(sp.get('q') || ''); }, []);

  return (
    <>
      <h2 style={{ marginBottom: 12 }}>🔎 Explore</h2>
      <form onSubmit={e => { e.preventDefault(); load(q); }} className="row" style={{ marginBottom: 14 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users, #hashtags, places..." />
        <button className="btn">🔍</button>
      </form>
      {!data ? <div className="spin">লোড হচ্ছে...</div> : <>
        <h3 style={{ marginBottom: 8 }}>🔥 Trending hashtags</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {data.trending.length === 0 && <span className="mut">এখনো ট্রেন্ডিং নেই</span>}
          {data.trending.map(t => (
            <span key={t.tag} className="chip" onClick={() => { setQ(t.tag); load(t.tag); }}>{t.tag} <span className="mut">({t.count})</span></span>
          ))}
        </div>
        {data.users?.length > 0 && <>
          <h3 style={{ marginBottom: 8 }}>👥 People</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {data.users.map(u => (
              <Link key={u.id} href={`/u/${u.username}`} className="card row" style={{ alignItems: 'center', padding: 10 }}>
                <Avatar user={u} /><div><b>@{u.username}</b><div className="mut" style={{ fontSize: 13 }}>{u.name}</div></div>
              </Link>
            ))}
          </div>
        </>}
        <h3 style={{ marginBottom: 8 }}>🖼️ Posts{q && <> for “{q}”</>}</h3>
        <div className="grid3">
          {data.posts.map(p => (
            <Link key={p.id} href={p.author ? `/u/${p.author.username}` : '#'} className="cell" title={(p.caption || '').slice(0, 60)}>
              {p.type === 'reel' ? <video src={p.mediaUrl} preload="metadata" /> : <img src={p.mediaUrl} alt="" loading="lazy" />}
              {p.type === 'reel' && <span className="rtype">🎬</span>}
            </Link>
          ))}
        </div>
        {data.posts.length === 0 && <div className="card center mut">কিছু পাওয়া যায়নি 😕</div>}
      </>}
    </>
  );
}

export default function Explore() {
  return <Shell><Suspense><Inner /></Suspense></Shell>;
}
