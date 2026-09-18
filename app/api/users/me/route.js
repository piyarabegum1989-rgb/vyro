import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser, publicUser } from '@/lib/auth';

export async function PATCH(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { name, bio, isPrivate } = await req.json();
  const users = await table('users');
  const user = users.find(item => item.id === session.user.id);
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (typeof name === 'string') user.name = name.slice(0, 50);
  if (typeof bio === 'string') user.bio = bio.slice(0, 160);
  if (typeof isPrivate === 'boolean') user.isPrivate = isPrivate;
  await save('users', users);
  return NextResponse.json({ user: publicUser(user) });
}
