import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, blockedEither, canView, notify } from '@/lib/auth';

const ALLOWED = new Set(['like', 'love', 'haha', 'wow', 'sad', 'angry']);

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
  const body = await req.json().catch(() => ({}));
  const reaction = ALLOWED.has(body.reaction) ? body.reaction : 'like';
  const likes = await table('likes');
  const existing = likes.find(item => item.postId === post.id && item.userId === session.user.id);
  if (existing) existing.reaction = reaction;
  else likes.push({ postId: post.id, userId: session.user.id, reaction });
  await save('likes', likes);
  await notify(post.userId, { type: 'reaction', fromUserId: session.user.id, postId: post.id, text: `reacted ${reaction} to your post` });
  const postLikes = likes.filter(item => item.postId === post.id);
  const reactions = Object.fromEntries([...ALLOWED].map(key => [key, postLikes.filter(item => (item.reaction || 'like') === key).length]));
  return NextResponse.json({ liked: true, count: postLikes.length, reaction, reactions });
}

export async function DELETE(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const likes = await table('likes');
  const next = likes.filter(item => !(item.postId === params.id && item.userId === session.user.id));
  await save('likes', next);
  const postLikes = next.filter(item => item.postId === params.id);
  const reactions = Object.fromEntries([...ALLOWED].map(key => [key, postLikes.filter(item => (item.reaction || 'like') === key).length]));
  return NextResponse.json({ liked: false, count: postLikes.length, reactions });
}
