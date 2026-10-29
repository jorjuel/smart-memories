'use client';

import {
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import {
  getPersonalisationProduct,
  TextLayout,
} from '../lib/personalisationConfig';

import {
  products as shopProducts,
} from '../lib/products';

import {
  makeCode,
} from '../lib/storage';

import ConfiguredProductPreview from './ConfiguredProductPreview';

type Props = {
  slug: string;
};

export default function ProductPersonaliser({
  slug,
}: Props) {
  const product =
    getPersonalisationProduct(slug);

  const shopProduct =
    shopProducts.find(
      (item) =>
        item.slug === slug
    );

  /*
   * BASIC PRODUCT OPTIONS
   */

  const [mode, setMode] =
    useState<
      'quick' | 'custom'
    >('quick');

  const [
    designSource,
    setDesignSource,
  ] = useState<
    'ours' | 'own'
  >('ours');

  const [
    occasion,
    setOccasion,
  ] = useState('');

  const [
    size,
    setSize,
  ] = useState(
    product?.sizes?.[0] || ''
  );

  const [
    orientation,
    setOrientation,
  ] = useState(
    product?.orientations?.[0] ||
      'portrait'
  );

  const [
    template,
    setTemplate,
  ] = useState(
    product?.templates?.[0] || ''
  );

  const [
    textLayout,
    setTextLayout,
  ] = useState<TextLayout>(
    product?.textLayouts?.[0] ||
      'photo-only'
  );

  const [
    topText,
    setTopText,
  ] = useState('');

  const [
    bottomText,
    setBottomText,
  ] = useState('');

  const [
    paragraph,
    setParagraph,
  ] = useState('');

  const [
    accessory,
    setAccessory,
  ] = useState(
    product?.accessories?.[0] ||
      ''
  );

  const [
    recipient,
    setRecipient,
  ] = useState('');

  const [
    sender,
    setSender,
  ] = useState('');

  /*
   * PHOTO / ARTWORK
   */

  const [
    photo,
    setPhoto,
  ] = useState<File | null>(
    null
  );

  const [
    photoUrl,
    setPhotoUrl,
  ] = useState('');

  /*
   * AUDIO
   */

  const [
    audio,
    setAudio,
  ] = useState<Blob | null>(
    null
  );

  const [
    audioUrl,
    setAudioUrl,
  ] = useState('');

  const [
    recording,
    setRecording,
  ] = useState(false);

  const [
    recordingSeconds,
    setRecordingSeconds,
  ] = useState(0);

  const mediaRecorder =
    useRef<
      MediaRecorder | null
    >(null);

  const audioChunks =
    useRef<Blob[]>([]);

  const recordingTimer =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  /*
   * SAVING
   */

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    savedCode,
    setSavedCode,
  ] = useState<
    string | null
  >(null);

  const [
    savedPhotoUrl,
    setSavedPhotoUrl,
  ] = useState<
    string | null
  >(null);

  const [
    savedAudioUrl,
    setSavedAudioUrl,
  ] = useState<
    string | null
  >(null);

  const [
    finalReview,
    setFinalReview,
  ] = useState(false);

  /*
   * HELPERS
   */

  function markChanged() {
    setFinalReview(false);
  }

  /*
   * PHOTO / DESIGN UPLOAD
   */

  function choosePhoto(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (photoUrl) {
      URL.revokeObjectURL(
        photoUrl
      );
    }

    setPhoto(file);

    setPhotoUrl(
      URL.createObjectURL(file)
    );

    markChanged();
  }

  /*
   * START RECORDING
   */

  async function startRecording() {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia(
          {
            audio: true,
          }
        );

      audioChunks.current = [];

      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];

      const mimeType =
        supportedTypes.find(
          (type) =>
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

      mediaRecorder.current =
        recorder;

      recorder.ondataavailable = (
        event
      ) => {
        if (
          event.data.size > 0
        ) {
          audioChunks.current.push(
            event.data
          );
        }
      };

      recorder.onstop = () => {
        const type =
          recorder.mimeType ||
          audioChunks.current[0]
            ?.type ||
          'audio/webm';

        const blob =
          new Blob(
            audioChunks.current,
            {
              type,
            }
          );

        if (audioUrl) {
          URL.revokeObjectURL(
            audioUrl
          );
        }

        setAudio(blob);

        setAudioUrl(
          URL.createObjectURL(
            blob
          )
        );

        stream
          .getTracks()
          .forEach(
            (track) =>
              track.stop()
          );

        markChanged();
      };

      recorder.start(250);

      setRecordingSeconds(0);

      setRecording(true);

      recordingTimer.current =
        setInterval(() => {
          setRecordingSeconds(
            (seconds) =>
              seconds + 1
          );
        }, 1000);
    } catch {
      alert(
        'Microphone access failed. Please allow microphone permission or upload an audio message instead.'
      );
    }
  }

  /*
   * STOP RECORDING
   */

  function stopRecording() {
    if (
      mediaRecorder.current &&
      mediaRecorder.current
        .state !== 'inactive'
    ) {
      mediaRecorder.current.stop();
    }

    if (
      recordingTimer.current
    ) {
      clearInterval(
        recordingTimer.current
      );

      recordingTimer.current =
        null;
    }

    setRecording(false);
  }

  /*
   * DELETE RECORDING
   */

  function deleteRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );
    }

    setAudio(null);
    setAudioUrl('');
    setRecordingSeconds(0);

    markChanged();
  }

  /*
   * UPLOAD AUDIO
   */

  function chooseAudio(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );
    }

    setAudio(file);

    setAudioUrl(
      URL.createObjectURL(file)
    );

    setRecordingSeconds(0);

    markChanged();
  }

  /*
   * SAVE SMART MEMORY
   */

  async function saveSmartMemory() {
    if (!recipient.trim()) {
      alert(
        'Please enter who this gift is for.'
      );

      return;
    }

    if (!photo) {
      alert(
        product?.slug ===
          'photo-mug' ||
        product?.slug ===
          'coaster-set'
          ? 'Please upload your photograph or design.'
          : 'Please add a photograph before continuing.'
      );

      return;
    }

    if (recording) {
      alert(
        'Please stop the voice recording first.'
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

      const memoryMessage =
        paragraph.trim() ||
        bottomText.trim() ||
        topText.trim() ||
        occasion ||
        'Smart Memory';

      formData.set(
        'message',
        memoryMessage
      );

      formData.set(
        'sender',
        sender.trim()
      );

      formData.set(
        'photo',
        photo
      );

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
                audio.type ||
                'audio/webm',
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
            'Could not save Smart Memory'
        );
      }

      setSavedCode(
        result.code ||
          result.memory?.code ||
          code
      );

      setSavedPhotoUrl(
        result.photoUrl ||
          result.memory
            ?.photoUrl ||
          result.memory
            ?.photo_url ||
          null
      );

      setSavedAudioUrl(
        result.audioUrl ||
          result.memory
            ?.audioUrl ||
          result.memory
            ?.audio_url ||
          null
      );

      setFinalReview(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Could not save Smart Memory'
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ADD TO BASKET
   */

  function addToBasket() {
    if (
      !product ||
      !savedCode ||
      !finalReview
    ) {
      return;
    }

    const price =
      shopProduct?.price ??
      0;

    const basketItem = {
      id:
        crypto.randomUUID(),

      productType:
        'product',

      productSlug:
        product.slug,

      memoryCode:
        savedCode,

      name:
        product.name,

      category:
        occasion ||
        shopProduct?.category ||
        'Personalised Gift',

      recipient:
        recipient.trim(),

      imageUrl:
        savedPhotoUrl ||
        photoUrl ||
        null,

      audioUrl:
        savedAudioUrl,

      price,

      quantity: 1,

      personalisation: {
        mode,

        designSource,

        occasion,

        size,

        orientation,

        template:
          designSource ===
            'ours' &&
          mode === 'quick'
            ? template
            : null,

        textLayout,

        topText,

        bottomText,

        paragraph,

        accessory,

        sender,

        coasterQuantity:
          product.slug ===
          'coaster-set'
            ? size
            : null,
      },
    };

    try {
      const existing =
        localStorage.getItem(
          'smart-memories-cart'
        );

      const parsed =
        existing
          ? JSON.parse(
              existing
            )
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

      window.location.href =
        '/cart';
    } catch {
      alert(
        'Your Smart Memory was saved, but the product could not be added to the basket.'
      );
    }
  }

  /*
   * PRODUCT CHECK
   */

  if (!product) {
    return (
      <section className="wrap">
        <h1>
          Product not found
        </h1>

        <Link href="/shop">
          Return to shop
        </Link>
      </section>
    );
  }

  const isMug =
    product.slug ===
    'photo-mug';

  const isCoaster =
    product.slug ===
    'coaster-set';

  const allowsOwnDesign =
    isMug || isCoaster;

  return (
    <section className="personaliserPage">
      <div className="personaliserHeader">
        <span className="eyebrow">
          CREATE YOUR OWN
        </span>

        <h1>
          {product.name}
        </h1>

        <p>
          Personalise it, preview
          the finished product and
          confirm it before adding
          it to your basket.
        </p>
      </div>

      <div className="personaliserLayout">

        {/* LEFT SIDE */}

        <div className="personaliserControls">

          {/* CREATE STYLE */}

          <div className="personaliserSection">
            <span className="personaliserStep">
              1
            </span>

            <h2>
              How would you like to
              create it?
            </h2>

            <div className="choiceGrid two">
              <button
                type="button"
                className={
                  mode === 'quick'
                    ? 'choiceCard active'
                    : 'choiceCard'
                }
                onClick={() => {
                  setMode(
                    'quick'
                  );

                  markChanged();
                }}
              >
                <strong>
                  Quick Template
                </strong>

                <small>
                  Choose a ready-made
                  style and personalise
                  it.
                </small>
              </button>

              <button
                type="button"
                className={
                  mode === 'custom'
                    ? 'choiceCard active'
                    : 'choiceCard'
                }
                onClick={() => {
                  setMode(
                    'custom'
                  );

                  markChanged();
                }}
              >
                <strong>
                  Customize It
                </strong>

                <small>
                  Choose the layout and
                  wording yourself.
                </small>
              </button>
            </div>
          </div>

          {/* OCCASION */}

          <div className="personaliserSection">
            <span className="personaliserStep">
              2
            </span>

            <h2>
              What is it for?
            </h2>

            <div className="occasionGrid">
              {product.occasions
                .slice(0, 12)
                .map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={
                      occasion ===
                      item
                        ? 'optionPill active'
                        : 'optionPill'
                    }
                    onClick={() => {
                      setOccasion(
                        item
                      );

                      markChanged();
                    }}
                  >
                    {item}
                  </button>
                ))}
            </div>

            <select
              value={occasion}
              onChange={(event) => {
                setOccasion(
                  event.target.value
                );

                markChanged();
              }}
            >
              <option value="">
                More occasions...
              </option>

              {product.occasions.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {/* OUR DESIGN / OWN DESIGN */}

          {allowsOwnDesign && (
            <div className="personaliserSection">
              <h2>
                How would you like
                to design it?
              </h2>

              <div className="choiceGrid two">
                <button
                  type="button"
                  className={
                    designSource ===
                    'ours'
                      ? 'choiceCard active'
                      : 'choiceCard'
                  }
                  onClick={() => {
                    setDesignSource(
                      'ours'
                    );

                    markChanged();
                  }}
                >
                  <strong>
                    Use Our Designs
                  </strong>

                  <small>
                    Choose a Smart
                    Memories design and
                    personalise it.
                  </small>
                </button>

                <button
                  type="button"
                  className={
                    designSource ===
                    'own'
                      ? 'choiceCard active'
                      : 'choiceCard'
                  }
                  onClick={() => {
                    setDesignSource(
                      'own'
                    );

                    markChanged();
                  }}
                >
                  <strong>
                    Upload My Own Design
                  </strong>

                  <small>
                    Use your own artwork
                    or finished image.
                  </small>
                </button>
              </div>
            </div>
          )}

          {/* TEMPLATES */}

          {mode === 'quick' &&
            (!allowsOwnDesign ||
              designSource ===
                'ours') && (
              <div className="personaliserSection">
                <h2>
                  Choose a design
                </h2>

                <div className="templateGrid">
                  {product.templates.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          template ===
                          item
                            ? 'templateCard active'
                            : 'templateCard'
                        }
                        onClick={() => {
                          setTemplate(
                            item
                          );

                          markChanged();
                        }}
                      >
                        <div className="templateMiniPreview">
                          ♥
                        </div>

                        <strong>
                          {item}
                        </strong>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* SIZE / COASTER SET */}

          {product.sizes &&
            product.sizes.length >
              0 && (
              <div className="personaliserSection">
                <h2>
                  {isCoaster
                    ? 'How many coasters would you like?'
                    : 'Choose the size'}
                </h2>

                <div className="choiceRow">
                  {product.sizes.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          size === item
                            ? 'optionPill active'
                            : 'optionPill'
                        }
                        onClick={() => {
                          setSize(
                            item
                          );

                          markChanged();
                        }}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* ORIENTATION */}

          {product.orientations &&
            product.orientations
              .length > 1 && (
              <div className="personaliserSection">
                <h2>
                  Which direction?
                </h2>

                <div className="choiceGrid two">
                  {product.orientations.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          orientation ===
                          item
                            ? 'orientationCard active'
                            : 'orientationCard'
                        }
                        onClick={() => {
                          setOrientation(
                            item
                          );

                          markChanged();
                        }}
                      >
                        <span
                          className={
                            item ===
                            'landscape'
                              ? 'orientationShape landscape'
                              : 'orientationShape portrait'
                          }
                        />

                        <strong>
                          {item ===
                          'landscape'
                            ? 'Across'
                            : item ===
                              'portrait'
                            ? 'Upright'
                            : 'Square'}
                        </strong>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* WORD LOCATION */}

          {product.textLayouts &&
            product.textLayouts
              .length > 0 &&
            designSource !==
              'own' && (
              <div className="personaliserSection">
                <h2>
                  Where would you like
                  the words?
                </h2>

                <div className="choiceGrid">
                  {product.textLayouts.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          textLayout ===
                          item
                            ? 'choiceCard active'
                            : 'choiceCard'
                        }
                        onClick={() => {
                          setTextLayout(
                            item
                          );

                          markChanged();
                        }}
                      >
                        <strong>
                          {item ===
                          'photo-only'
                            ? 'Photo only'
                            : item ===
                              'top'
                            ? 'Words at top'
                            : item ===
                              'bottom'
                            ? 'Words at bottom'
                            : item ===
                              'top-bottom'
                            ? 'Top + bottom'
                            : 'One paragraph'}
                        </strong>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

          {/* WORDING */}

          {designSource !==
            'own' &&
            textLayout !==
              'photo-only' && (
              <div className="personaliserSection">
                <h2>
                  Add your words
                </h2>

                {(textLayout ===
                  'top' ||
                  textLayout ===
                    'top-bottom') && (
                  <label>
                    Top phrase

                    <input
                      value={
                        topText
                      }
                      onChange={(
                        event
                      ) => {
                        setTopText(
                          event.target
                            .value
                        );

                        markChanged();
                      }}
                      placeholder="e.g. Happy Birthday"
                    />
                  </label>
                )}

                {(textLayout ===
                  'bottom' ||
                  textLayout ===
                    'top-bottom') && (
                  <label>
                    Bottom phrase

                    <input
                      value={
                        bottomText
                      }
                      onChange={(
                        event
                      ) => {
                        setBottomText(
                          event.target
                            .value
                        );

                        markChanged();
                      }}
                      placeholder="e.g. Love from all of us"
                    />
                  </label>
                )}

                {textLayout ===
                  'paragraph' && (
                  <label>
                    Message

                    <textarea
                      value={
                        paragraph
                      }
                      onChange={(
                        event
                      ) => {
                        setParagraph(
                          event.target
                            .value
                        );

                        markChanged();
                      }}
                      placeholder="Write your personal message..."
                    />
                  </label>
                )}
              </div>
            )}

          {/* RECIPIENT */}

          <div className="personaliserSection">
            <h2>
              Who is it for?
            </h2>

            <label>
              Recipient

              <input
                value={
                  recipient
                }
                onChange={(event) => {
                  setRecipient(
                    event.target.value
                  );

                  markChanged();
                }}
                placeholder="e.g. Sarah"
              />
            </label>

            <label>
              From

              <input
                value={sender}
                onChange={(event) => {
                  setSender(
                    event.target.value
                  );

                  markChanged();
                }}
                placeholder="e.g. Leo"
              />
            </label>
          </div>

          {/* PHOTO / OWN ARTWORK */}

          <div className="personaliserSection">
            <h2>
              {allowsOwnDesign &&
              designSource ===
                'own'
                ? 'Upload your design'
                : 'Add your photograph'}
            </h2>

            <input
              type="file"
              accept="image/*"
              onChange={
                choosePhoto
              }
            />

            {isCoaster && (
              <p
                style={{
                  color:
                    'var(--sm-muted)',
                  fontSize:
                    '12px',
                  lineHeight:
                    1.6,
                }}
              >
                For now, the same
                photograph or design
                will be printed across
                every coaster in the
                set.
              </p>
            )}

            {allowsOwnDesign &&
              designSource ===
                'own' && (
                <p
                  style={{
                    color:
                      'var(--sm-muted)',
                    fontSize:
                      '12px',
                    lineHeight:
                      1.6,
                  }}
                >
                  Upload your finished
                  artwork or image and
                  check the preview
                  carefully before
                  confirming.
                </p>
              )}
          </div>

          {/* VOICE MEMORY */}

          <div className="personaliserSection">
            <h2>
              Add a voice memory
            </h2>

            <p
              style={{
                color:
                  'var(--sm-muted)',
                fontSize: '13px',
                lineHeight: 1.6,
              }}
            >
              Record a personal
              message that the
              recipient can hear when
              they tap their Smart
              Memory.
            </p>

            {!audioUrl && (
              <button
                type="button"
                className="btn"
                onClick={
                  recording
                    ? stopRecording
                    : startRecording
                }
              >
                {recording
                  ? `■ Stop recording (${recordingSeconds}s)`
                  : '● Record my voice'}
              </button>
            )}

            {audioUrl && (
              <div
                style={{
                  marginTop:
                    '16px',
                }}
              >
                <p className="success">
                  ✓ Voice message ready
                </p>

                <audio
                  controls
                  preload="metadata"
                  src={audioUrl}
                  style={{
                    width: '100%',
                  }}
                />

                <div
                  className="choiceRow"
                  style={{
                    marginTop:
                      '12px',
                  }}
                >
                  <button
                    type="button"
                    className="optionPill"
                    onClick={
                      deleteRecording
                    }
                  >
                    Delete & record
                    again
                  </button>
                </div>
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

          {/* ACCESSORIES */}

          {product.accessories &&
            product.accessories
              .length > 0 && (
              <div className="personaliserSection">
                <h2>
                  Would you like a
                  stand?
                </h2>

                <div className="choiceRow">
                  {product.accessories.map(
                    (item) => (
                      <button
                        type="button"
                        key={item}
                        className={
                          accessory ===
                          item
                            ? 'optionPill active'
                            : 'optionPill'
                        }
                        onClick={() => {
                          setAccessory(
                            item
                          );

                          markChanged();
                        }}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* RIGHT SIDE - LIVE PREVIEW */}

        <aside className="personaliserPreviewColumn">
          <div className="previewSticky">
            <span className="eyebrow">
              YOUR PREVIEW
            </span>

            <ConfiguredProductPreview
              slug={product.slug}
              photoUrl={photoUrl}
              orientation={
                orientation
              }
              topText={
                designSource ===
                'own'
                  ? ''
                  : topText
              }
              bottomText={
                designSource ===
                'own'
                  ? ''
                  : bottomText
              }
              paragraph={
                designSource ===
                'own'
                  ? ''
                  : paragraph
              }
              textLayout={
                designSource ===
                'own'
                  ? 'photo-only'
                  : textLayout
              }
            />

            <div className="previewDetails">
              {occasion && (
                <p>
                  <strong>
                    Occasion:
                  </strong>{' '}
                  {occasion}
                </p>
              )}

              {size && (
                <p>
                  <strong>
                    {isCoaster
                      ? 'Quantity:'
                      : 'Size:'}
                  </strong>{' '}
                  {size}
                </p>
              )}

              {product.orientations &&
                product.orientations
                  .length > 0 && (
                  <p>
                    <strong>
                      Direction:
                    </strong>{' '}
                    {orientation ===
                    'landscape'
                      ? 'Across'
                      : orientation ===
                        'portrait'
                      ? 'Upright'
                      : 'Square'}
                  </p>
                )}

              {allowsOwnDesign && (
                <p>
                  <strong>
                    Design:
                  </strong>{' '}
                  {designSource ===
                  'own'
                    ? 'Customer design'
                    : 'Smart Memories design'}
                </p>
              )}

              {mode ===
                'quick' &&
                designSource ===
                  'ours' &&
                template && (
                  <p>
                    <strong>
                      Template:
                    </strong>{' '}
                    {template}
                  </p>
                )}

              {recipient && (
                <p>
                  <strong>
                    For:
                  </strong>{' '}
                  {recipient}
                </p>
              )}

              {accessory && (
                <p>
                  <strong>
                    Stand:
                  </strong>{' '}
                  {accessory}
                </p>
              )}

              <p>
                <strong>
                  Voice memory:
                </strong>{' '}
                {audio
                  ? 'Ready ✓'
                  : 'Not added'}
              </p>

              {shopProduct && (
                <p>
                  <strong>
                    Price:
                  </strong>{' '}
                  £
                  {shopProduct.price.toFixed(
                    2
                  )}
                </p>
              )}
            </div>

            {/* CONFIRM */}

            {!finalReview ? (
              <div className="previewConfirmation">
                <strong>
                  Happy with your
                  finished product?
                </strong>

                <p>
                  Check the photograph,
                  design, wording and
                  Smart Memory before
                  confirming.
                </p>

                <button
                  type="button"
                  className="btn big"
                  disabled={saving}
                  onClick={
                    saveSmartMemory
                  }
                >
                  {saving
                    ? 'Saving Smart Memory...'
                    : 'Confirm & Save Smart Memory →'}
                </button>
              </div>
            ) : (
              <div className="previewConfirmation">
                <strong>
                  ✓ Your product is ready
                </strong>

                <p>
                  This is the confirmed
                  version that will be
                  added to your basket.
                </p>

                {savedCode && (
                  <small>
                    Memory reference:{' '}
                    {savedCode}
                  </small>
                )}

                <div
                  style={{
                    display:
                      'grid',
                    gap: '10px',
                    marginTop:
                      '18px',
                  }}
                >
                  <button
                    type="button"
                    className="btn big"
                    onClick={
                      addToBasket
                    }
                  >
                    Confirm & Add to
                    Basket →
                  </button>

                  <button
                    type="button"
                    className="optionPill"
                    onClick={() =>
                      setFinalReview(
                        false
                      )
                    }
                  >
                    Edit Design
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}