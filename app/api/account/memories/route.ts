import {
  NextResponse,
} from 'next/server';

import {
  createSupabaseServerClient,
} from '@/lib/supabaseServer';

import {
  supabaseAdmin,
} from '@/lib/supabaseAdmin';

export async function GET() {
  const auth =
    await createSupabaseServerClient();

  const {
    data: {
      user,
    },
  } =
    await auth.auth
      .getUser();

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

  const admin =
    supabaseAdmin();

  const {
    data,
    error,
  } =
    await admin
      .from('memories')
      .select(
        `
          code,
          recipient_name,
          message,
          sender_name,
          created_at,
          photo_url,
          audio_url,
          video_url
        `
      )
      .eq(
        'customer_id',
        user.id
      )
      .order(
        'created_at',
        {
          ascending: false,
        }
      );

  if (error) {
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

  return NextResponse.json(
    (data || []).map(
      (
        memory
      ) => ({
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
}