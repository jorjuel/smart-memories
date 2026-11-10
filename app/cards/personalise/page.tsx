'use client';

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import CardFront from '../../../components/CardFront';
import CardZoomDialog from '../../../components/CardZoomDialog';
import { defaultCatalogueCards, cardOccasionWording, cardPhotoSlugs, getCardWording, snowflakeCardSlug } from '../../../lib/cardDesigns';
import { hasMeaningfulMemoryContent } from '../../../lib/memoryContent';
import { uploadMemoryMedia } from '../../../lib/memoryMediaUpload';
import { CARD_PRICES_PENCE, getCardPricePence } from '../../../lib/pricing';
import { useCataloguePhoto } from '../../../lib/useCataloguePhoto';
import DeliverySummary from '@/components/DeliverySummary';

const cardMoney = (pence: number) => `£${(pence / 100).toFixed(2)}`;

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function getAudioFileExtension(type: string) {
  if (type.includes('mp4')) return 'm4a';
  if (type.includes('ogg')) return 'ogg';
  if (type.includes('mpeg')) return 'mp3';
  if (type.includes('wav')) return 'wav';

  return 'webm';
}

function PersonaliseCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [occasion, setOccasion] = useState(searchParams.get('occasion') || 'Just Because');
  const requestedDesign = searchParams.get('design') || 'Floral Keepsake';
  const defaultCard = defaultCatalogueCards.find((item) => item.name === requestedDesign);
  const photoSlug = searchParams.get('card') || defaultCard?.photoSlug;
  const { images, cards, removeUnavailablePhoto } = useCataloguePhoto(photoSlug);
  const catalogueCard = (cards ?? defaultCatalogueCards).find((item) => item.photoSlug === photoSlug);
  const design = catalogueCard?.name ?? requestedDesign;
  const basePricePence = catalogueCard?.basePricePence ?? CARD_PRICES_PENCE.traditional;
  const designPhoto = photoSlug ? images?.[photoSlug] : undefined;
  const photoViews = photoSlug ? cardPhotoSlugs(photoSlug)
    .map((slug, index) => ({ slug, src: images?.[slug], label: index === 0 ? 'Main photo' : `Angle ${index + 1}` }))
    .filter((view) => view.src) : [];
  const initialCardType = searchParams.get('cardType') === 'smart' ? 'smart' : 'traditional';

  const [cardType, setCardType] =
    useState<'traditional' | 'smart'>(initialCardType);

  const [recipient, setRecipient] = useState('');

  const [frontGreeting, setFrontGreeting] = useState(() => getCardWording(occasion)[0]);
  const [insideMessage, setInsideMessage] = useState(() => getCardWording(occasion)[1]);
  const [sender, setSender] = useState('');
  const [printedPhoto, setPrintedPhoto] = useState<File | null>(null);
  const [printedPhotoUrl, setPrintedPhotoUrl] = useState<string | null>(null);
  const [digitalMessage, setDigitalMessage] = useState('');
  const [memoryVideo, setMemoryVideo] = useState<File | null>(null);
  const [memoryVideoUrl, setMemoryVideoUrl] = useState<string>();
  const [videoError, setVideoError] = useState('');
  const [selectedPreview, setPreviewFace] = useState<'photo' | 'front' | 'inside'>();
  const [selectedPhotoSlug, setSelectedPhotoSlug] = useState<string>();
  const activePhoto = photoViews.find((view) => view.slug === selectedPhotoSlug) ?? photoViews[0];
  const previewFace = selectedPreview === 'inside' ? 'inside' :
    selectedPreview !== 'front' && activePhoto ? 'photo' : 'front';
  const previewDialog = useRef<HTMLDialogElement>(null);

  function changeOccasion(value: string) {
    const [previousFront, previousInside] = getCardWording(occasion);
    const [suggestedFront, suggestedInside] = getCardWording(value);
    setOccasion(value);
    setPreviewFace('front');
    if (!frontGreeting.trim() || frontGreeting === previousFront) setFrontGreeting(suggestedFront);
    if (!insideMessage.trim() || insideMessage === previousInside) setInsideMessage(suggestedInside);
  }

  const isOwnDesign = design === 'Your Own Design';
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  function handleArtwork(file: File | null) {
    if (artworkPreview) URL.revokeObjectURL(artworkPreview);
    if (!file) {
      setArtworkFile(null);
      setArtworkPreview(null);
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
        file.size > 10 * 1024 * 1024) {
      setArtworkFile(null);
      setArtworkPreview(null);
      setSaveError('Upload a JPG, PNG or WebP design under 10 MB.');
      return;
    }
    setSaveError(null);
    setArtworkFile(file);
    setArtworkPreview(URL.createObjectURL(file));
  }

  /* =========================================================
     MEMORY PHOTO
     ========================================================= */

  const [memoryPhotoFile, setMemoryPhotoFile] =
    useState<File | null>(null);

  const [memoryPhotoPreview, setMemoryPhotoPreview] =
    useState<string | null>(null);

  /* =========================================================
     VOICE RECORDING
     ========================================================= */

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [recordedAudioUrl, setRecordedAudioUrl] =
    useState<string | null>(null);

  const [recordedAudioBlob, setRecordedAudioBlob] =
    useState<Blob | null>(null);

  const [audioError, setAudioError] =
    useState<string | null>(null);

  const [uploadedAudioUrl, setUploadedAudioUrl] =
    useState<string | null>(null);

  const [uploadedAudioFile, setUploadedAudioFile] =
    useState<File | null>(null);

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null);

  const mediaStreamRef =
    useRef<MediaStream | null>(null);

  const audioChunksRef =
    useRef<Blob[]>([]);

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  /* =========================================================
     SAVE STATE
     ========================================================= */

  const [isSaving, setIsSaving] = useState(false);

  const [saveError, setSaveError] =
    useState<string | null>(null);
  const [missingDetail, setMissingDetail] = useState<{ id: string; message: string }>();

  const price = getCardPricePence(cardType, Boolean(printedPhoto), basePricePence);
  const savingRef = useRef(false);
  const pendingCard = useRef<{
    inputs: unknown[];
    saved?: { id: string; artworkUrl?: string; memoryPhotoUrl?: string; totalPrice: number };
    memoryCode?: string;
    artworkPath?: string;
    printedPhotoPath?: string;
    memoryPhotoPath?: string;
    audioPath?: string;
    videoPath?: string;
  } | null>(null);

  useEffect(() => {
    if (!printedPhoto) {
      setPrintedPhotoUrl(null);
      return;
    }
    const url = URL.createObjectURL(printedPhoto);
    setPrintedPhotoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [printedPhoto]);

  useEffect(() => {
    if (!memoryVideo) {
      setMemoryVideoUrl(undefined);
      return;
    }
    const url = URL.createObjectURL(memoryVideo);
    setMemoryVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [memoryVideo]);

  /* =========================================================
     CLEAN UP
     ========================================================= */

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (mediaStreamRef.current) {
        mediaStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  /* =========================================================
     PHOTO
     ========================================================= */

  function handleMemoryPhoto(file: File | null) {
    if (memoryPhotoPreview) {
      URL.revokeObjectURL(memoryPhotoPreview);
    }

    if (!file) {
      setMemoryPhotoFile(null);
      setMemoryPhotoPreview(null);
      return;
    }

    setMemoryPhotoFile(file);
    setMemoryPhotoPreview(URL.createObjectURL(file));
  }

  function removeMemoryPhoto() {
    if (memoryPhotoPreview) {
      URL.revokeObjectURL(memoryPhotoPreview);
    }

    setMemoryPhotoFile(null);
    setMemoryPhotoPreview(null);
  }

  /* =========================================================
     MICROPHONE
     ========================================================= */

  function getSupportedAudioMimeType() {
    if (typeof MediaRecorder === 'undefined') {
      return '';
    }

    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];

    return (
      types.find((type) =>
        MediaRecorder.isTypeSupported(type)
      ) || ''
    );
  }

  async function startRecording() {
    setAudioError(null);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setAudioError(
        'Voice recording is not supported by this browser. Please upload an audio file instead.'
      );
      return;
    }

    try {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }

      setRecordedAudioUrl(null);
      setRecordedAudioBlob(null);

      if (uploadedAudioUrl) {
        URL.revokeObjectURL(uploadedAudioUrl);
      }

      setUploadedAudioUrl(null);
      setUploadedAudioFile(null);

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      mediaStreamRef.current = stream;

      const mimeType = getSupportedAudioMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalType =
          recorder.mimeType ||
          audioChunksRef.current[0]?.type ||
          'audio/webm';

        const audioBlob = new Blob(
          audioChunksRef.current,
          {
            type: finalType,
          }
        );

        const audioUrl =
          URL.createObjectURL(audioBlob);

        setRecordedAudioBlob(audioBlob);
        setRecordedAudioUrl(audioUrl);

        if (mediaStreamRef.current) {
          mediaStreamRef.current
            .getTracks()
            .forEach((track) => track.stop());
        }

        mediaStreamRef.current = null;
      };

      recorder.start();

      setRecordingSeconds(0);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);
    } catch (error) {
      console.error(error);

      setAudioError(
        'Microphone access was not available. Please allow microphone permission in your browser and try again.'
      );
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }

    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function deleteRecording() {
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordingSeconds(0);
    setAudioError(null);
  }

  function handleAudioUpload(file: File | null) {
    if (!file) return;

    setAudioError(null);

    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
    }

    setRecordedAudioUrl(null);
    setRecordedAudioBlob(null);
    setRecordingSeconds(0);

    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }

    setUploadedAudioFile(file);
    setUploadedAudioUrl(URL.createObjectURL(file));
  }

  function removeUploadedAudio() {
    if (uploadedAudioUrl) {
      URL.revokeObjectURL(uploadedAudioUrl);
    }

    setUploadedAudioUrl(null);
    setUploadedAudioFile(null);
  }

  /* =========================================================
     ADD SAVED CARD TO BASKET
     ========================================================= */

  async function addCardToBasket() {
    if (savingRef.current) return;
    setSaveError(null);

    if (isOwnDesign && !artworkFile) {
      showMissingCardDetail('card-artwork', 'Please upload your card artwork.');
      return;
    }
    if (!isOwnDesign && !frontGreeting.trim()) {
      showMissingCardDetail('card-front-greeting', 'Please enter a front greeting.');
      return;
    }
    const audio = recordedAudioBlob
      ? new File([recordedAudioBlob], `voice-message.${getAudioFileExtension(recordedAudioBlob.type)}`, {
          type: recordedAudioBlob.type || 'audio/webm',
        })
      : uploadedAudioFile;
    if (cardType === 'smart' && !recipient.trim()) {
      showMissingCardDetail('card-recipient', 'Enter the recipient’s name for the Smart Memory.');
      return;
    }
    if (cardType === 'smart' && !hasMeaningfulMemoryContent({
      message: digitalMessage, photo: Boolean(memoryPhotoFile), audio: Boolean(audio), video: Boolean(memoryVideo),
    })) {
      showMissingCardDetail('card-digital-message', 'Add a digital message, photo, voice recording or video for the Smart Memory.');
      return;
    }

    savingRef.current = true;
    setIsSaving(true);
    try {
      const inputs = [
        photoSlug, design, occasion, cardType, recipient, frontGreeting, insideMessage, sender,
        artworkFile, printedPhoto, memoryPhotoFile, recordedAudioBlob, uploadedAudioFile, digitalMessage, memoryVideo,
      ];
      if (!pendingCard.current || !inputs.every((value, index) => value === pendingCard.current?.inputs[index])) {
        pendingCard.current = { inputs };
      }
      const pending = pendingCard.current;
      const form = new FormData();
      form.set('occasion', occasion);
      form.set('designName', design);
      if (photoSlug) form.set('cardSlug', photoSlug);
      form.set('cardType', cardType);
      form.set('recipientName', recipient);
      form.set('frontGreeting', frontGreeting);
      form.set('insideMessage', insideMessage);
      form.set('senderName', sender);
      form.set('includePrintedPhoto', String(Boolean(printedPhoto)));
      let saved = pending.saved;
      if (!saved) {
        if (artworkFile) pending.artworkPath ??= await uploadMemoryMedia(artworkFile, 'photo');
        if (printedPhoto) pending.printedPhotoPath ??= await uploadMemoryMedia(printedPhoto, 'photo');
        if (cardType === 'smart' && memoryPhotoFile) {
          pending.memoryPhotoPath ??= await uploadMemoryMedia(memoryPhotoFile, 'photo');
        }
        if (cardType === 'smart' && audio) pending.audioPath ??= await uploadMemoryMedia(audio, 'audio');

        if (pending.artworkPath) form.set('artworkPath', pending.artworkPath);
        const cardPhotoPath = pending.printedPhotoPath || pending.memoryPhotoPath;
        if (cardPhotoPath) form.set('photoPath', cardPhotoPath);
        if (pending.audioPath) form.set('audioPath', pending.audioPath);
        const response = await fetch('/api/card-personalisations', { method: 'POST', body: form });
        const result: { error?: string; personalisation?: typeof pending.saved } = await response.json();
        if (!response.ok || !result.personalisation?.id) throw new Error(result.error || 'Could not save your personalised card.');
        saved = pending.saved = result.personalisation;
      }

      if (cardType === 'smart' && !pending.memoryCode) {
        const memory = new FormData();
        memory.set('recipient', recipient);
        memory.set('sender', sender);
        memory.set('message', digitalMessage);
        if (pending.memoryPhotoPath) memory.set('photoPath', pending.memoryPhotoPath);
        if (pending.audioPath) memory.set('audioPath', pending.audioPath);
        if (memoryVideo) {
          pending.videoPath ??= await uploadMemoryMedia(memoryVideo, 'video');
          memory.set('videoPath', pending.videoPath);
        }
        const memoryResponse = await fetch('/api/memories', { method: 'POST', body: memory });
        const result = await memoryResponse.json();
        if (!memoryResponse.ok || !result.code) throw new Error(result.error || 'Could not save your Smart Memory.');
        pending.memoryCode = result.code;
      }

      const { id, artworkUrl, memoryPhotoUrl } = saved;
      const stored = localStorage.getItem('smart-memories-cart');
      const parsed = stored ? JSON.parse(stored) : [];
      const basket = Array.isArray(parsed) ? parsed : [];
      basket.push({
        id: crypto.randomUUID(),
        personalisationId: id,
        memoryCode: pending.memoryCode,
        productType: cardType === 'smart' ? 'smart-card' : 'traditional-card',
        name: cardType === 'smart' ? `${design} Smart Memory Card` : `${design} Handcrafted Card`,
        occasion,
        design,
        recipient,
        imageUrl: artworkUrl || (printedPhoto ? memoryPhotoUrl : designPhoto) || null,
        cardPreview: { greeting: frontGreeting.trim(), printedPhoto: Boolean(printedPhoto) },
        personalisation: artworkUrl ? { printArtworkUrl: artworkUrl } : undefined,
        price: Number(saved.totalPrice),
        quantity: 1,
      });
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      router.push('/cart');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not add your card to the basket.');
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  function showMissingCardDetail(id: string, message: string) {
    setMissingDetail({ id, message });
    const field = document.getElementById(id);
    const details = field?.closest('details');
    if (details) details.open = true;
    field?.focus({ preventScroll: true });
    field?.scrollIntoView({ block: 'center' });
  }

  function cardFieldError(id: string) {
    return missingDetail?.id === id ? (
      <small id={`${id}-error`} className="voiceError" role="alert">{missingDetail.message}</small>
    ) : null;
  }

  function openCardReview(face: 'front' | 'inside') {
    setPreviewFace(face);
    previewDialog.current?.showModal();
  }

  const previewArtwork = previewFace === 'photo' && activePhoto ? (
    <div className="cardDesignPreview smCardFace">
      <img key={activePhoto.slug} className="smCardUploadedArt" src={activePhoto.src} alt={`${design} · ${activePhoto.label}`} onError={() => removeUnavailablePhoto(activePhoto.slug)} />
    </div>
  ) : previewFace === 'inside' ? (
    <div className="insidePreview smCardFace smCardInside">
      <span>INSIDE YOUR CARD</span>
      <p>{insideMessage || 'Your personal message will appear here.'}</p>
      {sender && <strong>With love, {sender}</strong>}
    </div>
  ) : (
    <CardFront design={design} photoSlug={photoSlug} greeting={frontGreeting || 'Your greeting'} recipient={recipient}
      photo={printedPhotoUrl} artwork={artworkPreview} smart={cardType === 'smart'} />
  );

  if (photoSlug === snowflakeCardSlug || requestedDesign === 'Christmas Snowflake') return <section className="wrap">
    <h1>Card unavailable</h1>
    <Link className="btn" href="/cards">Browse handmade cards</Link>
  </section>;

  return (
    <>
      <section className="personaliseHeader smCardEditorHeader">
        <Link href={{ pathname: '/cards', query: { cardType, occasion } }} className="personaliseBack">← Back to card designs</Link>
        <span className="v14Eyebrow">HANDCRAFTED CARDS</span>
        <h1>{design}</h1>
        <p>Make it theirs with a personal message and an optional Smart Memory.</p>
      </section>

      <section className="personaliseLayout smCardEditor">
        <aside className="personalisePreview smCardPreview" id="card-preview" tabIndex={-1} aria-label="Card preview">
          <div className="previewHeading">
            <span>{previewFace === 'photo' ? 'DESIGN PHOTO' : 'LIVE PREVIEW'}</span>
            <button type="button" className="smCardTextButton smCardEditorEnlarge" aria-haspopup="dialog"
              onClick={() => previewDialog.current?.showModal()}>Enlarge preview</button>
          </div>
          <div className="smCardPhotoGallery">
            {photoViews.length > 1 && <div className="smCardPhotoThumbnails" role="group" aria-label="Card photo angles">
              {photoViews.map((view) => (
                <button key={view.slug} type="button" aria-label={view.label}
                  aria-pressed={previewFace === 'photo' && activePhoto?.slug === view.slug}
                  onClick={() => { setSelectedPhotoSlug(view.slug); setPreviewFace('photo'); }}>
                  <img src={view.src} alt="" onError={() => removeUnavailablePhoto(view.slug)} />
                </button>
              ))}
            </div>}
            {previewArtwork}
          </div>
          <div className="smCardFaceSwitch" role="group" aria-label="Card preview side">
            {activePhoto && <button type="button" aria-pressed={previewFace === 'photo'} onClick={() => setPreviewFace('photo')}>Design photo</button>}
            <button type="button" aria-pressed={previewFace === 'front'} onClick={() => setPreviewFace('front')}>Front</button>
            <button type="button" aria-pressed={previewFace === 'inside'} onClick={() => setPreviewFace('inside')}>Inside</button>
          </div>
          <a className="smCardTextButton smCardPreviewJump" href="#card-personalisation">Personalise this card ↓</a>
        </aside>
        <CardZoomDialog dialog={previewDialog} title={design}>{previewArtwork}</CardZoomDialog>

        <fieldset className="personaliseControls smCardControls" id="card-personalisation" disabled={isSaving}
          onChange={() => setMissingDetail(undefined)}>
          <div className="personaliseBlock">
            <div className="smCardOrderIntro">
              <strong>{cardMoney(price)}</strong>
              <a className="smCardTextButton smCardPreviewJump" href="#card-preview">See preview</a>
            </div>
            <span className="personaliseStep">01</span>
            <h2>Inside message</h2>
            <label className="personaliseField">
              <span>Your message</span>
              <textarea rows={4} maxLength={500} value={insideMessage} onFocus={() => setPreviewFace('inside')}
                onChange={(event) => {
                  setInsideMessage(event.target.value);
                  setPreviewFace('inside');
                }} />
            </label>
            <label className="personaliseField">
              <span>From (optional)</span>
              <input value={sender} maxLength={60} onFocus={() => setPreviewFace('inside')}
                onChange={(event) => setSender(event.target.value)} />
            </label>
            <details className="smCardOptionalDetails" open={isOwnDesign}>
              <summary>{isOwnDesign ? 'Upload artwork and edit card details' : 'Other card details (optional)'}</summary>
              <div>
                <h3>Front wording</h3>
                <label className="personaliseField">
                  <span>Occasion</span>
                  <select value={occasion} onChange={(event) => changeOccasion(event.target.value)}>
                    {!Object.hasOwn(cardOccasionWording, occasion) && <option>{occasion}</option>}
                    {Object.keys(cardOccasionWording).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="personaliseField">
                  <span>{isOwnDesign ? 'Front wording for your order (optional)' : 'Front greeting'}</span>
                  <input id="card-front-greeting" value={frontGreeting} maxLength={100} onFocus={() => setPreviewFace('front')}
                    aria-invalid={missingDetail?.id === 'card-front-greeting' || undefined}
                    aria-describedby={missingDetail?.id === 'card-front-greeting' ? 'card-front-greeting-error' : undefined}
                    onChange={(event) => {
                      setFrontGreeting(event.target.value);
                      setPreviewFace('front');
                    }} />
                  {cardFieldError('card-front-greeting')}
                </label>
                <button className="smCardTextButton" type="button" onClick={() => {
                  const [front, inside] = getCardWording(occasion);
                  setFrontGreeting(front);
                  setInsideMessage(inside);
                  setPreviewFace('front');
                }}>Use suggested wording</button>
              </div>

              <div>
                <h3>Card details</h3>
                {cardType === 'traditional' && <label className="personaliseField">
                  <span>Recipient name (optional)</span>
                  <input id="card-recipient" value={recipient} maxLength={60} onFocus={() => setPreviewFace('front')}
                    aria-invalid={missingDetail?.id === 'card-recipient' || undefined}
                    aria-describedby={missingDetail?.id === 'card-recipient' ? 'card-recipient-error' : undefined}
                    onChange={(event) => setRecipient(event.target.value)} />
                  {cardFieldError('card-recipient')}
                </label>}
                {isOwnDesign ? (
                  <label className="personaliseField">
                    <span>Card front artwork (JPG, PNG or WebP, up to 10 MB)</span>
                    <input id="card-artwork" type="file" accept="image/jpeg,image/png,image/webp"
                      aria-invalid={missingDetail?.id === 'card-artwork' || undefined}
                      aria-describedby={missingDetail?.id === 'card-artwork' ? 'card-artwork-error' : undefined}
                      onChange={(event) => {
                        handleArtwork(event.target.files?.[0] || null);
                        setPreviewFace('front');
                      }} />
                    {cardFieldError('card-artwork')}
                  </label>
                ) : (
                  <>
                    <label className="personaliseField">
                      <span>Add a printed photograph · +{cardMoney(CARD_PRICES_PENCE.printedPhoto)}</span>
                      <input type="file" accept="image/*" onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
                          setSaveError('Choose an image up to 10 MB.');
                          event.target.value = '';
                          return;
                        }
                        setSaveError(null);
                        setPrintedPhoto(file);
                        setPreviewFace('front');
                        event.target.value = '';
                      }} />
                    </label>
                    {printedPhoto && (
                      <button className="smCardTextButton" type="button" onClick={() => {
                        setPrintedPhoto(null);
                        setPreviewFace('front');
                      }}>Remove printed photograph</button>
                    )}
                  </>
                )}
              </div>

            </details>
          </div>

          <div className="personaliseBlock">
            <span className="personaliseStep">02</span>
            <h2>Add Smart Memory <small>(optional) · {cardMoney(CARD_PRICES_PENCE.smart - CARD_PRICES_PENCE.traditional)}</small></h2>
            <label className="photoOption">
              <input type="checkbox" checked={cardType === 'smart'} disabled={isRecording}
                onChange={(event) => {
                  setCardType(event.target.checked ? 'smart' : 'traditional');
                  setPreviewFace('front');
                }} />
              <span>
                <strong>Add Smart Tap access and QR access · +{cardMoney(CARD_PRICES_PENCE.smart - CARD_PRICES_PENCE.traditional)}</strong>
                <small>Share a digital message, photo, voice recording or video.</small>
              </span>
            </label>
          </div>
          {cardType === 'smart' && (
            <div className="personaliseBlock smartMemoryBuilder">
              <h3>Your digital memory</h3>
              <p>Add at least one message, photo, recording or video. Voice is optional.</p>
              <label className="personaliseField">
                <span>Recipient name</span>
                <input id="card-recipient" value={recipient} maxLength={60} aria-required="true"
                  aria-invalid={missingDetail?.id === 'card-recipient' || undefined}
                  aria-describedby={missingDetail?.id === 'card-recipient' ? 'card-recipient-error' : undefined}
                  onChange={(event) => setRecipient(event.target.value)} />
                {cardFieldError('card-recipient')}
              </label>
              <label className="personaliseField">
                <span>Digital message (optional)</span>
                <textarea id="card-digital-message" rows={3} maxLength={1500} value={digitalMessage}
                  aria-describedby={missingDetail?.id === 'card-digital-message' ? 'card-digital-message-error' : undefined}
                  onChange={(event) => setDigitalMessage(event.target.value)} />
                {cardFieldError('card-digital-message')}
              </label>

              <div className="smartMemoryOptions">

                <div>
                  <span className="memoryOptionIcon">
                    PHOTO
                  </span>

                  <strong>
                    Memory photograph
                  </strong>

                  <small>
                    Upload the photograph they will see when they tap.
                  </small>

                  {!memoryPhotoPreview && (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) =>
                        handleMemoryPhoto(
                          event.target.files?.[0] ||
                            null
                        )
                      }
                    />
                  )}

                  {memoryPhotoPreview && (
                    <div className="recordingPreview">
                      <strong>
                        Memory photograph ready
                      </strong>

                      <img
                        src={memoryPhotoPreview}
                        alt="Memory preview"
                        style={{
                          width: '100%',
                          maxHeight: '220px',
                          objectFit: 'cover',
                          borderRadius: '10px',
                        }}
                      />

                      <button
                        type="button"
                        onClick={
                          removeMemoryPhoto
                        }
                      >
                        Remove photograph
                      </button>
                    </div>
                  )}
                </div>

                <div className="voiceRecorderCard">
                  <span className="memoryOptionIcon">
                    VOICE
                  </span>

                  <strong>
                    Voice message (optional)
                  </strong>

                  <small>
                    Record or upload audio if you’d like them to hear your voice.
                  </small>

                  {!isRecording &&
                    !recordedAudioUrl &&
                    !uploadedAudioUrl && (
                      <button
                        type="button"
                        className="voiceRecordButton"
                        onClick={
                          startRecording
                        }
                      >
                        🎙 Record my voice
                      </button>
                    )}

                  {isRecording && (
                    <div className="recordingLive">
                      <div className="recordingStatus">
                        <span className="recordingDot"></span>

                        <strong>
                          Recording
                        </strong>

                        <span>
                          {formatTime(
                            recordingSeconds
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="voiceStopButton"
                        onClick={
                          stopRecording
                        }
                      >
                        ■ Stop recording
                      </button>
                    </div>
                  )}

                  {recordedAudioUrl &&
                    !isRecording && (
                      <div className="recordingPreview">
                        <strong>
                          Your recording is ready
                        </strong>

                        <span>
                          Duration:{' '}
                          {formatTime(
                            recordingSeconds
                          )}
                        </span>

                        <audio
                          controls
                          preload="metadata"
                          src={
                            recordedAudioUrl
                          }
                        />

                        <div className="recordingActions">
                          <button
                            type="button"
                            onClick={
                              deleteRecording
                            }
                          >
                            Delete
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              deleteRecording();

                              setTimeout(
                                () => {
                                  startRecording();
                                },
                                100
                              );
                            }}
                          >
                            Record again
                          </button>
                        </div>
                      </div>
                    )}

                  {uploadedAudioUrl && (
                    <div className="recordingPreview">
                      <strong>
                        Uploaded audio
                      </strong>

                      <span>
                        {uploadedAudioFile?.name}
                      </span>

                      <audio
                        controls
                        preload="metadata"
                        src={
                          uploadedAudioUrl
                        }
                      />

                      <button
                        type="button"
                        onClick={
                          removeUploadedAudio
                        }
                      >
                        Remove uploaded audio
                      </button>
                    </div>
                  )}

                  {!isRecording &&
                    !recordedAudioUrl &&
                    !uploadedAudioUrl && (
                      <>
                        <div className="voiceDivider">
                          <span>OR</span>
                        </div>

                        <label className="voiceUploadOption">
                          <span>
                            Upload an existing recording
                          </span>

                          <input
                            type="file"
                            accept="audio/*"
                            onChange={(event) =>
                              handleAudioUpload(
                                event.target.files?.[0] ||
                                  null
                              )
                            }
                          />
                        </label>
                      </>
                    )}

                  {audioError && (
                    <p className="voiceError">
                      {audioError}
                    </p>
                  )}
                </div>
              </div>

              <div className="smCardVideoOption">
                <label className="personaliseField">
                  <span>Video (optional)</span>
                  <small>MP4, MOV or WebM, up to 30 MB.</small>
                  <input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (!file) return;
                      if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type) ||
                          !file.size || file.size > 30 * 1024 * 1024) {
                        setVideoError('Choose an MP4, MOV or WebM video of 30 MB or smaller.');
                        return;
                      }
                      setVideoError('');
                      setMemoryVideo(file);
                    }} />
                </label>
                {videoError && <p className="voiceError" role="alert">{videoError}</p>}
                {memoryVideoUrl && (
                  <div className="recordingPreview">
                    <video src={memoryVideoUrl} controls playsInline preload="metadata" aria-label="Smart Memory video preview" />
                    <button type="button" onClick={() => { setMemoryVideo(null); setVideoError(''); }}>Remove video</button>
                  </div>
                )}
              </div>

              <div className="smartPrivacyNote">
                <strong>
                  Your memory is separate from the printed card.
                </strong>

                <p>
                  The NFC chip contains only the Smart Memories link.
                  Your message, photograph, voice recording and video are stored digitally.
                </p>
              </div>
            </div>
          )}
        </fieldset>

        <section className="personaliseBlock smCardReview" aria-labelledby="card-review">
          <span className="personaliseStep">03</span>
          <h2 id="card-review">Review &amp; add to basket</h2>
          <p>{design} · {occasion}{recipient.trim() ? ` · For ${recipient.trim()}` : ''}</p>
          <div className="smCardFaceSwitch" role="group" aria-label="Review your card">
            <button type="button" aria-haspopup="dialog" onClick={() => openCardReview('front')}>Review front</button>
            <button type="button" aria-haspopup="dialog" onClick={() => openCardReview('inside')}>Review inside</button>
          </div>
          <div className="orderSummary">
            <div><span>{design}</span><strong>{cardMoney(basePricePence)}</strong></div>
            {printedPhoto && <div><span>Printed photograph</span><strong>{cardMoney(CARD_PRICES_PENCE.printedPhoto)}</strong></div>}
            {cardType === 'smart' && <div><span>Smart Memory</span><strong>{cardMoney(CARD_PRICES_PENCE.smart - CARD_PRICES_PENCE.traditional)}</strong></div>}
            <div className="orderTotal"><span>Total</span><strong>{cardMoney(price)}</strong></div>
          </div>
          <button type="button" className="personaliseBasketButton" onClick={addCardToBasket} disabled={isSaving || isRecording || Boolean(photoSlug && !catalogueCard)}>
            {isSaving ? 'Saving your card…' : 'Add to basket'}
          </button>
          <DeliverySummary />
          <p className="basketSmallPrint">Your personalisation is saved when you add the card to your basket.</p>
          {saveError && <p className="voiceError" role="alert">{saveError}</p>}
        </section>
      </section>
    </>
  );
}

export default function PersonaliseCardPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: '100px 30px',
            textAlign: 'center',
          }}
        >
          Loading your card...
        </div>
      }
    >
      <PersonaliseCardContent />
    </Suspense>
  );
}
