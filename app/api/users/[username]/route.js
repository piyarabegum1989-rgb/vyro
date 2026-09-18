import { NextResponse } from 'next/server';
import { table } from '@/lib/db';
import { sessionUser, publicUser, blockedEither, canView, followStatus, enrichPost } from '@/lib/auth';

export async function GET(req, { params }) {
  const session = await sessionUser();
  const me = session?.user || null;
  const [users, follows, blocks, allPosts] = await Promise.all([table('users'), table('follows'), table('blocks'), table('posts')]);
  const target = users.find(user => user.username === String(params.username).toLowerCase());
  if (!target || (me && await blockedEither(me.id, target.id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const viewable = await canView(me, target);
  const followers = follows.filter(item => item.followingId === target.id && item.status === 'accepted').length;
  const following = follows.filter(item => item.followerId === target.id && item.status === 'accepted').length;
  const posts = viewable
    ? await Promise.all(allPosts.filter(post => post.userId === target.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(post => enrichPost(post, me)))
    : [];
  return NextResponse.json({
    user: { ...publicUser(target), stats: { posts: posts.length, followers, following } },
    canView: viewable,
    isOwn: me ? me.id === target.id : false,
    followStatus: me ? (me.id === target.id ? 'self' : await followStatus(me.id, target.id)) : 'none',
    isBlockedByMe: me ? blocks.some(block => block.blockerId === me.id && block.blockedId === target.id) : false,
    posts,
  });
}
