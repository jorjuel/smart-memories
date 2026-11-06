'use client';

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  makeCode,
} from '../../lib/storage';

import {
  products,
} from '../../lib/products';
import Link from 'next/link';

import { uploadMemoryMedia, readMemorySaveResult } from '@/lib/memoryMediaUpload';
import { hasMeaningfulMemoryContent } from '@/lib/memoryContent';

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productSlug =
    searchParams.get('product');
  const mode = searchParams.get('mode');
  const memoryOnly = mode === 'tag';
  const memoryWithGift = mode === 'gift';

  const product = productSlug
    ? products.find(
        (item) =>
          item.slug === productSlug
      )
    : undefined;
  // Shop and Create a Memory now share this one memory-first experience.
  // Existing direct product links and old tag/gift URLs remain compatible.
  const unifiedJourney = !productSlug && !memoryOnly && !memoryWithGift;
  const allowTagVideoTrial = memoryOnly || unifiedJourney;
  const occasion = searchParams.get('occasion');
  const occasionGiftSlugs: Record<string, string[]> = {
    Birthday: ['photo-mug', 'smart-photo-slate', 'coaster-set', 'keyring', 'white-t-shirt'],
    Wedding: ['smart-photo-slate', 'smart-memory-plaque', 'photo-mug', 'coaster-set', 'keyring'],
    Anniversary: ['smart-photo-slate', 'smart-memory-plaque', 'photo-mug', 'keyring'],
    Retirement: ['photo-mug', 'smart-photo-slate', 'mouse-mat', 'keyring'],
    'Pet Memory': ['smart-photo-slate', 'keyring', 'photo-mug', 'coaster-set', 'mouse-mat'],
    'Family Memory': ['smart-photo-slate', 'photo-mug', 'coaster-set', 'smart-memory-plaque'],
    'New Baby': ['smart-photo-slate', 'photo-mug', 'smart-memory-plaque', 'keyring'],
  };
  const giftProducts = occasion && occasionGiftSlugs[occasion]
    ? products.filter((item) => occasionGiftSlugs[occasion].includes(item.slug))
    : products;

  const [recipient, setRecipient] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [sender, setSender] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const [photo, setPhoto] =
    useState<File>();

  const [photoUrl, setPhotoUrl] =
    useState('');

  // Video with sound is a small first trial for Memory Tag customers only.
  const [tagMediaMode, setTagMediaMode] = useState<'photo' | 'video'>('photo');
  const [video, setVideo] = useState<File>();
  const [videoUrl, setVideoUrl] = useState('');

  const [audio, setAudio] =
    useState<Blob>();

  const [audioUrl, setAudioUrl] =
    useState('');

  const [recording, setRecording] =
    useState(false);

  const [savedCode, setSavedCode] =
    useState<string | null>(null);

  const [savedPhotoUrl, setSavedPhotoUrl] =
    useState<string | null>(null);

  const [saved, setSaved] =
    useState(false);

  const media =
    useRef<MediaRecorder | null>(
      null
    );

  const chunks =
    useRef<Blob[]>([]);

  // On mobile, advance to the newly revealed add-on choices without asking
  // the customer to search around the form after a successful save.
  useEffect(() => {
    if (!saved || !(unifiedJourney || memoryWithGift)) return;
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById('sm-memory-finish-heading');
      if (!target) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [saved, unifiedJourney, memoryWithGift]);

  function choosePhoto(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (file) {
      setPhoto(file);

      setPhotoUrl(
        URL.createObjectURL(file)
      );
    }
  }

  function chooseVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowed.includes(file.type.toLowerCase()) || file.size > 30 * 1024 * 1024 || file.size === 0) {
      alert('Please choose an MP4, MOV or WebM video of 30 MB or smaller. MP4 (H.264/AAC) works best across phones.');
      e.target.value = '';
      return;
    }
    setVideo(file);
    setVideoUrl(URL.createObjectURL(file));
  }

  function selectTagMediaMode(next: 'photo' | 'video') {
    if (recording) return;
    setTagMediaMode(next);
    if (next === 'video') {
      setPhoto(undefined);
      setPhotoUrl('');
      setAudio(undefined);
      setAudioUrl('');
    } else {
      setVideo(undefined);
      setVideoUrl('');
    }
  }

  function chooseAudio(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (file) {
      setAudio(file);

      setAudioUrl(
        URL.createObjectURL(file)
      );
    }
  }

  async function start() {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      chunks.current = [];

      // AAC in MP4 is generally the most reliable format on iPhone.
      // Prefer it when supported; keep WebM/Opus for other browsers.
      const types = [
        'audio/mp4',
        'audio/webm;codecs=opus',
        'audio/webm',
      ];

      const mimeType =
        types.find((type) =>
          MediaRecorder.isTypeSupported(
            type
          )
        );

      const recorder =
        new MediaRecorder(
          stream,
          mimeType
            ? {
                mimeType,
              }
            : undefined
        );

      media.current = recorder;

      recorder.ondataavailable = (
        event
      ) => {
        if (event.data.size) {
          chunks.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const type =
          recorder.mimeType ||
          chunks.current[0]?.type ||
          'audio/webm';

        const blob =
          new Blob(
            chunks.current,
            {
              type,
            }
          );

        setAudio(blob);

        setAudioUrl(
          URL.createObjectURL(blob)
        );

        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      };

      recorder.start(250);

      setRecording(true);
    } catch {
      alert(
        'Microphone access failed. Please allow microphone permission, or upload an audio file instead.'
      );
    }
  }

  function stop() {
    if (
      media.current &&
      media.current.state !==
        'inactive'
    ) {
      media.current.stop();

      setRecording(false);
    }
  }

  async function saveMemory() {
    if (!recipient.trim()) {
      alert(
        'Please enter the recipient name.'
      );

      return;
    }

    if (recording) {
      alert(
        'Please stop the recording first.'
      );

      return;
    }

    if (allowTagVideoTrial && tagMediaMode === 'video' && !video) {
      alert('Please choose a video with sound, or switch back to the photo option.');
      return;
    }

    const usingVideo = allowTagVideoTrial && tagMediaMode === 'video';
    if (!hasMeaningfulMemoryContent({
      message,
      photo: !usingVideo && Boolean(photo),
      audio: !usingVideo && Boolean(audio),
      video: usingVideo && Boolean(video),
    })) {
      alert('Add a photograph, voice recording, video or written message before saving your memory.');
      return;
    }

    setSaving(true);

    try {
      const code =
        makeCode();

      const formData =
        new FormData();

      formData.set(
        'code',
        code
      );

      formData.set(
        'recipient',
        recipient.trim()
      );

      formData.set(
        'message',
        message
      );

      formData.set(
        'sender',
        sender
      );

      if (photo) {
        const photoPath = await uploadMemoryMedia(photo, 'photo');
        formData.set('photoPath', photoPath);
      }

      if (audio && (!allowTagVideoTrial || tagMediaMode === 'photo')) {
        const audioPath = await uploadMemoryMedia(audio, 'audio');
        formData.set('audioPath', audioPath);
      }

      if (allowTagVideoTrial && tagMediaMode === 'video' && video) {
        const videoPath = await uploadMemoryMedia(video, 'video');
        formData.set('videoPath', videoPath);
      }

      const response =
        await fetch(
          '/api/memories',
          {
            method: 'POST',
            body: formData,
          }
        );

      const result = await readMemorySaveResult(response);

      setSavedCode(code);
const permanentPhotoUrl =
  result.memory?.photoUrl ||
  result.memory?.photo_url ||
  result.photoUrl ||
  result.photo_url ||
  null;

setSavedPhotoUrl(permanentPhotoUrl);
      

      setSaved(true);
      if (memoryOnly) {
        // The memory is persisted before the customer chooses their bow.
        // Only the non-sensitive code is carried through the address bar.
        router.push(`/create/bow?code=${encodeURIComponent(code)}`);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Could not save memory'
      );
    } finally {
      setSaving(false);
    }
  }

  function addToBasket(chosenProduct = product) {
    if (
      !chosenProduct ||
      !savedCode
    ) {
      return;
    }

    const basketItem = {
      id: crypto.randomUUID(),

      productType:
        'product',

      productSlug:
        chosenProduct.slug,

      memoryCode:
        savedCode,

      name:
        chosenProduct.name,

      category:
        chosenProduct.category,

      recipient,

      imageUrl:
  savedPhotoUrl || null,

      price:
        chosenProduct.price,

      quantity: 1,
    };

    try {
      const existing =
        localStorage.getItem(
          'smart-memories-cart'
        );

      const parsed =
        existing
          ? JSON.parse(existing)
          : [];

      const basket =
        Array.isArray(parsed)
          ? parsed
          : [];

      basket.push(
        basketItem
      );

      localStorage.setItem(
        'smart-memories-cart',
        JSON.stringify(
          basket
        )
      );

      router.push(
        '/cart'
      );
    } catch {
      alert(
        'Your memory was saved, but the product could not be added to the basket.'
      );
    }
  }
  function payForDigitalMemory() {
    if (!savedCode) return;
    try {
      const previous = localStorage.getItem('smart-memories-cart');
      const decoded = previous ? JSON.parse(previous) : [];
      const items = Array.isArray(decoded) ? decoded : [];
      const index = items.findIndex((item: { productSlug?: string; memoryCode?: string }) =>
        item.productSlug === 'digital-memory' && item.memoryCode === savedCode
      );
      const lineItem = {
        id: index >= 0 && typeof items[index]?.id === 'string'
          ? items[index].id : crypto.randomUUID(),
        productType: 'product',
        productSlug: 'digital-memory',
        memoryCode: savedCode,
        name: 'Smart Memory — Digital Only',
        category: 'Digital Memories',
        imageUrl: savedPhotoUrl || null,
        price: 5,
        quantity: 1,
        personalisation: { digitalOnly: true, memoryCode: savedCode },
      };
      if (index >= 0) items[index] = lineItem;
      else items.push(lineItem);
      localStorage.setItem('smart-memories-cart', JSON.stringify(items));
      router.push('/checkout');
    } catch {
      alert('Your memory was saved, but checkout could not open. Please try again.');
    }
  }

  return (
    <section className="wrap smCompactMemoryForm">
      <div
        style={{
          maxWidth:
            '850px',
          margin:
            '0 auto',
        }}
      >
        {product ? (
          <>
            <span className="v14Eyebrow">
              PERSONALISE YOUR GIFT
            </span>

            <h1>
              {product.name}
            </h1>

            <p className="lead">
              {product.description}
            </p>

            <div
              style={{
                marginBottom:
                  '25px',
              }}
            >
              <strong>
                £
                {product.price.toFixed(
                  2
                )}
              </strong>
            </div>
          </>
        ) : (
          <>
            <span className="v14Eyebrow">STEP 1 OF 2 · YOUR MEMORY FIRST</span>
            <h1>
              Create a Smart Memory
            </h1>
            {unifiedJourney && (
              <p className="smUnifiedJourneyIntro">
                Start with the person and the message. Add a photo, voice recording
                or video if you wish. <strong>Choose a digital memory, a gift tag
                or a personalised gift after saving.</strong>
              </p>
            )}
            {(memoryOnly || memoryWithGift) && (
              <p className="smMemoryRouteChoice">
                <strong>{memoryOnly ? 'Memory Only' : 'Memory + Gift'}</strong>
                <Link href="/create">Change your choice</Link>
              </p>
            )}

            {!unifiedJourney && (
              <p className="lead">
                Your memory is saved online so the same link works from QR, NFC and email.
              </p>
            )}
          </>
        )}

        {unifiedJourney && (
          <div className="smUnifiedJourneySteps" aria-label="Your creation steps">
            <span><b>1.</b> Create your memory</span>
            <span><b>2.</b> Add a gift, or keep it digital</span>
          </div>
        )}
        <div className="form card smUnifiedMemoryEditor">

          <label>
            Recipient name

            <input
              value={
                recipient
              }
              onChange={(
                event
              ) =>
                setRecipient(
                  event.target.value
                )
              }
              placeholder="e.g. Sarah"
            />
          </label>

          <label className="smOptionalMemoryMessage">
            <span className="smOptionalMemoryMessageHeading">
              Written message <small>(optional)</small>
            </span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add a few words if you wish…"
              aria-describedby="sm-written-message-help"
            />
            <small id="sm-written-message-help">
              Your photo, voice recording or video can tell the whole story.
              Leave this blank if you prefer. If you have no media, write a message instead.
            </small>
          </label>

          <label>
            From

            <input
              value={
                sender
              }
              onChange={(
                event
              ) =>
                setSender(
                  event.target.value
                )
              }
              placeholder="e.g. Leo"
            />
          </label>

          {allowTagVideoTrial && (
            <fieldset className="smTagMediaSelector">
              <legend>Choose how the recipient will experience the memory</legend>
              <div className="smTagMediaOptions">
                <button type="button" className={tagMediaMode === 'photo' ? 'active' : ''}
                  aria-pressed={tagMediaMode === 'photo'} disabled={recording}
                  onClick={() => selectTagMediaMode('photo')}>
                  <strong>📷 Photo + voice</strong>
                  <small>Add a photo, then record or upload your message.</small>
                </button>
                <button type="button" className={tagMediaMode === 'video' ? 'active' : ''}
                  aria-pressed={tagMediaMode === 'video'} disabled={recording}
                  onClick={() => selectTagMediaMode('video')}>
                  <strong>🎬 Video with sound</strong>
                  <small>Upload a short video with its own audio.</small>
                </button>
              </div>
            </fieldset>
          )}

          {(!allowTagVideoTrial || tagMediaMode === 'photo') && (
            <>
          <label>
            Photograph

            <input
              type="file"
              accept="image/*"
              onChange={
                choosePhoto
              }
            />
          </label>

          {photoUrl && (
            <img
              className="preview"
              src={
                photoUrl
              }
              alt="Preview"
            />
          )}

          <div>
            <b>
              Voice message
            </b>

            <div className="actions">
              <button
                type="button"
                className="btn"
                onClick={
                  recording
                    ? stop
                    : start
                }
              >
                {recording
                  ? '■ Stop Recording'
                  : '● Record My Voice'}
              </button>
            </div>

            {audioUrl && (
              <div>
                <p className="success">
                  ✓ Voice message ready —
                  test it now:
                </p>

                <audio
                  controls
                  preload="metadata"
                  src={
                    audioUrl
                  }
                />
              </div>
            )}

            <label>
              Or upload audio

              <input
                type="file"
                accept="audio/*"
                onChange={
                  chooseAudio
                }
              />
            </label>
          </div>

            </>
          )}

          {allowTagVideoTrial && tagMediaMode === 'video' && (
            <div className="smTagVideoUpload">
              <label htmlFor="tag-memory-video">Upload your video with sound</label>
              <p>Choose a short video from your phone. MP4 works best across iPhone and Android. MOV and WebM are accepted for this trial. Maximum 30 MB.</p>
              <input id="tag-memory-video" type="file"
                accept="video/mp4,video/quicktime,video/webm"
                onChange={chooseVideo} />
              {videoUrl && (
                <video src={videoUrl} controls playsInline preload="metadata"
                  className="smTagVideoPreview" aria-label="Preview your video memory" />
              )}
              {video && <small className="success">✓ Video ready: {video.name} ({(video.size / (1024 * 1024)).toFixed(1)} MB)</small>}
            </div>
          )}

          {!saved && unifiedJourney && (
            <p className="smUnifiedNoGiftYet">
              Your memory comes first. Gift options appear after you save it.
            </p>
          )}
          {!saved && (
            <button
              disabled={
                saving
              }
              type="button"
              className="btn big"
              onClick={
                saveMemory
              }
            >
              {saving
                ? 'Saving securely...'
                : 'Save My Memory'}
            </button>
          )}

          {saved && (
            <div className="smartPrivacyNote">
              <strong>
                ✓ Memory saved
              </strong>

              <p>
                Your chosen memory content is now saved in Smart Memories.
              </p>

              {savedCode && (
                <small
                  style={{
                    display:
                      'block',
                    marginBottom:
                      '15px',
                  }}
                >
                  Memory code:{' '}
                  {savedCode}
                </small>
              )}

              {product ? (
                <button type="button" className="personaliseBasketButton"
                  onClick={() => addToBasket()}>
                  Add {product.name} to basket
                </button>
              ) : (memoryWithGift || unifiedJourney) ? (
                <section className="smUnifiedChooseFinish" aria-labelledby="sm-memory-finish-heading">
                  <span className="v14Eyebrow">STEP 2 · CHOOSE HOW TO SHARE</span>
                  <h2 id="sm-memory-finish-heading">Your memory comes first. Your gift is optional.</h2>
                  <p className="smUnifiedFinishIntro">
                    Your memory has been saved. Choose just the digital memory, a tag with a satin bow,
                    or add a personalised gift. Only your chosen option is added to checkout.
                  </p>
                  {unifiedJourney && (
                    <div className="smUnifiedFinishChoices">
                      <article className="smUnifiedFinishOption">
                        <span aria-hidden="true" className="smUnifiedOptionIcon">♡</span>
                        <h3>Smart Memory only</h3>
                        <p>Share by link. No physical product or delivery.</p>
                        <strong>£5.00</strong>
                        <button className="btn" type="button" onClick={payForDigitalMemory}>
                          Choose digital memory — £5
                        </button>
                      </article>
                      <article className="smUnifiedFinishOption">
                        <span aria-hidden="true" className="smUnifiedOptionIcon">🎀</span>
                        <h3>Memory gift tag</h3>
                        <p>A decorative satin bow and tag to open your memory.</p>
                        <strong>£5.00 + postage</strong>
                        <button className="btn secondary" type="button"
                          onClick={() => router.push(`/create/bow?code=${encodeURIComponent(savedCode || '')}&choice=tag`)}>
                          Choose your bow colour
                        </button>
                      </article>
                    </div>
                  )}
                  {tagMediaMode === 'video' && unifiedJourney ? (
                    <p className="smUnifiedVideoTrialNote">
                      Video memories are currently being trialled as digital memories and
                      satin-bow tags. For a printed gift, please choose the Photo + Voice
                      format and create a new memory.
                    </p>
                  ) : (
                  <div className="smAfterMemoryGift" id="memory-gifts">
                    <span className="v14Eyebrow">OPTIONAL GIFT ADD-ONS</span>
                    <h2>{occasion && occasionGiftSlugs[occasion]
                      ? `Add a gift for ${occasion}`
                      : 'Add a personalised gift to your memory'}</h2>
                    <p>These gifts include your saved Smart Memory. Choose a gift only if you want something physical.</p>
                    <div className="smAfterMemoryGiftGrid">
                      {giftProducts.map((item) => (
                        <article key={item.slug} className="smAfterMemoryGiftCard">
                          <span aria-hidden="true">{item.emoji}</span>
                          <strong>{item.name}</strong>
                          <small>£{item.price.toFixed(2)}</small>
                          <button type="button" className="btn small"
                            onClick={() => addToBasket(item)}>
                            Add this gift
                          </button>
                        </article>
                      ))}
                    </div>
                    {occasion && <Link href="/create" className="smAllMemoryGiftsLink">See all gift add-ons</Link>}
                  </div>
                  )}
                </section>
              ) : (
                <button type="button" className="personaliseBasketButton"
                  onClick={() => router.push(`/m/${savedCode}`)}>
                  View Memory
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding:
              '100px 30px',
            textAlign:
              'center',
          }}
        >
          Loading personalisation...
        </div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
