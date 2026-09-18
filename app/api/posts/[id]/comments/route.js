import { NextResponse } from 'next/server';
import { table, save, uid } from '@/lib/db';
import { sessionUser, publicUser, blockedEither, canView, notify } from '@/lib/auth';

async function findAllowedPost(id, viewer) {
  const [posts, users] = await Promise.all([table('posts'), table('users')]);
  const post = posts.find(item => item.id === id);
  const author = post && users.find(user => user.id === post.userId);
  if (!post || !author) return { error: 404 };
  if (viewer && await blockedEither(viewer.id, author.id)) return { error: 404 };
  if (!await canView(viewer, author)) return { error: 403 };
  return { post, author, users };
}

export async function GET(req, { params }) {
  const session = await sessionUser();
  const result = await findAllowedPost(params.id, session?.user || null);
  if (result.error) return NextResponse.json({ error: result.error === 403 ? 'This account is private' : 'Not found' }, { status: result.error });
  const comments = (await table('comments')).filter(comment => comment.postId === result.post.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(comment => ({ ...comment, author: publicUser(result.users.find(user => user.id === comment.userId)) }));
  return NextResponse.json({ comments });
}

export async function POST(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const result = await findAllowedPost(params.id, session.user);
  if (result.error) return NextResponse.json({ error: result.error === 403 ? 'This account is private' : 'Not found' }, { status: result.error });
  const { text } = await req.json();
  if (!text || !String(text).trim()) return NextResponse.json({ error: 'কমেন্ট লেখো' }, { status: 400 });
  const comment = { id: uid('c'), postId: result.post.id, userId: session.user.id, text: String(text).slice(0, 300), createdAt: new Date().toISOString() };
  const comments = await table('comments');
  comments.push(comment);
  await save('comments', comments);
  await notify(result.post.userId, { type: 'comment', fromUserId: session.user.id, postId: result.post.id, text: 'commented: ' + comment.text.slice(0, 60) });
  return NextResponse.json({ comment: { ...comment, author: publicUser(session.user) } });
}
