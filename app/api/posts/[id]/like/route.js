import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, blockedEither, canView, notify } from '@/lib/auth';

async function guard(post, me) {
  const users = await table('users');
  const author = users.find(user => user.id === post.userId);
  if (!author || await blockedEither(me.id, author.id)) return 404;
  if (!await canView(me, author)) return 403;
  return 0;
}

export async function POST(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const posts = await table('posts');
  const post = posts.find(item => item.id === params.id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const denied = await guard(post, session.user);
  if (denied) return NextResponse.json({ error: 'Not allowed' }, { status: denied });
  const likes = await table('likes');
  if (!likes.some(like => like.postId === post.id && like.userId === session.user.id)) {
    likes.push({ postId: post.id, userId: session.user.id });
    await save('likes', likes);
    await notify(post.userId, { type: 'like', fromUserId: session.user.id, postId: post.id, text: 'liked your post' });
  }
  return NextResponse.json({ liked: true, count: likes.filter(like => like.postId === post.id).length });
}

export async function DELETE(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const likes = await table('likes');
  const next = likes.filter(like => !(like.postId === params.id && like.userId === session.user.id));
  await save('likes', next);
  return NextResponse.json({ liked: false, count: next.filter(like => like.postId === params.id).length });
}
