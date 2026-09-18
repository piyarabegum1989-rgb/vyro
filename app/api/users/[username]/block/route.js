import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser } from '@/lib/auth';

async function userByUsername(username) {
  const users = await table('users');
  return users.find(user => user.username === String(username).toLowerCase());
}

export async function POST(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const target = await userByUsername(params.username);
  if (!target || target.id === session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [blocks, follows] = await Promise.all([table('blocks'), table('follows')]);
  if (!blocks.some(block => block.blockerId === session.user.id && block.blockedId === target.id))
    blocks.push({ blockerId: session.user.id, blockedId: target.id });
  await Promise.all([
    save('blocks', blocks),
    save('follows', follows.filter(follow => !((follow.followerId === session.user.id && follow.followingId === target.id) || (follow.followerId === target.id && follow.followingId === session.user.id)))),
  ]);
  return NextResponse.json({ blocked: true });
}

export async function DELETE(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const target = await userByUsername(params.username);
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const blocks = await table('blocks');
  await save('blocks', blocks.filter(block => !(block.blockerId === session.user.id && block.blockedId === target.id)));
  return NextResponse.json({ blocked: false });
}
