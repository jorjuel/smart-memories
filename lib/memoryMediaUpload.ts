import { createClient } from '@supabase/supabase-js';

type SignedUpload = { path: string; token: string; error?: string };

const MAX_PHOTO = 10 * 1024 * 1024;
const MAX_AUDIO = 25 * 1024 * 1024;
const MAX_VIDEO = 30 * 1024 * 1024;

const ALLOWED_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime', 'video/webm']);

/**
 * Send large files straight to Supabase instead of including them
 * in a Vercel Function request (which is limited to 4.5 MB).
 */
export async function uploadMemoryMedia(
  file: Blob,
  kind: 'photo' | 'audio' | 'video'
): Promise<string> {
  const maxBytes = kind === 'photo' ? MAX_PHOTO : kind === 'audio' ? MAX_AUDIO : MAX_VIDEO;
  if (!file.size || file.size > maxBytes) {
    throw new Error(kind === 'photo'
      ? 'Please choose a photo of 10 MB or smaller.'
      : kind === 'audio' ? 'Please choose audio of 25 MB or smaller.'
      : 'Please choose a video of 30 MB or smaller.');
  }

  const contentType = file.type.toLowerCase().split(';')[0] ||
    (kind === 'photo' ? 'image/jpeg' : kind === 'audio' ? 'audio/webm' : 'video/mp4');
  if (!(kind === 'photo' ? contentType.startsWith('image/')
    : kind === 'audio' ? contentType.startsWith('audio/')
    : ALLOWED_VIDEO_TYPES.has(contentType))) {
    throw new Error('Please select a supported ' + kind + ' file.');
  }

  const response = await fetch('/api/memory-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType, size: file.size }),
  });
  const mime = response.headers.get('content-type') || '';
  const result = mime.includes('application/json')
    ? (await response.json()) as SignedUpload : null;
  if (!response.ok || !result?.path || !result.token) {
    throw new Error(result?.error || 'Could not prepare the upload. Please try again.');
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error('Media upload is not configured.');
  }
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.storage
    .from('memory-media')
    .uploadToSignedUrl(result.path, result.token, file, { contentType });
  if (error) {
    throw new Error('Media upload failed. Please try again with a smaller file.');
  }
  return result.path;
}

/** Parse the API response safely; do not show raw proxy HTML as JSON errors. */
export async function readMemorySaveResult(response: Response):
  Promise<{ code?: string; photoUrl?: string; photo_url?: string; audioUrl?: string; audio_url?: string;
    videoUrl?: string; video_url?: string;
    memory?: { code?: string; photoUrl?: string; photo_url?: string;
      audioUrl?: string; audio_url?: string; videoUrl?: string; video_url?: string }; error?: string }> {
  const mime = response.headers.get('content-type') || '';
  if (!mime.includes('application/json')) {
    throw new Error(response.status === 413
      ? 'The upload is too large. Please use a smaller photo, video or recording.'
      : 'The server could not save your Smart Memory. Please try again.');
  }
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error || 'Could not save your Smart Memory.');
  }
  return result;
}
