import { NextResponse } from 'next/server';
import { sessionUser, publicUser } from '@/lib/auth';

export async function GET() {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  return NextResponse.json({ user: publicUser(session.user) });
}
