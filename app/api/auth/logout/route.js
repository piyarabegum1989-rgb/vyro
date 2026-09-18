import { NextResponse } from 'next/server';
import { table, save } from '@/lib/db';
import { sessionUser } from '@/lib/auth';

export async function POST() {
  const session = await sessionUser();
  if (session) {
    const sessions = await table('sessions');
    await save('sessions', sessions.filter(item => item.token !== session.token));
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set('vyro_session', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
