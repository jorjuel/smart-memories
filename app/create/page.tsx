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

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productSlug =
    searchParams.get('product');

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

      const types = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
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

      if (photo) {
        formData.set(
          'photo',
          photo
        );
      }

      if (audio) {
        const extension =
          audio.type.includes(
            'mp4'
          )
            ? 'm4a'
            : 'webm';

        formData.set(
          'audio',
          new File(
            [audio],
            `message.${extension}`,
            {
              type:
                audio.type,
            }
          )
        );
      }

      const response =
        await fetch(
          '/api/memories',
          {
            method: 'POST',
            body: formData,
          }
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Could not save memory'
        );
      }

      setSavedCode(code);
const permanentPhotoUrl =
  result.memory?.photoUrl ||
  result.memory?.photo_url ||
  result.photoUrl ||
  result.photo_url ||
  null;

setSavedPhotoUrl(permanentPhotoUrl);
      

      setSaved(true);
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

  function addToBasket() {
    if (
      !product ||
      !savedCode
    ) {
      return;
    }

    const basketItem = {
      id: crypto.randomUUID(),

      productType:
        'product',

      productSlug:
        product.slug,

      memoryCode:
        savedCode,

      name:
        product.name,

      category:
        product.category,

      recipient,

      imageUrl:
  savedPhotoUrl || null,

      price:
        product.price,

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

  return (
    <section className="wrap">
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
            <h1>
              Create a Special Memory
            </h1>

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
                <button
                  type="button"
                  className="personaliseBasketButton"
                  onClick={
                    addToBasket
                  }
                >
                  Add {product.name} to basket
                </button>
              ) : (
                <button
                  type="button"
                  className="personaliseBasketButton"
                  onClick={() =>
                    router.push(
                      `/m/${savedCode}`
                    )
                  }
                >
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
