import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser } from '@/lib/auth';

export async function POST() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  const all = await table('sessions');
  const mine = all.filter(item => item.userId === session.user.id);
  const closed = mine.filter(item => item.token !== session.token).length;
  await save('sessions', all.filter(item => item.userId !== session.user.id || item.token === session.token));
  return NextResponse.json({ ok: true, closed });
}
