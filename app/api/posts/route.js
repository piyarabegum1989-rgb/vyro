import { NextResponse } from 'next/server';
import { table, save, uid, extractTags } from '@/lib/db';
import { sessionUser, blockedEither, canView, enrichPost } from '@/lib/auth';

const audienceAllowed = new Set(['public', 'friends', 'onlyme']);

function canSeeAudience(post, me, follows) {
  const audience = post.audience || 'public';
  if (audience === 'public') return true;
  if (!me) return false;
  if (post.userId === me.id) return true;
  if (audience === 'onlyme') return false;
  // VIRO Friends: either accepted direction is enough for the current follow model.
  return follows.some(item => item.status === 'accepted' &&
    ((item.followerId === me.id && item.followingId === post.userId) ||
     (item.followerId === post.userId && item.followingId === me.id)));
}

export async function GET(req) {
  const session = await sessionUser();
  const me = session?.user || null;
  const query = req.nextUrl.searchParams;
  const type = query.get('type');
  const hashtag = query.get('hashtag');
  const search = (query.get('q') || '').toLowerCase();
  const [users, allPosts, follows] = await Promise.all([table('users'), table('posts'), table('follows')]);
  const byId = Object.fromEntries(users.map(user => [user.id, user]));
  const visible = [];
  for (const post of allPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))) {
    const author = byId[post.userId];
    if (!author) continue;
    if (me && await blockedEither(me.id, author.id)) continue;
    if (!await canView(me, author) || !canSeeAudience(post, me, follows)) continue;
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
  const { type, mediaUrl, caption, location, audience, music } = await req.json();
  const safeCaption = String(caption || '').slice(0, 800);
  const safeMedia = String(mediaUrl || '').slice(0, 1000);
  const safeMusicUrl = String(music?.url || '').slice(0, 1000);
  const safeMusic = safeMusicUrl ? {
    url: safeMusicUrl,
    title: String(music?.title || 'Original audio').slice(0, 100),
  } : null;
  if (!safeMedia && !safeCaption.trim() && !safeMusic) return NextResponse.json({ error: 'কিছু লিখো, ছবি/ভিডিও বা music দাও' }, { status: 400 });
  const post = {
    id: uid('p'), userId: session.user.id,
    type: safeMedia ? (type === 'reel' ? 'reel' : type === 'story' ? 'story' : 'post') : 'text',
    mediaUrl: safeMedia, music: safeMusic, caption: safeCaption, location: String(location || '').slice(0, 80),
    audience: audienceAllowed.has(audience) ? audience : 'public', hashtags: extractTags(safeCaption),
    createdAt: new Date().toISOString(),
  };
  const posts = await table('posts');
  posts.unshift(post);
  await save('posts', posts);
  return NextResponse.json({ post: await enrichPost(post, session.user) });
}
