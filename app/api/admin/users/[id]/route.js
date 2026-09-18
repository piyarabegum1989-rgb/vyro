import { NextResponse } from 'next/server';
import { save, table } from '@/lib/db';
import { isAdmin, publicUser, sessionUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  const session = await sessionUser();
  if (!session || !isAdmin(session.user)) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  const { suspended } = await req.json().catch(() => ({}));
  const users = await table('users');
  const target = users.find(user => user.id === params.id);
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (target.id === session.user.id) return NextResponse.json({ error: 'You cannot suspend your own admin account' }, { status: 400 });
  target.suspended = Boolean(suspended);
  await save('users', users);
  return NextResponse.json({ user: publicUser(target) });
}
