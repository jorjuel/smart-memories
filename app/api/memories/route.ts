import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function ext(name: string, fallback: string) {
  const x = name.split('.').pop()?.toLowerCase();

  return x && /^[a-z0-9]+$/.test(x)
    ? x
    : fallback;
}

export async function GET() {
  try {
    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from('memories')
      .select(
        'code, recipient_name, message, sender_name, created_at, photo_url, audio_url, video_url'
      )
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json(
      (data || []).map((m) => ({
        code: m.code,
        recipient: m.recipient_name,
        message: m.message,
        sender: m.sender_name,
        createdAt: m.created_at,
        photoUrl: m.photo_url,
        audioUrl: m.audio_url,
        videoUrl: m.video_url,
      }))
    );
  } catch (e) {
    console.error(
      'LIST MEMORIES ERROR:',
      e
    );

    return NextResponse.json(
      {
        error:
          'Could not load memories.',
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  req: Request
) {
  try {
    const form =
      await req.formData();

    const code = String(
      form.get('code') || ''
    );

    const recipient = String(
      form.get('recipient') || ''
    ).trim();

    const message = String(
      form.get('message') || ''
    );

    const sender = String(
      form.get('sender') || ''
    );

    if (
      !/^[A-Z2-9]{8}$/.test(code) ||
      !recipient
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid memory data.',
        },
        {
          status: 400,
        }
      );
    }

    const sb = supabaseAdmin();

    let photoUrl:
      | string
      | null = null;

    let audioUrl:
      | string
      | null = null;

    /*
     * PHOTO
     */

    const photo =
      form.get('photo');

    if (
      photo instanceof File &&
      photo.size
    ) {
      if (
        photo.size >
        10 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            error:
              'Photo is too large (10 MB max).',
          },
          {
            status: 400,
          }
        );
      }

      const photoPath =
        `${code}/photo.${ext(
          photo.name,
          'jpg'
        )}`;

      const upload =
        await sb.storage
          .from('memory-media')
          .upload(
            photoPath,
            photo,
            {
              contentType:
                photo.type ||
                'image/jpeg',

              upsert: true,
            }
          );

      if (upload.error) {
        throw upload.error;
      }

      const publicPhoto =
        sb.storage
          .from('memory-media')
          .getPublicUrl(
            photoPath
          );

      photoUrl =
        publicPhoto.data
          .publicUrl;
    }

    /*
     * AUDIO
     */

    const audio =
      form.get('audio');

    if (
      audio instanceof File &&
      audio.size
    ) {
      if (
        audio.size >
        25 * 1024 * 1024
      ) {
        return NextResponse.json(
          {
            error:
              'Audio is too large (25 MB max).',
          },
          {
            status: 400,
          }
        );
      }

      const audioPath =
        `${code}/audio.${ext(
          audio.name,

          audio.type.includes(
            'mp4'
          )
            ? 'm4a'
            : 'webm'
        )}`;

      const upload =
        await sb.storage
          .from('memory-media')
          .upload(
            audioPath,
            audio,
            {
              contentType:
                audio.type ||
                'audio/webm',

              upsert: true,
            }
          );

      if (upload.error) {
        throw upload.error;
      }

      const publicAudio =
        sb.storage
          .from('memory-media')
          .getPublicUrl(
            audioPath
          );

      audioUrl =
        publicAudio.data
          .publicUrl;
    }

    /*
     * DATABASE
     */

    const {
      data: memory,
      error,
    } = await sb
      .from('memories')
      .insert({
        code,
        recipient_name:
          recipient,
        message,
        sender_name:
          sender,
        photo_url:
          photoUrl,
        audio_url:
          audioUrl,
      })
      .select(
        'code, recipient_name, message, sender_name, created_at, photo_url, audio_url, video_url'
      )
      .single();

    if (error) {
      throw error;
    }

    /*
     * IMPORTANT:
     * Return the URLs to the browser.
     */

    return NextResponse.json({
      ok: true,

      code:
        memory.code,

      photoUrl:
        memory.photo_url,

      audioUrl:
        memory.audio_url,

      memory: {
        code:
          memory.code,

        recipient:
          memory.recipient_name,

        message:
          memory.message,

        sender:
          memory.sender_name,

        createdAt:
          memory.created_at,

        photoUrl:
          memory.photo_url,

        audioUrl:
          memory.audio_url,

        videoUrl:
          memory.video_url,
      },
    });
  } catch (e) {
    console.error(
      'CREATE MEMORY ERROR:',
      e
    );

    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : 'Could not create memory.',
      },
      {
        status: 500,
      }
    );
  }
}
