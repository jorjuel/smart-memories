import type { supabaseAdmin } from './supabaseAdmin';

const limits = { image: 10, audio: 25, video: 30 } as const;
type MediaKind = keyof typeof limits;

export async function verifyMemoryUpload(
  client: ReturnType<typeof supabaseAdmin>,
  path: string,
  kind: MediaKind,
) {
  if (!/^memory-uploads\/[a-f0-9-]{36}\.[a-z0-9]+$/.test(path)) {
    return { error: 'Invalid media reference.' } as const;
  }

  const bucket = client.storage.from('memory-media');
  const { data, error } = await bucket.info(path);
  if (error || !data) {
    return { error: 'Uploaded media was not found. Please try uploading again.' } as const;
  }

  const size = Number(data.size);
  const mimeType = String(data.contentType || '').toLowerCase().split(';')[0];
  if (!Number.isFinite(size) || size < 1 || size > limits[kind] * 1024 * 1024 ||
      !mimeType.startsWith(`${kind}/`)) {
    return { error: 'Uploaded media format or size is invalid.' } as const;
  }

  return { url: bucket.getPublicUrl(path).data.publicUrl, mimeType } as const;
}
