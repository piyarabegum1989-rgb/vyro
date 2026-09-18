'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { Avatar, timeAgo } from '@/components/ui';

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');

  async function load() {
    const res = await fetch('/api/admin/summary');
    const body = await res.json();
    if (!res.ok) return setErr(body.error || 'Admin access required');
    setData(body);
  }
  useEffect(() => { load(); }, []);

  async function suspend(user) {
    const res = await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ suspended: !user.suspended }) });
    const body = await res.json();
    if (!res.ok) return setErr(body.error || 'Update failed');
    setData(old => ({ ...old, users: old.users.map(item => item.id === user.id ? body.user : item) }));
  }
  async function remove(post) {
    if (!confirm('এই postটি remove করবো?')) return;
    const res = await fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' });
    const body = await res.json();
    if (!res.ok) return setErr(body.error || 'Remove failed');
    setData(old => ({ ...old, stats: { ...old.stats, posts: old.stats.posts - 1 }, posts: old.posts.filter(item => item.id !== post.id) }));
  }

  return <Shell><div className="adminhead"><div><h2>Admin Console</h2><p className="mut">VIRO community overview and moderation.</p></div><span className="adminpill">OWNER</span></div>{err && <div className="err">{err}</div>}{!data ? <div className="spin">Loading admin console...</div> : <><div className="admingrid"><div className="card"><b>{data.stats.users}</b><span>Members</span></div><div className="card"><b>{data.stats.posts}</b><span>Posts</span></div><div className="card"><b>{data.stats.comments}</b><span>Comments</span></div><div className="card"><b>{data.stats.suspended}</b><span>Suspended</span></div></div><section className="card adminsection"><h3>Members</h3>{data.users.map(user => <div className="adminrow" key={user.id}><Avatar user={user} size={34} /><div className="grow"><b>{user.name}</b><span>@{user.username} · {user.email}</span></div>{user.isAdmin ? <span className="adminpill">ADMIN</span> : <button className={'btn sm ' + (user.suspended ? '' : 'ghost')} onClick={() => suspend(user)}>{user.suspended ? 'Restore' : 'Suspend'}</button>}</div>)}</section><section className="card adminsection"><h3>Recent posts</h3>{data.posts.map(post => <div className="adminrow" key={post.id}><Avatar user={post.author} size={34} /><div className="grow"><b>{post.author?.name || 'Unknown user'}</b><span>{post.caption || (post.music ? `Music: ${post.music.title}` : 'Media post')} · {timeAgo(post.createdAt)}</span></div><button className="btn ghost sm" onClick={() => remove(post)}>Remove</button></div>)}</section></>}</Shell>;
}
