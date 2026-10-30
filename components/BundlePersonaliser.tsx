'use client';

import {
  useRef,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  getBundle,
  money,
} from '../lib/bundles';

import ConfiguredProductPreview from './ConfiguredProductPreview';

export default function BundlePersonaliser({
  slug,
}: {
  slug: string;
}) {
  const router =
    useRouter();

  const bundle =
    getBundle(slug)!;

  const [
    occasion,
    setOccasion,
  ] =
    useState(
      bundle.occasion || ''
    );

  const [
    recipient,
    setRecipient,
  ] =
    useState('');

  const [
    sender,
    setSender,
  ] =
    useState('');

  const [
    topText,
    setTopText,
  ] =
    useState('');

  const [
    bottomText,
    setBottomText,
  ] =
    useState('');

  const [
    photo,
    setPhoto,
  ] =
    useState<File | null>(
      null
    );

  const [
    photoUrl,
    setPhotoUrl,
  ] =
    useState('');

  const [
    audioBlob,
    setAudioBlob,
  ] =
    useState<Blob | null>(
      null
    );

  const [
    audioUrl,
    setAudioUrl,
  ] =
    useState('');

  const [
    isRecording,
    setIsRecording,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    savedCode,
    setSavedCode,
  ] =
    useState('');

  const [
    savedPhotoUrl,
    setSavedPhotoUrl,
  ] =
    useState('');

  const [
    savedAudioUrl,
    setSavedAudioUrl,
  ] =
    useState('');

  const [
    finalReview,
    setFinalReview,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const recorderRef =
    useRef<MediaRecorder | null>(
      null
    );

  const chunksRef =
    useRef<Blob[]>([]);

  function handlePhoto(
    file: File | null
  ) {
    if (!file) {
      return;
    }

    if (photoUrl) {
      URL.revokeObjectURL(
        photoUrl
      );
    }

    const preview =
      URL.createObjectURL(
        file
      );

    setPhoto(file);
    setPhotoUrl(preview);
    setFinalReview(false);
  }

  async function startRecording() {
    try {
      setError('');

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio: true,
          });

      chunksRef.current =
        [];

      const recorder =
        new MediaRecorder(
          stream
        );

      recorderRef.current =
        recorder;

      recorder.ondataavailable =
        (event) => {
          if (
            event.data.size >
            0
          ) {
            chunksRef.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        () => {
          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  'audio/webm',
              }
            );

          const url =
            URL.createObjectURL(
              blob
            );

          setAudioBlob(blob);
          setAudioUrl(url);
          setFinalReview(false);

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop()
            );
        };

      recorder.start();

      setIsRecording(true);
    } catch (err) {
      console.error(err);

      setError(
        'Could not access your microphone. Please allow microphone access and try again.'
      );
    }
  }

  function stopRecording() {
    if (
      recorderRef.current &&
      isRecording
    ) {
      recorderRef.current.stop();

      setIsRecording(false);
    }
  }

  function deleteRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );
    }

    setAudioBlob(null);
    setAudioUrl('');
    setSavedAudioUrl('');
    setFinalReview(false);
  }

  function buildMessage() {
    return [
      topText,
      bottomText,
    ]
      .filter(Boolean)
      .join('\n');
  }

  async function saveBundleMemory() {
    try {
      setError('');

      if (!recipient.trim()) {
        setError(
          'Please enter the recipient name.'
        );

        return;
      }

      if (!photo) {
        setError(
          'Please upload a photo for the bundle.'
        );

        return;
      }

      setSaving(true);

      const formData =
        new FormData();

      formData.append(
        'recipient',
        recipient
      );

      formData.append(
        'sender',
        sender
      );

      formData.append(
        'message',
        buildMessage()
      );

      formData.append(
        'photo',
        photo
      );

      if (audioBlob) {
        const audioFile =
          new File(
            [audioBlob],
            `bundle-memory-${Date.now()}.webm`,
            {
              type:
                audioBlob.type ||
                'audio/webm',
            }
          );

        formData.append(
          'audio',
          audioFile
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

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.ok
      ) {
        throw new Error(
          data.error ||
            'Unable to save the Smart Memory.'
        );
      }

      setSavedCode(
        data.code || ''
      );

      setSavedPhotoUrl(
        data.photoUrl ||
          data.memory?.photoUrl ||
          ''
      );

      setSavedAudioUrl(
        data.audioUrl ||
          data.memory?.audioUrl ||
          ''
      );

      setFinalReview(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while saving your bundle.'
      );
    } finally {
      setSaving(false);
    }
  }

  function addBundleToBasket() {
    if (
      !finalReview ||
      !savedCode
    ) {
      setError(
        'Please save and confirm your bundle before adding it to the basket.'
      );

      return;
    }

    const currentCart =
      JSON.parse(
        localStorage.getItem(
          'smart-memories-cart'
        ) || '[]'
      );

    const basketItem = {
      id:
        crypto.randomUUID(),

      productType:
        'bundle',

      productSlug:
        bundle.slug,

      name:
        bundle.name,

      category:
        'Special Bundle',

      price:
        bundle.bundlePrice,

      quantity: 1,

      recipient,

      memoryCode:
        savedCode,

      imageUrl:
        savedPhotoUrl ||
        photoUrl ||
        null,

      audioUrl:
        savedAudioUrl ||
        null,

      bundleProducts:
        bundle.products,

      personalisation: {
        occasion,
        recipient,
        sender,
        topText,
        bottomText,
        sharedDesign: true,
      },
    };

    currentCart.push(
      basketItem
    );

    localStorage.setItem(
      'smart-memories-cart',
      JSON.stringify(
        currentCart
      )
    );

    router.push(
      '/cart'
    );
  }

  return (
    <section className="wrap">
      <div className="personaliserHeader">
        <span className="eyebrow">
          PERSONALISE YOUR BUNDLE
        </span>

        <h1>
          {bundle.name}
        </h1>

        <p className="lead">
          One photo, one message and one Smart Memory applied across the whole bundle.
        </p>

        <div
          className="card"
          style={{
            marginTop: '20px',
            maxWidth: '420px',
          }}
        >
          <p
            style={{
              textDecoration:
                'line-through',
              opacity: 0.6,
              marginBottom: '4px',
            }}
          >
            Normally{' '}
            {money(
              bundle.normalPrice
            )}
          </p>

          <p
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              marginBottom: '4px',
            }}
          >
            {money(
              bundle.bundlePrice
            )}
          </p>

          <p
            style={{
              fontWeight: 700,
            }}
          >
            Save{' '}
            {money(
              bundle.normalPrice -
                bundle.bundlePrice
            )}
          </p>
        </div>
      </div>

      <div className="personaliserLayout">
        <div className="personaliserControls">

          <div className="personaliserSection">
            <h2>
              Occasion
            </h2>

            <input
              type="text"
              value={occasion}
              onChange={(
                event
              ) =>
                setOccasion(
                  event.target.value
                )
              }
            />
          </div>

          <div className="personaliserSection">
            <h2>
              Recipient details
            </h2>

            <label>
              Who is this for?
            </label>

            <input
              type="text"
              value={recipient}
              placeholder="Recipient name"
              onChange={(
                event
              ) =>
                setRecipient(
                  event.target.value
                )
              }
            />

            <label>
              From
            </label>

            <input
              type="text"
              value={sender}
              placeholder="Your name"
              onChange={(
                event
              ) =>
                setSender(
                  event.target.value
                )
              }
            />
          </div>

          <div className="personaliserSection">
            <h2>
              Upload your photo
            </h2>

            <p>
              This image will be used across every item in the bundle.
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={(
                event
              ) =>
                handlePhoto(
                  event.target
                    .files?.[0] ||
                    null
                )
              }
            />

            {photo && (
              <p className="smallText">
                Selected: {photo.name}
              </p>
            )}
          </div>

          <div className="personaliserSection">
            <h2>
              Personalised wording
            </h2>

            <label>
              Top wording
            </label>

            <input
              type="text"
              value={topText}
              placeholder="Happy Birthday"
              onChange={(
                event
              ) =>
                setTopText(
                  event.target.value
                )
              }
            />

            <label>
              Bottom wording
            </label>

            <input
              type="text"
              value={bottomText}
              placeholder="Love from us all"
              onChange={(
                event
              ) =>
                setBottomText(
                  event.target.value
                )
              }
            />
          </div>

          <div className="personaliserSection smartMemorySection">
            <span className="eyebrow">
              SMART MEMORY
            </span>

            <h2>
              Add your voice
            </h2>

            <p>
              One voice recording will be linked to the complete bundle.
            </p>

            {!isRecording &&
              !audioUrl && (
                <button
                  type="button"
                  className="btn"
                  onClick={
                    startRecording
                  }
                >
                  Start Recording
                </button>
              )}

            {isRecording && (
              <button
                type="button"
                className="btn"
                onClick={
                  stopRecording
                }
              >
                Stop Recording
              </button>
            )}

            {audioUrl && (
              <div className="recordingPreview">
                <p>
                  Voice recording ready
                </p>

                <audio
                  controls
                  src={audioUrl}
                />

                <button
                  type="button"
                  className="btn small"
                  onClick={
                    deleteRecording
                  }
                >
                  Delete recording
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="formError">
              {error}
            </div>
          )}

          {!finalReview && (
            <button
              type="button"
              className="btn big"
              disabled={saving}
              onClick={
                saveBundleMemory
              }
            >
              {saving
                ? 'Saving...'
                : 'Confirm & Save Bundle Memory'}
            </button>
          )}

          {finalReview && (
            <div className="finalReviewBox">
              <span className="eyebrow">
                FINAL REVIEW
              </span>

              <h2>
                Your bundle is ready
              </h2>

              <p>
                Smart Memory code:{' '}
                <strong>
                  {savedCode}
                </strong>
              </p>

              <p>
                Check the complete bundle preview before adding it to your basket.
              </p>

              <button
                type="button"
                className="btn big"
                onClick={
                  addBundleToBasket
                }
              >
                Confirm & Add Bundle to Basket
              </button>
            </div>
          )}
        </div>

        <aside className="personaliserPreview">
          <span className="eyebrow">
            LIVE BUNDLE PREVIEW
          </span>

          <h2>
            Your finished collection
          </h2>

          <div className="bundlePreviewGrid">
            {bundle.products.map(
              (product) => (
                <div
                  key={
                    product.slug
                  }
                  className="bundlePreviewCard"
                >
                  <h3>
                    {product.name}
                  </h3>

                  <div className="bundlePreviewFrame">
                    <ConfiguredProductPreview
                      slug={
                        product.slug
                      }
                      photoUrl={
                        savedPhotoUrl ||
                        photoUrl
                      }
                      orientation="portrait"
                      topText={
                        topText
                      }
                      bottomText={
                        bottomText
                      }
                      paragraph=""
                      textLayout="top-bottom"
                    />
                  </div>
                </div>
              )
            )}
          </div>

          <div
            className="card"
            style={{
              marginTop: '24px',
            }}
          >
            <strong>
              Bundle total:{' '}
              {money(
                bundle.bundlePrice
              )}
            </strong>
          </div>
        </aside>
      </div>
    </section>
  );
}