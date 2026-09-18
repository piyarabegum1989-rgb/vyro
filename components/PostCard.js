'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Avatar, timeAgo, tagify } from './ui';

function isVideo(p) {
  return p.type === 'reel' || (p.mediaUrl || '').match(/\.(mp4|webm|mov)(\?|$)/) || (p.mediaUrl || '').includes('gtv-videos');
}

export default function PostCard({ post, me, onDeleted }) {
  const [p, setP] = useState(post);
  const [showC, setShowC] = useState(false);
  const [comments, setComments] = useState(null);
  const [txt, setTxt] = useState('');
  const [busy, setBusy] = useState(false);

  async function toggleLike() {
    const res = await fetch(`/api/posts/${p.id}/like`, { method: p.liked ? 'DELETE' : 'POST' });
    if (!res.ok) return;
    const d = await res.json();
    setP({ ...p, liked: d.liked, likes: d.count });
  }

  async function loadComments() {
    if (showC) { setShowC(false); return; }
    setShowC(true);
    if (comments) return;
    const res = await fetch(`/api/posts/${p.id}/comments`);
    if (res.ok) setComments((await res.json()).comments);
  }

  async function send(e) {
    e.preventDefault();
    if (!txt.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/posts/${p.id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: txt }) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return;
    setComments([...(comments || []), d.comment]);
    setTxt('');
    setP({ ...p, comments: p.comments + 1 });
  }

  async function del() {
    if (!confirm('পোস্ট ডিলিট করবে?')) return;
    const res = await fetch(`/api/posts/${p.id}`, { method: 'DELETE' });
    if (res.ok && onDeleted) onDeleted(p.id);
  }

  const v = isVideo(p);

  return (
    <div className="post">
      <div className="ph">
        <Link href={`/u/${p.author?.username}`}><Avatar user={p.author} /></Link>
        <div>
          <Link href={`/u/${p.author?.username}`} className="nm">{p.author?.username}</Link>
          {p.location && <div className="loc">📍 {p.location}</div>}
        </div>
        <span className="time">{p.type === 'reel' ? '🎬 ' : ''}{timeAgo(p.createdAt)}</span>
        {me?.id === p.author?.id && <button onClick={del} title="Delete" style={{ background: 'none', border: 0, fontSize: 16 }}>🗑️</button>}
      </div>
      {v
        ? <video className="media" src={p.mediaUrl} controls playsInline preload="metadata" />
        : <img className="media" src={p.mediaUrl} alt="" loading="lazy" />}
      <div className="pa">
        <button onClick={toggleLike} className={p.liked ? 'liked' : ''}>{p.liked ? '❤️' : '🤍'}</button>
        <button onClick={loadComments}>💬</button>
      </div>
      <div className="pb">
        <div className="likes">{p.likes} likes • {p.comments} comments</div>
        <div><b>{p.author?.username}</b> {tagify(p.caption)}</div>
        {showC && (
          <div style={{ marginTop: 10 }}>
            {comments === null ? <div className="mut">লোড হচ্ছে...</div> :
              comments.length === 0 ? <div className="mut" style={{ fontSize: 13 }}>কোনো কমেন্ট নেই — প্রথম কমেন্ট করো! 💬</div> :
                comments.map(c => (
                  <div className="cmt" key={c.id}>
                    <Avatar user={c.author} size={28} />
                    <div><Link href={`/u/${c.author?.username}`}><b style={{ fontSize: 13 }}>{c.author?.username}</b></Link> <span>{c.text}</span></div>
                  </div>
                ))}
            <form onSubmit={send} className="row" style={{ marginTop: 8 }}>
              <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="কমেন্ট লেখো..." />
              <button className="btn sm" disabled={busy}>➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
