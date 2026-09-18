import { NextResponse } from 'next/server';
import { handleUpload } from '@vercel/blob/client';
import { sessionUser } from '@/lib/auth';

const TYPES = new Set([
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/quicktime',
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac',
]);

// This route supplies a short-lived, scoped upload token. The file itself goes
// directly from the visitor's device to Vercel Blob, avoiding serverless body
// limits for normal phone videos.
export async function POST(request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: 'Gallery upload is not connected yet. Add Vercel Blob to this project.' }, { status: 503 });
  const body = await request.json();
  try {
    const json = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        const session = await sessionUser();
        if (!session) throw new Error('Please log in before uploading.');
        if (!pathname.startsWith('viro/')) throw new Error('Invalid upload path.');
        return {
          allowedContentTypes: [...TYPES],
          maximumSizeInBytes: 100 * 1024 * 1024,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: error?.message || 'Could not authorize upload.' }, { status: 400 });
  }
}
