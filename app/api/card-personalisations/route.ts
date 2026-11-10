import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getCardPricePence } from '@/lib/pricing';
import { defaultCatalogueCards } from '@/lib/cardDesigns';
import { loadCardCatalogue } from '@/lib/cardCatalogueServer';
import { verifyMemoryUpload } from '@/lib/verifyMemoryUpload';

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

const artworkTypes = ['image/jpeg', 'image/png', 'image/webp'];

function hasArtworkSignature(bytes: Buffer, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return type === 'image/webp' && bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP';
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const occasion = String(formData.get('occasion') || '').trim();
    let designName = String(formData.get('designName') || '').trim();
    const cardSlug = String(formData.get('cardSlug') || '').trim();
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

    const memoryPhoto = formData.get('memoryPhoto');
    const audioFile = formData.get('audioFile');
    const artworkFile = formData.get('artworkFile');
    const artworkPath = String(formData.get('artworkPath') || '').trim();
    const ownDesign = !cardSlug && designName === 'Your Own Design';
    if (ownDesign && !artworkPath && (!(artworkFile instanceof File) || artworkFile.size === 0)) {
      return NextResponse.json({ error: 'Please upload your own card artwork.' }, { status: 400 });
    }
    if ((!ownDesign && artworkPath) || (artworkFile instanceof File && artworkFile.size > 0 &&
        (!ownDesign ||
         !artworkTypes.includes(artworkFile.type) ||
         artworkFile.size > 10 * 1024 * 1024))) {
      return NextResponse.json({ error: 'Card artwork must be JPG, PNG or WebP, up to 10 MB.' }, { status: 400 });
    }

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

    const legacySlug = defaultCatalogueCards.find((card) => card.name === designName)?.photoSlug;
    const card = ownDesign ? undefined : (await loadCardCatalogue()).find((item) =>
      cardSlug ? item.photoSlug === cardSlug : item.name === designName || item.photoSlug === legacySlug);
    if (!ownDesign && !card) return NextResponse.json({ error: 'Card design not found.' }, { status: 400 });
    designName = card?.name ?? designName;
    const totalPrice = getCardPricePence(cardType as 'traditional' | 'smart', includePrintedPhoto, card?.basePricePence) / 100;

    const supabase = supabaseAdmin();

    const recordId = crypto.randomUUID();

    let memoryPhotoUrl: string | null = null;
    let audioUrl: string | null = null;
    let artworkUrl: string | null = null;

    for (const [field, kind] of [
      ['artworkPath', 'image'],
      ['photoPath', 'image'],
      ['audioPath', 'audio'],
    ] as const) {
      const path = String(formData.get(field) || '').trim();
      if (!path) continue;
      const result = await verifyMemoryUpload(supabase, path, kind);
      if ('error' in result) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      if (field === 'artworkPath') {
        if (!artworkTypes.includes(result.mimeType)) {
          return NextResponse.json({ error: 'Card artwork must be JPG, PNG or WebP.' }, { status: 400 });
        }
        const { data: artwork, error } = await supabase.storage.from('memory-media').download(path);
        if (error || !artwork || !hasArtworkSignature(Buffer.from(await artwork.arrayBuffer()), result.mimeType)) {
          return NextResponse.json({ error: 'Invalid artwork image file.' }, { status: 400 });
        }
        artworkUrl = result.url;
      }
      if (field === 'photoPath') memoryPhotoUrl = result.url;
      if (field === 'audioPath') audioUrl = result.url;
    }

    if (!artworkUrl && ownDesign && artworkFile instanceof File) {
      const ext = getExtensionFromMimeType(artworkFile.type, 'jpg');
      const artworkPath = ['card-personalisations', recordId, `print-artwork.${ext}`].join('/');
      const bytes = Buffer.from(await artworkFile.arrayBuffer());
      if (!hasArtworkSignature(bytes, artworkFile.type)) {
        return NextResponse.json({ error: 'Invalid artwork image file.' }, { status: 400 });
      }
      const { error: artworkError } = await supabase.storage
        .from('memory-media')
        .upload(artworkPath, bytes, {
          contentType: artworkFile.type,
          upsert: false,
        });
      if (artworkError) {
        return NextResponse.json({ error: 'Could not upload your card artwork.' }, { status: 503 });
      }
      artworkUrl = supabase.storage.from('memory-media').getPublicUrl(artworkPath).data.publicUrl;
    }

    if (!memoryPhotoUrl && memoryPhoto instanceof File && memoryPhoto.size > 0) {
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

    if (!audioUrl && audioFile instanceof File && audioFile.size > 0) {
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

    const record = {
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
        ...(artworkUrl ? { artwork_url: artworkUrl } : {}),
    };

    const { data, error } = await supabase
      .from('card_personalisations')
      .insert(record)
      .select('id, occasion, design_name, card_type, recipient_name, front_greeting, inside_message, sender_name, colour, include_printed_photo, memory_photo_url, audio_url, total_price, status, created_at')
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
        artworkUrl,
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
