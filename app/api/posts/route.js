import { NextResponse } from 'next/server';
import { table, save, uid, extractTags } from '@/lib/db';
import { sessionUser, blockedEither, canView, enrichPost } from '@/lib/auth';

export async function GET(req) {
  const session = await sessionUser();
  const me = session?.user || null;
  const query = req.nextUrl.searchParams;
  const type = query.get('type');
  const hashtag = query.get('hashtag');
  const search = (query.get('q') || '').toLowerCase();
  const [users, allPosts] = await Promise.all([table('users'), table('posts')]);
  const byId = Object.fromEntries(users.map(user => [user.id, user]));
  const visible = [];
  for (const post of allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))) {
    const author = byId[post.userId];
    if (!author) continue;
    if (me && await blockedEither(me.id, author.id)) continue;
    if (!await canView(me, author)) continue;
    if (type && post.type !== type) continue;
    if (hashtag && !(post.hashtags || []).some(tag => tag.toLowerCase() === hashtag.toLowerCase())) continue;
    if (search && !(`${post.caption || ''} ${post.location || ''}`).toLowerCase().includes(search)) continue;
    visible.push(post);
    if (visible.length >= 60) break;
  }
  return NextResponse.json({ posts: await Promise.all(visible.map(post => enrichPost(post, me))) });
}

export async function POST(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { type, mediaUrl, caption, location } = await req.json();
  if (!mediaUrl) return NextResponse.json({ error: 'ছবি/ভিডিও দাও (media required)' }, { status: 400 });
  const post = {
    id: uid('p'), userId: session.user.id, type: type === 'reel' ? 'reel' : 'post',
    mediaUrl: String(mediaUrl).slice(0, 500), caption: String(caption || '').slice(0, 500),
    location: String(location || '').slice(0, 80), hashtags: extractTags(caption || ''),
    createdAt: new Date().toISOString(),
  };
  const posts = await table('posts');
  posts.unshift(post);
  await save('posts', posts);
  return NextResponse.json({ post });
}
