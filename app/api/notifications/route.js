import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, publicUser } from '@/lib/auth';

export async function GET() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const [users, posts, notifications] = await Promise.all([table('users'), table('posts'), table('notifications')]);
  const items = notifications.filter(note => note.userId === session.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 50)
    .map(note => ({ ...note, from: publicUser(users.find(user => user.id === note.fromUserId)), thumb: note.postId ? posts.find(post => post.id === note.postId)?.mediaUrl || null : null }));
  return NextResponse.json({ items, unread: items.filter(item => !item.read).length });
}

export async function POST(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { id, all } = await req.json().catch(() => ({}));
  const items = await table('notifications');
  items.forEach(note => {
    if (note.userId === session.user.id && (all || (id && note.id === id))) note.read = true;
  });
  await save('notifications', items);
  return NextResponse.json({ ok: true });
}
