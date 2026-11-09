import { NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';
import { verifyMemoryUpload } from '@/lib/verifyMemoryUpload';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createSupabaseServerClient,} from '@/lib/supabaseServer';
import { hasMeaningfulMemoryContent } from '@/lib/memoryContent';

export const runtime = 'nodejs';

/* =========================================================
   FILE EXTENSION
   ========================================================= */

function ext(
  name: string,
  fallback: string
) {
  const extension =
    name
      .split('.')
      .pop()
      ?.toLowerCase();

  return extension &&
    /^[a-z0-9]+$/.test(
      extension
    )
    ? extension
    : fallback;
}

/* =========================================================
   SMART MEMORY CODE
   Example: V5JYH4L3
   ========================================================= */

function generateMemoryCode() {
  const characters =
    'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const bytes =
    randomBytes(8);

  let code = '';

  for (
    let i = 0;
    i < 8;
    i++
  ) {
    code +=
      characters[
        bytes[i] %
          characters.length
      ];
  }

  return code;
}

/* =========================================================
   GET MEMORIES - OWNER ONLY
   ========================================================= */

export async function GET() {
  try {
    const authClient =
      await createSupabaseServerClient();

    const {
      data: { user },
    } =
      await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Authentication required.',
        },
        {
          status: 401,
        }
      );
    }

    const allowedEmails =
      (
        process.env.ADMIN_EMAILS ||
        ''
      )
        .split(',')
        .map((email) =>
          email
            .trim()
            .toLowerCase()
        )
        .filter(Boolean);

    const userEmail =
      user.email
        ?.trim()
        .toLowerCase() ||
      '';

    if (
      !allowedEmails.includes(
        userEmail
      )
    ) {
      return NextResponse.json(
        {
          error:
            'You are not authorised to view all memories.',
        },
        {
          status: 403,
        }
      );
    }

    const sb =
      supabaseAdmin();

    const {
      data,
      error,
    } = await sb
      .from('memories')
      .select(
        'code, recipient_name, message, sender_name, created_at, photo_url, audio_url, video_url'
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

    if (error) {
      throw error;
    }

    return NextResponse.json(
      (data || []).map(
        (memory) => ({
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
        })
      )
    );
  } catch (error) {
    console.error(
      'LIST MEMORIES ERROR:',
      error
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

/* =========================================================
   CREATE MEMORY
   ========================================================= */

export async function POST(
  req: Request
) {
  try {
    const form =
      await req.formData();
    const authClient =
      await createSupabaseServerClient();

    const {
      data: {
        user,
      },
    } =
      await authClient.auth
        .getUser();

    /* -----------------------------------------------------
       MEMORY CODE

       If an older part of the website sends a valid code,
       keep it.

       Otherwise automatically create a new one.
       ----------------------------------------------------- */

    const suppliedCode =
      String(
        form.get('code') ||
          ''
      )
        .trim()
        .toUpperCase();

    const code =
      /^[A-Z2-9]{8}$/.test(
        suppliedCode
      )
        ? suppliedCode
        : generateMemoryCode();

    /* -----------------------------------------------------
       CUSTOMER DATA
       ----------------------------------------------------- */

    const recipient =
      String(
        form.get(
          'recipient'
        ) || ''
      ).trim();

    const message =
      String(
        form.get(
          'message'
        ) || ''
      ).trim();

    const sender =
      String(
        form.get(
          'sender'
        ) || ''
      ).trim();

    if (!recipient) {
      return NextResponse.json(
        {
          error:
            'Please enter the recipient name.',
        },
        {
          status: 400,
        }
      );
    }

    const sb =
      supabaseAdmin();

    let photoUrl:
      | string
      | null = null;

    let audioUrl:
      | string
      | null = null;

    let videoUrl:
      | string
      | null = null;

    /* =====================================================
       PHOTO
       ===================================================== */

    const photo =
      form.get('photo');

    if (
      photo instanceof
        File &&
      photo.size >
        0
    ) {
      if (
        photo.size >
        10 *
          1024 *
          1024
      ) {
        return NextResponse.json(
          {
            error:
              'Photo is too large. Maximum size is 10 MB.',
          },
          {
            status: 400,
          }
        );
      }

      const photoPath =
        `memory-uploads/${randomUUID()}.${ext(
          photo.name,
          'jpg'
        )}`;

      const {
        error:
          photoUploadError,
      } =
        await sb.storage
          .from(
            'memory-media'
          )
          .upload(
            photoPath,
            photo,
            {
              contentType:
                photo.type ||
                'image/jpeg',

              upsert: false,
            }
          );

      if (
        photoUploadError
      ) {
        throw photoUploadError;
      }

      const {
        data:
          publicPhoto,
      } =
        sb.storage
          .from(
            'memory-media'
          )
          .getPublicUrl(
            photoPath
          );

      photoUrl =
        publicPhoto.publicUrl;
    }

    /* =====================================================
       AUDIO
       ===================================================== */

    const audio =
      form.get('audio');

    if (
      audio instanceof
        File &&
      audio.size >
        0
    ) {
      if (
        audio.size >
        25 *
          1024 *
          1024
      ) {
        return NextResponse.json(
          {
            error:
              'Audio is too large. Maximum size is 25 MB.',
          },
          {
            status: 400,
          }
        );
      }

      const fallbackAudioExtension =
        audio.type.includes(
          'mp4'
        )
          ? 'm4a'
          : 'webm';

      const audioPath =
        `memory-uploads/${randomUUID()}.${ext(
          audio.name,
          fallbackAudioExtension
        )}`;

      const {
        error:
          audioUploadError,
      } =
        await sb.storage
          .from(
            'memory-media'
          )
          .upload(
            audioPath,
            audio,
            {
              contentType:
                audio.type ||
                'audio/webm',

              upsert: false,
            }
          );

      if (
        audioUploadError
      ) {
        throw audioUploadError;
      }

      const {
        data:
          publicAudio,
      } =
        sb.storage
          .from(
            'memory-media'
          )
          .getPublicUrl(
            audioPath
          );

      audioUrl =
        publicAudio.publicUrl;
    }

    /* =====================================================
       DIRECT STORAGE UPLOADS
       Signed media uploads bypass Vercel's 4.5 MB body cap.
       Verify the requested storage object exists before linking it.
       ===================================================== */
    for (const [field, kind] of [
      ['photoPath', 'image'],
      ['audioPath', 'audio'],
      ['videoPath', 'video'],
    ] as const) {
      const path = String(form.get(field) || '').trim();
      if (!path) continue;
      const result = await verifyMemoryUpload(sb, path, kind);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      if (kind === 'image') photoUrl = result.url;
      if (kind === 'audio') audioUrl = result.url;
      if (kind === 'video') videoUrl = result.url;
    }

    // A voice recording or video is a complete memory on its own.
    // Prevent empty recipient-only memories, but never require written text.
    if (!hasMeaningfulMemoryContent({
      message,
      photo: Boolean(photoUrl),
      audio: Boolean(audioUrl),
      video: Boolean(videoUrl),
    })) {
      return NextResponse.json(
        { error: 'Please add a photo, voice recording, video or written message.' },
        { status: 400 }
      );
    }

    /* =====================================================
       SAVE TO DATABASE
       ===================================================== */

    const {
      data: memory,
      error:
        databaseError,
    } = await sb
      .from('memories')
    .insert({
  code,

  customer_id:
    user?.id || null,

  recipient_name:
    recipient,

  message,

  sender_name:
    sender,

  photo_url:
    photoUrl,

  audio_url:
    audioUrl,

  video_url:
    videoUrl,
})
      .select(
        'code, recipient_name, message, sender_name, created_at, photo_url, audio_url, video_url'
      )
      .single();

    if (
      databaseError
    ) {
      throw databaseError;
    }

    /* =====================================================
       RETURN SAVED MEMORY
       ===================================================== */

    return NextResponse.json(
      {
        ok: true,

        code:
          memory.code,

        photoUrl:
          memory.photo_url,

        audioUrl:
          memory.audio_url,

        videoUrl:
          memory.video_url,

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
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      'CREATE MEMORY ERROR:',
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof
          Error
            ? error.message
            : 'Could not create memory.',
      },
      {
        status: 500,
      }
    );
  }
}
