import { NextResponse } from 'next/server';
import { table } from '@/lib/db';
import { isAdmin, publicUser, sessionUser } from '@/lib/auth';

export async function GET() {
  const session = await sessionUser();
  if (!session || !isAdmin(session.user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const [users, posts, comments, messages] = await Promise.all([table('users'), table('posts'), table('comments'), table('messages')]);
  return NextResponse.json({
    stats: { users: users.length, posts: posts.length, comments: comments.length, messages: messages.length, suspended: users.filter(user => user.suspended).length },
    users: users.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(publicUser),
    posts: posts.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 40).map(post => ({ ...post, author: publicUser(users.find(user => user.id === post.userId)) })),
  });
}
