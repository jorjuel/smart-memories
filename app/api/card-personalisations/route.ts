import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

function getExtensionFromMimeType(mimeType: string, fallback: string) {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/heic': 'heic',
    'audio/webm': 'webm',
    'audio/ogg': 'ogg',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
  };

  return map[mimeType] || fallback;
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-');
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const occasion = String(formData.get('occasion') || '').trim();
    const designName = String(formData.get('designName') || '').trim();
    const cardType = String(formData.get('cardType') || '').trim();

    const recipientName = String(
      formData.get('recipientName') || ''
    ).trim();

    const frontGreeting = String(
      formData.get('frontGreeting') || ''
    ).trim();

    const insideMessage = String(
      formData.get('insideMessage') || ''
    ).trim();

    const senderName = String(
      formData.get('senderName') || ''
    ).trim();

    const colour = String(formData.get('colour') || '').trim();

    const includePrintedPhoto =
      String(formData.get('includePrintedPhoto') || 'false') === 'true';

    const totalPrice = Number(formData.get('totalPrice') || 0);

    const memoryPhoto = formData.get('memoryPhoto');
    const audioFile = formData.get('audioFile');

    if (!occasion) {
      return NextResponse.json(
        { error: 'Occasion is required.' },
        { status: 400 }
      );
    }

    if (!designName) {
      return NextResponse.json(
        { error: 'Design name is required.' },
        { status: 400 }
      );
    }

    if (!['traditional', 'smart'].includes(cardType)) {
      return NextResponse.json(
        { error: 'Invalid card type.' },
        { status: 400 }
      );
    }

    if (!Number.isFinite(totalPrice) || totalPrice < 0) {
      return NextResponse.json(
        { error: 'Invalid total price.' },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const recordId = crypto.randomUUID();

    let memoryPhotoUrl: string | null = null;
    let audioUrl: string | null = null;

    if (memoryPhoto instanceof File && memoryPhoto.size > 0) {
      const maxPhotoSize = 10 * 1024 * 1024;

      if (memoryPhoto.size > maxPhotoSize) {
        return NextResponse.json(
          { error: 'Photo must be 10MB or smaller.' },
          { status: 400 }
        );
      }

      if (!memoryPhoto.type.startsWith('image/')) {
        return NextResponse.json(
          { error: 'Memory photo must be an image file.' },
          { status: 400 }
        );
      }

      const photoExtension = getExtensionFromMimeType(
        memoryPhoto.type,
        memoryPhoto.name.split('.').pop() || 'jpg'
      );

      const photoPath = [
        'card-personalisations',
        recordId,
        `memory-photo-${Date.now()}.${safeFileName(photoExtension)}`,
      ].join('/');

      const photoBuffer = Buffer.from(
        await memoryPhoto.arrayBuffer()
      );

      const { error: photoUploadError } = await supabase.storage
        .from('memory-media')
        .upload(photoPath, photoBuffer, {
          contentType: memoryPhoto.type,
          upsert: false,
        });

      if (photoUploadError) {
        console.error(photoUploadError);

        return NextResponse.json(
          { error: 'Could not upload the memory photo.' },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from('memory-media')
        .getPublicUrl(photoPath);

      memoryPhotoUrl = publicUrl;
    }

    if (audioFile instanceof File && audioFile.size > 0) {
      const maxAudioSize = 25 * 1024 * 1024;

      if (audioFile.size > maxAudioSize) {
        return NextResponse.json(
          { error: 'Voice recording must be 25MB or smaller.' },
          { status: 400 }
        );
      }

      if (!audioFile.type.startsWith('audio/')) {
        return NextResponse.json(
          { error: 'Voice message must be an audio file.' },
          { status: 400 }
        );
      }

      const audioExtension = getExtensionFromMimeType(
        audioFile.type,
        audioFile.name.split('.').pop() || 'webm'
      );

      const audioPath = [
        'card-personalisations',
        recordId,
        `voice-${Date.now()}.${safeFileName(audioExtension)}`,
      ].join('/');

      const audioBuffer = Buffer.from(
        await audioFile.arrayBuffer()
      );

      const { error: audioUploadError } = await supabase.storage
        .from('memory-media')
        .upload(audioPath, audioBuffer, {
          contentType: audioFile.type,
          upsert: false,
        });

      if (audioUploadError) {
        console.error(audioUploadError);

        return NextResponse.json(
          { error: 'Could not upload the voice recording.' },
          { status: 500 }
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from('memory-media')
        .getPublicUrl(audioPath);

      audioUrl = publicUrl;
    }

    const { data, error } = await supabase
      .from('card_personalisations')
      .insert({
        id: recordId,
        occasion,
        design_name: designName,
        card_type: cardType,
        recipient_name: recipientName || null,
        front_greeting: frontGreeting || null,
        inside_message: insideMessage || null,
        sender_name: senderName || null,
        colour: colour || null,
        include_printed_photo: includePrintedPhoto,
        memory_photo_url: memoryPhotoUrl,
        audio_url: audioUrl,
        total_price: totalPrice,
        status: 'saved',
      })
      .select(
        `
          id,
          occasion,
          design_name,
          card_type,
          recipient_name,
          front_greeting,
          inside_message,
          sender_name,
          colour,
          include_printed_photo,
          memory_photo_url,
          audio_url,
          total_price,
          status,
          created_at
        `
      )
      .single();

    if (error) {
      console.error(error);

      return NextResponse.json(
        { error: 'Could not save the card personalisation.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      personalisation: {
        id: data.id,
        occasion: data.occasion,
        designName: data.design_name,
        cardType: data.card_type,
        recipientName: data.recipient_name,
        frontGreeting: data.front_greeting,
        insideMessage: data.inside_message,
        senderName: data.sender_name,
        colour: data.colour,
        includePrintedPhoto: data.include_printed_photo,
        memoryPhotoUrl: data.memory_photo_url,
        audioUrl: data.audio_url,
        totalPrice: data.total_price,
        status: data.status,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: 'Unexpected server error.' },
      { status: 500 }
    );
  }
}