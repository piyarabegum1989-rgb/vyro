'use client';
import { upload } from '@vercel/blob/client';

function safeName(name = 'upload') {
  const clean = String(name).toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-');
  return clean.slice(-110) || 'upload';
}

export async function uploadFromDevice(file, onProgress) {
  if (!file) throw new Error('Choose a file first.');
  try {
    const blob = await upload(`viro/${Date.now()}-${safeName(file.name)}`, file, {
      access: 'public',
      handleUploadUrl: '/api/upload/client',
      // Blob multipart upload keeps regular phone video uploads out of the
      // serverless request body and is activated only for larger files.
      multipart: file.size > 4 * 1024 * 1024,
      onUploadProgress: onProgress ? event => onProgress(event.percentage || 0) : undefined,
    });
    return blob.url;
  } catch (error) {
    const message = String(error?.message || '');
    if (message.toLowerCase().includes('client token') || message.toLowerCase().includes('vercel blob')) {
      throw new Error('Gallery upload is not connected yet. In your existing Vercel project, open Storage, create/connect a Blob store, then redeploy.');
    }
    throw error;
  }
}
