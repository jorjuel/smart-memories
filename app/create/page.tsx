'use client';

import {
  Suspense,
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

import CreateMemoryJourney from '../../components/CreateMemoryJourney';
import { uploadMemoryMedia, readMemorySaveResult } from '@/lib/memoryMediaUpload';

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

  // Video-with-sound is initially offered only in the Memory Only journey.
  const [memoryFormat, setMemoryFormat] = useState<'photo' | 'video'>('photo');
  const [video, setVideo] = useState<File>();
  const [videoUrl, setVideoUrl] = useState('');

  const [photoUrl, setPhotoUrl] =
    useState('');

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
    const kind = file.type.toLowerCase().split(';')[0];
    if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(kind)) {
      alert('Please choose an MP4, iPhone MOV or WebM video. MP4 is best for sharing.');
      e.target.value = '';
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      alert('Please choose a video smaller than 40 MB. Short MP4 clips play fastest.');
      e.target.value = '';
      return;
    }
    setVideo(file);
    setVideoUrl(previous => {
      if (previous) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  }

  function selectMemoryFormat(next: 'photo' | 'video') {
    if (recording) stop();
    setMemoryFormat(next);
    // Only upload the currently selected format; do not include stale files.
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

      // Prefer AAC in MP4 (particularly on iPhone/Safari) to avoid
      // WebM audio opening as a download on unsupported phones.
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

      if (memoryOnly && memoryFormat === 'video') {
        if (!video) {
          alert('Choose a short video with sound before saving your memory.');
          return;
        }
        const videoPath = await uploadMemoryMedia(video, 'video');
        formData.set('videoPath', videoPath);
      } else {
        if (photo) {
          const photoPath = await uploadMemoryMedia(photo, 'photo');
          formData.set('photoPath', photoPath);
        }
        if (audio) {
          const audioPath = await uploadMemoryMedia(audio, 'audio');
          formData.set('audioPath', audioPath);
        }
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
  const directMode =
    Boolean(productSlug) ||
    memoryOnly ||
    memoryWithGift ||
    searchParams.get(
      'direct'
    ) === '1';

  if (!directMode) {
    return (
      <CreateMemoryJourney />
    );
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
            <span className="v14Eyebrow">MAKE YOUR MEMORY</span>
            <h1>
              Create a Special Memory
            </h1>
            {(memoryOnly || memoryWithGift) && (
              <p className="smMemoryRouteChoice">
                <strong>{memoryOnly ? 'Memory Only' : 'Memory + Gift'}</strong>
                <Link href="/create">Change your choice</Link>
              </p>
            )}

            <p className="lead">
              Your memory is saved
              securely online so the
              same link works from
              email, QR and NFC.
            </p>
          </>
        )}

        <div className="form card">

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

          <label>
            Personal message

            <textarea
              value={
                message
              }
              onChange={(
                event
              ) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Write something meaningful..."
            />
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

          {memoryOnly && (
            <fieldset className="smTagMediaFormat">
              <legend>How should your memory appear?</legend>
              <div className="smTagMediaFormatOptions">
                <label>
                  <input type="radio" name="tag-media-format" value="photo"
                    checked={memoryFormat === 'photo'}
                    onChange={() => selectMemoryFormat('photo')} />
                  <span>Photo + voice message</span>
                </label>
                <label>
                  <input type="radio" name="tag-media-format" value="video"
                    checked={memoryFormat === 'video'}
                    onChange={() => selectMemoryFormat('video')} />
                  <span>Video with sound</span>
                </label>
              </div>
              <small>For this first trial, the video option is available with a Memory Tag only.</small>
            </fieldset>
          )}

          {memoryOnly && memoryFormat === 'video' ? (
            <div className="smTagVideoUpload">
              <label>
                Add your video (with sound)
                <input type="file" accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
                  onChange={chooseVideo} />
              </label>
              <small>Choose a short MP4 or iPhone MOV clip, maximum 40 MB.
                Short videos start playing faster, especially on mobile data.</small>
              {videoUrl && (
                <video className="smTagVideoPreview" controls playsInline preload="metadata"
                  src={videoUrl} aria-label="Preview your chosen video with sound" />
              )}
            </div>
          ) : (
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
                Your photograph,
                message and voice
                recording are now
                stored in Smart
                Memories.
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
              ) : memoryWithGift ? (
                <div className="smAfterMemoryGift">
                  <h2>Now choose the gift for your memory</h2>
                  <p>Your memory is safely saved. Select a gift below; it will be linked to the memory you have just created.</p>
                  <div className="smAfterMemoryGiftGrid">
                    {products.map((item) => (
                      <article key={item.slug} className="smAfterMemoryGiftCard">
                        <span aria-hidden="true">{item.emoji}</span>
                        <strong>{item.name}</strong>
                        <small>£{item.price.toFixed(2)}</small>
                        <button type="button" className="btn small"
                          onClick={() => addToBasket(item)}>
                          Select this gift
                        </button>
                      </article>
                    ))}
                  </div>
                  <Link href={`/m/${encodeURIComponent(savedCode || '')}`}>
                    View saved memory
                  </Link>
                </div>
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
