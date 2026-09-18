'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Shell from '@/components/Shell';
import { Avatar, timeAgo } from '@/components/ui';

const ICON = { like: '❤️', comment: '💬', follow: '👥', follow_request: '🙋', follow_accept: '✅', message: '💬' };

export default function Notifications() {
  const [items, setItems] = useState(null);
  const [reqs, setReqs] = useState([]);

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => {
      setItems(d.items || []);
      if ((d.unread || 0) > 0) fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) });
    });
    fetch('/api/follows/requests').then(r => r.json()).then(d => setReqs(d.requests || []));
  }, []);

  async function act(fid, action) {
    await fetch('/api/follows/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ followerId: fid, action }) });
    setReqs(reqs.filter(r => r.follower.id !== fid));
  }

  return (
    <Shell>
      <h2 style={{ marginBottom: 14 }}>🔔 Notifications</h2>
      {reqs.length > 0 && (
        <div className="card" style={{ marginBottom: 14 }}>
          <h3 style={{ marginBottom: 10 }}>🙋 Follow requests ({reqs.length})</h3>
          {reqs.map(r => (
            <div key={r.follower.id} className="row" style={{ alignItems: 'center', marginBottom: 10 }}>
              <Avatar user={r.follower} size={38} />
              <Link href={`/u/${r.follower.username}`} style={{ flex: 1 }}><b>@{r.follower.username}</b><div className="mut" style={{ fontSize: 12 }}>{r.follower.name}</div></Link>
              <button className="btn sm" onClick={() => act(r.follower.id, 'accept')}>Accept</button>
              <button className="btn ghost sm" onClick={() => act(r.follower.id, 'decline')}>✕</button>
            </div>
          ))}
        </div>
      )}
      {items === null ? <div className="spin">লোড হচ্ছে...</div> :
        items.length === 0 ? <div className="card center mut">কোনো notification নেই 🔕</div> :
          items.map(n => (
            <div key={n.id} className="card row" style={{ alignItems: 'center', marginBottom: 8, padding: 12, opacity: n.read ? .75 : 1 }}>
              <Avatar user={n.from} size={40} />
              <div style={{ flex: 1, fontSize: 14 }}>
                <Link href={n.from ? `/u/${n.from.username}` : '#'}><b>@{n.from?.username || '?'}</b></Link> {n.text}
                <div className="mut" style={{ fontSize: 12 }}>{ICON[n.type] || '🔔'} {timeAgo(n.createdAt)}</div>
              </div>
              {n.thumb && (n.thumb.match(/\.(mp4|webm)/) ? <video src={n.thumb} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /> : <img src={n.thumb} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />)}
            </div>
          ))}
    </Shell>
  );
}
