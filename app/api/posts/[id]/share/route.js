import { NextResponse } from 'next/server';
import { table, save, uid, extractTags } from '@/lib/db';
import { sessionUser, canView, blockedEither, enrichPost, notify } from '@/lib/auth';

export async function POST(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const [posts, users] = await Promise.all([table('posts'), table('users')]);
  const original = posts.find(item => item.id === params.id);
  const author = original && users.find(user => user.id === original.userId);
  if (!original || !author || await blockedEither(session.user.id, author.id) || !await canView(session.user, author))
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const { audience = 'public' } = await req.json().catch(() => ({}));
  const shared = {
    id: uid('p'), userId: session.user.id, type: 'shared', mediaUrl: '',
    caption: `Shared ${author.name}'s post`, location: '', hashtags: extractTags(original.caption || ''),
    audience: ['public', 'friends', 'onlyme'].includes(audience) ? audience : 'public',
    sharedPostId: original.id, createdAt: new Date().toISOString(),
  };
  posts.unshift(shared);
  await save('posts', posts);
  await notify(original.userId, { type: 'share', fromUserId: session.user.id, postId: original.id, text: 'shared your post' });
  return NextResponse.json({ post: await enrichPost(shared, session.user) });
}
