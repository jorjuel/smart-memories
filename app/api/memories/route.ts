import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function ext(name: string, fallback: string) {
  const x = name.split('.').pop()?.toLowerCase();
  return x && /^[a-z0-9]+$/.test(x) ? x : fallback;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const code = String(form.get('code') || '');
    const recipient = String(form.get('recipient') || '').trim();
    const message = String(form.get('message') || '');
    const sender = String(form.get('sender') || '');

    if (!/^[A-Z2-9]{8}$/.test(code) || !recipient) {
      return NextResponse.json(
        { error: 'Invalid memory data.' },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    let photoUrl: string | null = null;
    let audioUrl: string | null = null;

    const photo = form.get('photo');

    if (photo instanceof File && photo.size) {
      if (photo.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Photo is too large (10 MB max).' },
          { status: 400 }
        );
      }

      const photoPath = `${code}/photo.${ext(photo.name, 'jpg')}`;

      const upload = await sb.storage
        .from('memory-media')
        .upload(photoPath, photo, {
          contentType: photo.type || 'image/jpeg',
          upsert: true,
        });

      if (upload.error) throw upload.error;

      photoUrl = sb.storage
        .from('memory-media')
        .getPublicUrl(photoPath).data.publicUrl;
    }

    const audio = form.get('audio');

    if (audio instanceof File && audio.size) {
      if (audio.size > 25 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'Audio is too large (25 MB max).' },
          { status: 400 }
        );
      }

      const audioPath = `${code}/audio.${ext(
        audio.name,
        audio.type.includes('mp4') ? 'm4a' : 'webm'
      )}`;

      const upload = await sb.storage
        .from('memory-media')
        .upload(audioPath, audio, {
          contentType: audio.type || 'audio/webm',
          upsert: true,
        });

      if (upload.error) throw upload.error;

      audioUrl = sb.storage
        .from('memory-media')
        .getPublicUrl(audioPath).data.publicUrl;
    }

    const { error } = await sb.from('memories').insert({
      code,
      recipient_name: recipient,
      message,
      sender_name: sender,
      photo_url: photoUrl,
      audio_url: audioUrl,
    });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      code,
    });
  } catch (e) {
    console.error('CREATE MEMORY ERROR:', e);

    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'Could not create memory.',
      },
      { status: 500 }
    );
  }
}