import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

const allowed: Record<string, { extension: string; maxBytes: number }> = {
  'image/jpeg': { extension: 'jpg', maxBytes: 10 * 1024 * 1024 },
  'image/png': { extension: 'png', maxBytes: 10 * 1024 * 1024 },
  'image/webp': { extension: 'webp', maxBytes: 10 * 1024 * 1024 },
  'image/heic': { extension: 'heic', maxBytes: 10 * 1024 * 1024 },
  'audio/webm': { extension: 'webm', maxBytes: 25 * 1024 * 1024 },
  'audio/mp4': { extension: 'm4a', maxBytes: 25 * 1024 * 1024 },
  'audio/mpeg': { extension: 'mp3', maxBytes: 25 * 1024 * 1024 },
  'audio/ogg': { extension: 'ogg', maxBytes: 25 * 1024 * 1024 },
  'audio/wav': { extension: 'wav', maxBytes: 25 * 1024 * 1024 },
  'audio/x-wav': { extension: 'wav', maxBytes: 25 * 1024 * 1024 },
  // Tag-only video trial: keep files small enough for fast mobile playback.
  'video/mp4': { extension: 'mp4', maxBytes: 30 * 1024 * 1024 },
  'video/quicktime': { extension: 'mov', maxBytes: 30 * 1024 * 1024 },
  'video/webm': { extension: 'webm', maxBytes: 30 * 1024 * 1024 },
};

export async function POST(request: Request) {
  try {
    // Reject cross-origin browser requests. Does not replace rate limits.
    const origin = request.headers.get('origin');
    const expected = new URL(request.url).origin;
    if (origin && origin !== expected && !(
      expected.endsWith('.vercel.app') &&
      origin === 'https://smartmemories.co.uk'
    )) {
      return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
    }

    const body: unknown = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid upload details.' }, { status: 400 });
    }
    const input = body as { contentType?: unknown; size?: unknown };
    const type = typeof input.contentType === 'string'
      ? input.contentType.toLowerCase() : '';
    const size = input.size;
    const config = allowed[type];
    if (!config || typeof size !== 'number' || !Number.isInteger(size) ||
      size < 1 || size > config.maxBytes) {
      return NextResponse.json({ error: 'Unsupported file or file too large.' }, { status: 400 });
    }

    const path = `memory-uploads/${randomUUID()}.${config.extension}`;
    const { data, error } = await supabaseAdmin()
      .storage.from('memory-media').createSignedUploadUrl(path);
    if (error || !data) {
      console.error('MEMORY UPLOAD SIGN ERROR:', error);
      return NextResponse.json({ error: 'Could not prepare media upload.' }, { status: 500 });
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
    });
  } catch (error) {
    console.error('MEMORY UPLOAD SIGN ERROR:', error);
    return NextResponse.json({ error: 'Could not prepare media upload.' }, { status: 500 });
  }
}
