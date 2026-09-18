import { NextResponse } from 'next/server';
import { table, save, uid, hashPassword } from '@/lib/db';
import { publicUser } from '@/lib/auth';

export async function POST(req) {
  const { name, username, email, password } = await req.json();
  if (!name || !username || !email || !password)
    return NextResponse.json({ error: 'সব ঘর পূরণ করো (all fields required)' }, { status: 400 });
  const cleanUsername = String(username).toLowerCase().trim().replace(/[^a-z0-9_.]/g, '');
  const cleanEmail = String(email).toLowerCase().trim();
  if (cleanUsername.length < 3)
    return NextResponse.json({ error: 'Username কমপক্ষে ৩ অক্ষরের হতে হবে' }, { status: 400 });
  if (String(password).length < 6)
    return NextResponse.json({ error: 'Password কমপক্ষে ৬ অক্ষরের হতে হবে' }, { status: 400 });
  const users = await table('users');
  if (users.some(user => user.username === cleanUsername || user.email === cleanEmail))
    return NextResponse.json({ error: 'Username বা email আগেই ব্যবহৃত হয়েছে' }, { status: 409 });
  const { salt, hash } = hashPassword(password);
  const user = { id: uid('u'), username: cleanUsername, name: String(name).trim().slice(0, 50), email: cleanEmail, passHash: hash, salt, bio: '', isPrivate: false, createdAt: new Date().toISOString() };
  users.push(user);
  await save('users', users);
  const token = uid('sess');
  const sessions = await table('sessions');
  sessions.push({ token, userId: user.id, createdAt: new Date().toISOString(), device: (req.headers.get('user-agent') || 'unknown').slice(0, 100) });
  await save('sessions', sessions);
  const response = NextResponse.json({ user: publicUser(user) });
  response.cookies.set('vyro_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return response;
}
