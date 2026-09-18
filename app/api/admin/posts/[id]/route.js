import { NextResponse } from 'next/server';
import { save, table } from '@/lib/db';
import { isAdmin, sessionUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
  const session = await sessionUser();
  if (!session || !isAdmin(session.user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const [posts, likes, comments] = await Promise.all([table('posts'), table('likes'), table('comments')]);
  const post = posts.find(item => item.id === params.id);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await Promise.all([
    save('posts', posts.filter(item => item.id !== post.id)),
    save('likes', likes.filter(item => item.postId !== post.id)),
    save('comments', comments.filter(item => item.postId !== post.id)),
  ]);
  return NextResponse.json({ ok: true });
}
