import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, blockedEither, notify } from '@/lib/auth';

async function targetOf(username, me) {
  const users = await table('users');
  const target = users.find(user => user.username === String(username).toLowerCase());
  if (!target || await blockedEither(me.id, target.id)) return { error: 404 };
  if (target.id === me.id) return { error: 400 };
  return { target };
}

export async function POST(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { target, error } = await targetOf(params.username, session.user);
  if (error) return NextResponse.json({ error: 'Not found' }, { status: error });
  const follows = await table('follows');
  const existing = follows.find(item => item.followerId === session.user.id && item.followingId === target.id);
  if (existing) return NextResponse.json({ status: existing.status });
  const status = target.isPrivate ? 'pending' : 'accepted';
  follows.push({ followerId: session.user.id, followingId: target.id, status });
  await save('follows', follows);
  await notify(target.id, { type: status === 'pending' ? 'follow_request' : 'follow', fromUserId: session.user.id, text: status === 'pending' ? 'sent you a follow request' : 'started following you' });
  return NextResponse.json({ status });
}

export async function DELETE(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { target, error } = await targetOf(params.username, session.user);
  if (error) return NextResponse.json({ error: 'Not found' }, { status: error });
  const follows = await table('follows');
  await save('follows', follows.filter(item => !(item.followerId === session.user.id && item.followingId === target.id)));
  return NextResponse.json({ status: 'none' });
}
