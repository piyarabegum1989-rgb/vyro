import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { sessionUser } from '@/lib/auth';
import { uid } from '@/lib/db';

const TYPES = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', aac: 'audio/aac', flac: 'audio/flac',
};

export async function POST(req) {
  const session = await sessionUser();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: 'Photo upload চালু করতে Vercel Blob store connect করো' }, { status: 503 });
  const form = await req.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'ফাইল দাও' }, { status: 400 });
  if (file.size > 12 * 1024 * 1024) return NextResponse.json({ error: 'ফাইল ১২MB-এর কম হতে হবে' }, { status: 400 });
  const extension = (file.name.split('.').pop() || '').toLowerCase();
  if (!TYPES[extension]) return NextResponse.json({ error: 'ছবি/ভিডিও ফাইল দাও (png, jpg, mp4...)' }, { status: 400 });
  const blob = await put(`vyro/${session.user.id}/${uid('file')}.${extension}`, file, { access: 'public', addRandomSuffix: true, contentType: TYPES[extension] });
  return NextResponse.json({ url: blob.url });
}
