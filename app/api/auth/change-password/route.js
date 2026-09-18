import { NextResponse } from 'next/server';
import { table, save, hashPassword, verifyPassword } from '@/lib/db';
import { sessionUser } from '@/lib/auth';

export async function POST(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const { current, next } = await req.json();
  if (!verifyPassword(current || '', session.user.salt, session.user.passHash))
    return NextResponse.json({ error: 'Current password ভুল (wrong password)' }, { status: 401 });
  if (!next || String(next).length < 6)
    return NextResponse.json({ error: 'নতুন password কমপক্ষে ৬ অক্ষরের হতে হবে' }, { status: 400 });
  const users = await table('users');
  const user = users.find(item => item.id === session.user.id);
  const { salt, hash } = hashPassword(next);
  user.salt = salt;
  user.passHash = hash;
  await save('users', users);
  return NextResponse.json({ ok: true });
}
