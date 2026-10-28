import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const sb = supabaseAdmin();

    const { data, error } = await sb
      .from('memories')
      .select(
        'code, recipient_name, message, sender_name, created_at, photo_url, audio_url, video_url'
      )
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Memory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      code: data.code,
      recipient: data.recipient_name,
      message: data.message,
      sender: data.sender_name,
      created_at: data.created_at,
      photoUrl: data.photo_url,
      audioUrl: data.audio_url,
      videoUrl: data.video_url,
    });
  } catch (e) {
    console.error('LOAD MEMORY ERROR:', e);

    return NextResponse.json(
      { error: 'Could not load memory' },
      { status: 500 }
    );
  }
}