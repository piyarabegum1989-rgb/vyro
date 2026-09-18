import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, publicUser, notify } from '@/lib/auth';

export async function GET() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const [follows, users] = await Promise.all([table('follows'), table('users')]);
  const requests = follows.filter(item => item.followingId === session.user.id && item.status === 'pending')
    .map(item => ({ follower: publicUser(users.find(user => user.id === item.followerId)) })).filter(item => item.follower);
  return NextResponse.json({ requests });
}

export async function POST(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { followerId, action } = await req.json();
  const follows = await table('follows');
  const follow = follows.find(item => item.followerId === followerId && item.followingId === session.user.id && item.status === 'pending');
  if (!follow) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (action === 'accept') {
    follow.status = 'accepted';
    await save('follows', follows);
    await notify(followerId, { type: 'follow_accept', fromUserId: session.user.id, text: 'accepted your follow request' });
  } else {
    await save('follows', follows.filter(item => item !== follow));
  }
  return NextResponse.json({ ok: true });
}
