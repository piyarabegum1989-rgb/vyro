import { NextResponse } from 'next/server';
import { table, save, uid, verifyPassword } from '@/lib/db';
import { publicUser } from '@/lib/auth';

export async function POST(req) {
  const { email, password } = await req.json();
  const users = await table('users');
  const user = users.find(item => item.email === String(email || '').toLowerCase().trim());
  if (!user || !verifyPassword(password || '', user.salt, user.passHash))
    return NextResponse.json({ error: 'ভুল email বা password (invalid credentials)' }, { status: 401 });
  if (user.suspended)
    return NextResponse.json({ error: 'এই accountটি admin সাময়িকভাবে বন্ধ রেখেছে' }, { status: 403 });
  const token = uid('sess');
  const sessions = await table('sessions');
  sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), device: (req.headers.get('user-agent') || 'unknown').slice(0, 100) });
  await save('sessions', sessions);
  const response = NextResponse.json({ user: publicUser(user) });
  response.cookies.set('vyro_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}
