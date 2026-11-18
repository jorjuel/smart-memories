'use client';

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  redirect,
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
import { hasMeaningfulMemoryContent } from '@/lib/memoryContent';
import { useGiftPrice } from '@/lib/useCataloguePhoto';
import { useGiftTags } from '@/lib/useGiftTags';

type SharedTagField = 'message' | 'photoPath' | 'audioPath' | 'videoPath';
type SharedTagContent = Partial<Record<SharedTagField, string>> & { all?: boolean };

function CreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productSlug =
    searchParams.get('product');
  const mode = searchParams.get('mode');
  const memoryOnly = mode === 'tag';
  const [selectedDesign, ...selectedNext] = searchParams.getAll('selection');
  const nextDesigns = [...selectedNext, ...searchParams.getAll('nextDesign')];
  const sharedCode = memoryOnly ? searchParams.get('sharedContent') : null;
  const [shared, setShared] = useState<SharedTagContent>({});
  const [shareFields, setShareFields] = useState<Partial<Record<SharedTagField, boolean>>>({});
  const [shareAll, setShareAll] = useState(false);
  const [sharedLoaded, setSharedLoaded] = useState(!sharedCode);
  useEffect(() => {
    if (!sharedCode) return;
    try {
      setShared(JSON.parse(sessionStorage.getItem(`sm-shared-tag:${sharedCode}`) || '{}'));
    } catch {
      setShared({});
    }
    setSharedLoaded(true);
  }, [sharedCode]);
  const designId = searchParams.get('design') ?? selectedDesign;
  const customTag = memoryOnly && designId === 'custom';
  const { tags, failed: tagsFailed } = useGiftTags(memoryOnly && !customTag);
  const tagDesign = customTag
    ? { id: 'custom', name: 'Your own tag design' }
    : tags?.find(design => design.id === designId);
  const memoryWithGift = mode === 'gift';

  const product = productSlug
    ? products.find(
        (item) =>
          item.slug === productSlug
      )
    : undefined;

  const giftPrice = useGiftPrice(product?.slug, product?.price ?? 0);

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
  const [tagArtwork, setTagArtwork] = useState<File>();
  const [tagArtworkPreview, setTagArtworkPreview] = useState('');
  useEffect(() => {
    if (!customTag || !tagArtwork) {
      setTagArtworkPreview('');
      return;
    }
    const url = URL.createObjectURL(tagArtwork);
    setTagArtworkPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [customTag, tagArtwork]);
  const [useTagPhoto, setUseTagPhoto] = useState(false);

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
    if (!sharedLoaded) return;
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

    if (memoryOnly && !sender.trim()) {
      alert('Please enter the sender name.');
      return;
    }

    if (memoryOnly && tagMediaMode === 'video' && !video && !shared.videoPath) {
      alert('Please choose a video with sound, or switch back to the photo option.');
      return;
    }

    const usingVideo = memoryOnly && (Boolean(shared.videoPath) || tagMediaMode === 'video');
    const memoryMessage = shared.message ?? message;
    if (customTag && (!tagArtwork || !['image/jpeg', 'image/png', 'image/webp'].includes(tagArtwork.type) ||
        tagArtwork.size < 1 || tagArtwork.size > 10 * 1024 * 1024)) {
      alert('Choose a JPEG, PNG or WebP image up to 10 MB to print on your tag.');
      return;
    }
    const reuseArtwork = customTag && useTagPhoto && !usingVideo && !shared.photoPath;
    if (!hasMeaningfulMemoryContent({
      message: memoryMessage,
      photo: !usingVideo && Boolean(shared.photoPath || (reuseArtwork ? tagArtwork : photo)),
      audio: !usingVideo && Boolean(shared.audioPath || audio),
      video: usingVideo && Boolean(shared.videoPath || video),
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
        memoryMessage
      );

      formData.set(
        'sender',
        sender.trim()
      );

      if (customTag && tagArtwork) {
        const artworkPath = await uploadMemoryMedia(tagArtwork, 'photo');
        sessionStorage.setItem(`sm-tag-artwork:${code}`, artworkPath);
        if (reuseArtwork) formData.set('photoPath', artworkPath);
      }
      if (shared.photoPath) formData.set('photoPath', shared.photoPath);
      if (shared.audioPath) formData.set('audioPath', shared.audioPath);
      if (shared.videoPath) formData.set('videoPath', shared.videoPath);
      if (photo && !reuseArtwork && !usingVideo && !shared.photoPath) {
        const photoPath = await uploadMemoryMedia(photo, 'photo');
        formData.set('photoPath', photoPath);
      }

      if (audio && !usingVideo && !shared.audioPath) {
        const audioPath = await uploadMemoryMedia(audio, 'audio');
        formData.set('audioPath', audioPath);
      }

      if (usingVideo && video && !shared.videoPath) {
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
      if (memoryOnly && tagDesign) {
        // The memory is persisted before the customer chooses their bow.
        // Only the non-sensitive code is carried through the address bar.
        const query = new URLSearchParams({ code, design: tagDesign.id });
        nextDesigns.forEach(id => query.append('nextDesign', id));
        if (sharedCode) query.set('sharedContent', sharedCode);
        else if (nextDesigns.length) {
          const content: SharedTagContent = shareAll ? { all: true } : {};
          for (const field of ['message', 'photoPath', 'audioPath', 'videoPath'] as const) {
            const value = formData.get(field);
            if ((shareAll || shareFields[field]) && typeof value === 'string' && value.trim()) content[field] = value;
          }
          if (Object.keys(content).length) {
            sessionStorage.setItem(`sm-shared-tag:${code}`, JSON.stringify(content));
            query.set('sharedContent', code);
          }
        }
        router.push(`/create/bow?${query}`);
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
  if (memoryOnly && !customTag && tagsFailed) return <p role="alert">Could not load the Gift Tag. Please reload and try again.</p>;
  if (memoryOnly && !customTag && !tags) return <p role="status">Loading your Gift Tag…</p>;
  if (memoryOnly && !tagDesign) redirect('/tags');

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
                {giftPrice.toFixed(
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
                <strong>{memoryOnly ? tagDesign?.name : 'Memory + Gift'}</strong>
                <Link href={memoryOnly ? '/tags' : '/create'}>{memoryOnly ? 'Change tag design' : 'Change your choice'}</Link>
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
            {memoryOnly ? 'For' : 'Recipient name'}

            <input
              required
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
            From

            <input
              required={memoryOnly}
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

          {(shared.all || shared.message || shared.photoPath || shared.audioPath || shared.videoPath) && (
            <p role="status">{shared.all
              ? 'Using the same message and media. Enter a From and For name for this tag.'
              : 'Your shared content is included. Add any remaining details for this tag below.'}</p>
          )}
          {memoryOnly && !shared.all && !shared.photoPath && !shared.audioPath && !shared.videoPath && (
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

          {customTag && (<>
            <label>
              Image to print on your tag
              <input type="file" accept="image/jpeg,image/png,image/webp" disabled={saving}
                onChange={(event) => setTagArtwork(event.target.files?.[0])} />
              <small>This image goes on the physical tag. Choose separately what the recipient sees after tapping or scanning.</small>
            </label>
            {tagArtworkPreview && (
              <figure className="smCustomTagPreview">
                <div className="smCustomTagMockup">
                  <img src={tagArtworkPreview} alt="Your uploaded artwork on the front of the gift tag" />
                </div>
                <figcaption>Printed tag preview</figcaption>
              </figure>
            )}
          </>)}
          {!shared.all && !shared.videoPath && (!memoryOnly || tagMediaMode === 'photo') && (
            <>
          {customTag && !shared.photoPath && (
            <label className="smCustomTagPhotoOption">
              <input type="checkbox" checked={useTagPhoto} disabled={saving}
                onChange={(event) => setUseTagPhoto(event.target.checked)} />
              <span>Use the same image in my Smart Memory</span>
            </label>
          )}
          {!shared.photoPath && (!customTag || !useTagPhoto) && <>
          <label>
            {customTag ? 'Add a different photo to your Smart Memory (optional)' : 'Photograph'}

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
          </>}

          {!shared.audioPath && <div>
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
          </div>}

            </>
          )}

          {memoryOnly && !shared.all && !shared.videoPath && tagMediaMode === 'video' && (
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

          {!shared.all && shared.message === undefined && <label className="smOptionalMemoryMessage">
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
          </label>}

          {memoryOnly && nextDesigns.length > 0 && !sharedCode && (
            <fieldset>
              <legend>Reuse content on the remaining tags</legend>
              <label className="smCustomTagPhotoOption">
                <input type="checkbox" checked={shareAll} disabled={saving}
                  onChange={event => setShareAll(event.target.checked)} />
                Use the same message and media for all tags
              </label>
              {!shareAll && ([
                ['message', 'Use the same written message', Boolean(message.trim())],
                ['photoPath', 'Use the same memory photo', tagMediaMode === 'photo' && Boolean(photo || (customTag && useTagPhoto && tagArtwork))],
                ['audioPath', 'Use the same voice recording', tagMediaMode === 'photo' && Boolean(audio)],
                ['videoPath', 'Use the same video', tagMediaMode === 'video' && Boolean(video)],
              ] as const).filter(([, , available]) => available).map(([field, label]) => (
                <label key={field} className="smCustomTagPhotoOption">
                  <input type="checkbox" checked={Boolean(shareFields[field])} disabled={saving}
                    onChange={event => setShareFields(current => ({ ...current, [field]: event.target.checked }))} />
                  {label}
                </label>
              ))}
              <p>Leave these unchecked to personalise each tag separately. From and For are entered for every tag.</p>
            </fieldset>
          )}

          {!saved && (
            <button
              disabled={
                saving || !sharedLoaded
              }
              type="button"
              className="btn big"
              onClick={
                saveMemory
              }
            >
              {saving
                ? 'Saving securely...'
                : memoryOnly ? 'Save Memory and Choose Bow' : 'Save My Memory'}
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
