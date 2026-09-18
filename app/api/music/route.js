import { NextResponse } from 'next/server';
import { table } from '@/lib/db';
import { sessionUser, publicUser } from '@/lib/auth';

// VIRO Music contains sounds that creators have uploaded and made public with
// their posts. It lets another creator select the sound in the composer rather
// than needing to browse their device again.
export async function GET(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const query = (req.nextUrl.searchParams.get('q') || '').trim().toLowerCase();
  const [posts, users] = await Promise.all([table('posts'), table('users')]);
  const seen = new Set();
  const starterTracks = [
    { id: 'viro-starter-neon', url: '/audio/viro-neon-wave.wav', title: 'Neon Wave', author: { name: 'VIRO Music', username: 'viro_music' }, artwork: null, createdAt: '2026-09-18T00:00:00.000Z' },
    { id: 'viro-starter-drive', url: '/audio/viro-night-drive.wav', title: 'Night Drive', author: { name: 'VIRO Music', username: 'viro_music' }, artwork: null, createdAt: '2026-09-18T00:00:00.000Z' },
    { id: 'viro-starter-sun', url: '/audio/viro-sylhet-sun.wav', title: 'Sylhet Sun', author: { name: 'VIRO Music', username: 'viro_music' }, artwork: null, createdAt: '2026-09-18T00:00:00.000Z' },
  ];
  const tracks = starterTracks.filter(track => !query || `${track.title} ${track.author.name}`.toLowerCase().includes(query));
  for (const track of starterTracks) seen.add(track.url);
  for (const post of posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))) {
    if (!post.music?.url || post.audience === 'onlyme') continue;
    const key = post.music.url;
    if (seen.has(key)) continue;
    const title = post.music.title || 'Original audio';
    const author = users.find(user => user.id === post.userId);
    if (query && !`${title} ${author?.name || ''} ${author?.username || ''}`.toLowerCase().includes(query)) continue;
    seen.add(key);
    tracks.push({ id: post.id, url: key, title: String(title).slice(0, 100), author: publicUser(author), artwork: post.mediaUrl || null, createdAt: post.createdAt });
    if (tracks.length >= 80) break;
  }
  return NextResponse.json({ tracks });
}
