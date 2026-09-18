import { NextResponse } from 'next/server';
import { table } from '@/lib/db';
import { sessionUser, publicUser, blockedEither, canView, followStatus } from '@/lib/auth';

export async function GET(req, { params }) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const type = req.nextUrl.searchParams.get('type') === 'following' ? 'following' : 'followers';
  const [users, follows] = await Promise.all([table('users'), table('follows')]);
  const target = users.find(user => user.username === String(params.username).toLowerCase());
  if (!target || await blockedEither(session.user.id, target.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (!(await canView(session.user, target))) return NextResponse.json({ error: 'This account is private' }, { status: 403 });

  const ids = follows.filter(item => item.status === 'accepted' && (type === 'followers' ? item.followingId === target.id : item.followerId === target.id))
    .map(item => type === 'followers' ? item.followerId : item.followingId);
  const people = [];
  for (const id of ids) {
    const person = users.find(user => user.id === id);
    if (!person || await blockedEither(session.user.id, id)) continue;
    people.push({ ...publicUser(person), followStatus: person.id === session.user.id ? 'self' : await followStatus(session.user.id, person.id) });
  }
  return NextResponse.json({ type, people });
}
