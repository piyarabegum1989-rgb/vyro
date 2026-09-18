import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, publicUser, blockedEither, canView, enrichPost } from '@/lib/auth';

export async function GET(req, { params }) {
  const session = await sessionUser();
  const me = session?.user || null;
  const [posts, users, comments] = await Promise.all([table('posts'), table('users'), table('comments')]);
  const post = posts.find(item => item.id === params.id);
  const author = post && users.find(user => user.id === post.userId);
  if (!post || !author || (me && await blockedEither(me.id, author.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!await canView(me, author)) return NextResponse.json({ error: 'This account is private' }, { status: 403 });
  const output = comments.filter(comment => comment.postId === post.id)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(comment => ({ ...comment, author: publicUser(users.find(user => user.id === comment.userId)) }));
  return NextResponse.json({ post: await enrichPost(post, me), comments: output });
}

export async function DELETE(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const posts = await table('posts');
  const post = posts.find(item => item.id === params.id);
  if (!post || post.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [likes, comments] = await Promise.all([table('likes'), table('comments')]);
  await Promise.all([
    save('posts', posts.filter(item => item.id !== post.id)),
    save('likes', likes.filter(like => like.postId !== post.id)),
    save('comments', comments.filter(comment => comment.postId !== post.id)),
  ]);
  return NextResponse.json({ ok: true });
}
