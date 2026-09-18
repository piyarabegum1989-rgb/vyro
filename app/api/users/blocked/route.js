import { NextResponse } from 'next/server';
import { table } from '@/lib/db';
import { sessionUser, publicUser } from '@/lib/auth';

export async function GET() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const [blocks, users] = await Promise.all([table('blocks'), table('users')]);
  const ids = blocks.filter(block => block.blockerId === session.user.id).map(block => block.blockedId);
  return NextResponse.json({ users: users.filter(user => ids.includes(user.id)).map(publicUser) });
}
