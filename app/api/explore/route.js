import { NextResponse } from 'next/server';
import { table } from '@/lib/db';
import { sessionUser, publicUser, blockedEither, canView, enrichPost } from '@/lib/auth';

export async function GET(req) {
  const session = await sessionUser();
  const me = session?.user || null;
  const query = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const [users, allPosts] = await Promise.all([table('users'), table('posts')]);
  const visible = [];
  for (const post of allPosts) {
    const author = users.find(user => user.id === post.userId);
    if (!author) continue;
    if (me && await blockedEither(me.id, author.id)) continue;
    if (await canView(me, author)) visible.push(post);
  }
  const counts = {};
  visible.forEach(post => (post.hashtags || []).forEach(tag => {
    const key = tag.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  }));
  const trending = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([tag, count]) => ({ tag, count }));
  const allowedUsers = [];
  for (const user of users) {
    if (me && (user.id === me.id || await blockedEither(me.id, user.id))) continue;
    allowedUsers.push(user);
  }
  const matchesPost = post => !query || `${post.caption || ''} ${post.location || ''} ${(post.hashtags || []).join(' ')}`.toLowerCase().includes(query);
  const orderedPosts = visible.filter(matchesPost).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 24);
  const matchedUsers = query
    ? allowedUsers.filter(user => user.username.includes(query) || user.name.toLowerCase().includes(query)).slice(0, 8)
    : allowedUsers.slice(0, 6);
  return NextResponse.json({ trending, users: matchedUsers.map(publicUser), posts: await Promise.all(orderedPosts.map(post => enrichPost(post, me))) });
}
