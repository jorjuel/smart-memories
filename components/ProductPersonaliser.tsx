'use client';

import {
  useMemo,
  useRef,
  useState,
  useEffect,
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
import { composePrintArtwork, type PhotoLayout } from '@/lib/printCollage';
import PersonaliserProgress from './PersonaliserProgress';
import SmartMemoryLivePreview from './SmartMemoryLivePreview';
import { uploadMemoryMedia, readMemorySaveResult } from '@/lib/memoryMediaUpload';
import { persistDraft, retrieveDraft, uploadPrivateDraftMedia, completeDraft } from '@/lib/draftClient';
import type { DraftDetails } from '@/lib/memoryDrafts';

type Props = {
  slug: string;
  initialOccasion?: string;
  draftId?: string;
};

type StepKey =
  | 'gift'
  | 'photo'
  | 'voice'
  | 'message'
  | 'preview'
  | 'ready';

type WizardStep = {
  key: StepKey;
  label: string;
};

const MAX_PHOTO_BYTES =
  10 * 1024 * 1024;

const MAX_AUDIO_BYTES =
  25 * 1024 * 1024;

function formatTime(
  seconds: number
) {
  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, '0')}`;
}

export default function ProductPersonaliser({
  slug,
  initialOccasion = '',
  draftId,
}: Props) {
  const product =
    getPersonalisationProduct(
      slug
    );

  const shopProduct =
    shopProducts.find(
      (item) =>
        item.slug === slug
    );

  /* =====================================================
     PRODUCT OPTIONS
     ===================================================== */

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
  ] = useState(
    initialOccasion
  );

  const [size, setSize] =
    useState(
      product?.sizes?.[0] ||
        ''
    );

  const [
    orientation,
    setOrientation,
  ] = useState(
    product
      ?.orientations?.[0] ||
      'portrait'
  );

  const [
    template,
    setTemplate,
  ] = useState(
    product
      ?.templates?.[0] ||
      ''
  );

  const [
    textLayout,
    setTextLayout,
  ] = useState<TextLayout>(
    product
      ?.textLayouts?.[0] ||
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
    product
      ?.accessories?.[0] ||
      ''
  );

  /* =====================================================
     MEMORY DETAILS
     ===================================================== */

  const [
    recipient,
    setRecipient,
  ] = useState('');

  const [
    sender,
    setSender,
  ] = useState('');

  const [
    memoryMessage,
    setMemoryMessage,
  ] = useState('');

  /* =====================================================
     PHOTO
     ===================================================== */

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
  ] = useState('');

  // Original print photographs are kept separately from the recipient's main memory photo.
  const [giftPhotos, setGiftPhotos] = useState<{file:File;url:string}[]>([]);
  const [photoLayout, setPhotoLayout] = useState<PhotoLayout>('grid');
  const [savedPrintPhotoUrls, setSavedPrintPhotoUrls] = useState<string[]>([]);
  const [savedPrintArtworkUrl, setSavedPrintArtworkUrl] = useState<string | null>(null);

  /* =====================================================
     AUDIO
     ===================================================== */

  const [
    audio,
    setAudio,
  ] =
    useState<Blob | null>(
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

  /* =====================================================
     SAVING
     ===================================================== */

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

  const [
    stepError,
    setStepError,
  ] = useState('');

  /* =====================================================
     WIZARD
     ===================================================== */

  const steps =
    useMemo<
      WizardStep[]
    >(() => {
      const result:
        WizardStep[] = [
        {
          key: 'gift',
          label: 'Gift',
        },
        {
          key: 'photo',
          label: 'Photo',
        },
      ];

      if (
        product?.smartMemory
      ) {
        result.push({
          key: 'voice',
          label: 'Voice',
        });
      }

      result.push(
        {
          key: 'message',
          label: 'Message',
        },
        {
          key: 'preview',
          label: 'Preview',
        },
        {
          key: 'ready',
          label: 'Ready',
        }
      );

      return result;
    }, [
      product?.smartMemory,
    ]);

  const [
    stepIndex,
    setStepIndex,
  ] = useState(0);

  const currentStep =
    steps[stepIndex]?.key ||
    'gift';

  const isMug =
    product?.slug ===
    'photo-mug';

  const isCoaster =
    product?.slug ===
    'coaster-set';

  const allowsOwnDesign =
    isMug ||
    isCoaster;

  const coasterCount = isCoaster ? (size === 'Single' ? 1 : Number(size.match(/[0-9]+/)?.[0] || 1)) : 1;
  const maxGiftPhotos = isCoaster ? coasterCount : 6;
  const selectedGiftPhotos = giftPhotos.slice(0, maxGiftPhotos);

  const finalMemoryMessage =
    memoryMessage.trim() ||
    paragraph.trim() ||
    bottomText.trim() ||
    topText.trim() ||
    occasion ||
    'Smart Memory';

  /* =====================================================
     PRIVATE CUSTOMER DRAFT RECOVERY
     Drafts are account-owned and saved in a private bucket.
     Guests may still create gifts without cloud drafts.
     ===================================================== */
  const draftFeatureEnabled = process.env.NEXT_PUBLIC_DRAFTS_ENABLED === 'true';
  const draftRef = useRef(draftId || '');
  const [draftReady, setDraftReady] = useState(false);
  const [draftRevision, setDraftRevision] = useState(0);
  const [draftStatus, setDraftStatus] = useState('');
  const [draftEnabled, setDraftEnabled] = useState(draftFeatureEnabled);
  const draftPhotoBlob = useRef<Blob | null>(null);
  const draftAudioBlob = useRef<Blob | null>(null);
  const draftPhotoPath = useRef<string | null>(null);
  const draftAudioPath = useRef<string | null>(null);
  const draftQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let cancelled = false;
    async function restore() {
      if (!draftFeatureEnabled) return;
      if (!draftId) {
        draftRef.current = crypto.randomUUID();
        if (!cancelled) setDraftReady(true);
        return;
      }
      try {
        const result = await retrieveDraft(draftId);
        if (cancelled) return;
        if (result.draft.product_slug !== slug) {
          throw new Error('This draft belongs to a different gift.');
        }
        const d = result.draft.details || {};
        if (d.mode) setMode(d.mode);
        if (d.designSource) setDesignSource(d.designSource);
        if (d.occasion !== undefined) setOccasion(d.occasion);
        if (d.size !== undefined) setSize(d.size);
        if (d.orientation && ['portrait','landscape','square'].includes(d.orientation)) setOrientation(d.orientation as 'portrait' | 'landscape' | 'square');
        if (d.template !== undefined) setTemplate(d.template);
        if (d.textLayout) setTextLayout(d.textLayout as TextLayout);
        if (d.topText !== undefined) setTopText(d.topText);
        if (d.bottomText !== undefined) setBottomText(d.bottomText);
        if (d.paragraph !== undefined) setParagraph(d.paragraph);
        if (d.accessory !== undefined) setAccessory(d.accessory);
        if (d.recipient !== undefined) setRecipient(d.recipient);
        if (d.sender !== undefined) setSender(d.sender);
        if (d.memoryMessage !== undefined) setMemoryMessage(d.memoryMessage);
        const media = await Promise.all([
          result.photoUrl ? fetch(result.photoUrl).then(r => {
            if (!r.ok) throw new Error('Could not restore your saved photo.');
            return r.blob();
          }) : Promise.resolve(null),
          result.audioUrl ? fetch(result.audioUrl).then(r => {
            if (!r.ok) throw new Error('Could not restore your saved recording.');
            return r.blob();
          }) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        if (media[0]) {
          const savedPhoto = new File([media[0]],'draft-photo',{
            type:media[0].type || 'image/jpeg'
          });
          setPhoto(savedPhoto);
          const restoredUrl = URL.createObjectURL(savedPhoto);
          setPhotoUrl(restoredUrl);
          setGiftPhotos([{file:savedPhoto,url:restoredUrl}]);
          draftPhotoBlob.current = savedPhoto;
        }
        if (media[1]) {
          setAudio(media[1]);
          setAudioUrl(URL.createObjectURL(media[1]));
          draftAudioBlob.current = media[1];
        }
        draftPhotoPath.current=result.draft.photo_path;
        draftAudioPath.current=result.draft.audio_path;
        setStepIndex(Math.min(steps.length - 2, Math.max(0,result.draft.step_index)));
        setDraftStatus('Draft restored successfully.');
        setDraftReady(true);
      } catch (err) {
        if (!cancelled) {
          setDraftEnabled(false);
          setDraftStatus(err instanceof Error ? err.message : 'Could not restore draft.');
        }
      }
    }
    void restore();
    return () => {cancelled=true;};
  // Load a draft once per product / draft ID, not on each form edit.
  }, [draftId,slug,steps.length,draftFeatureEnabled]);

  useEffect(() => {
    if (!draftReady || !draftEnabled || draftRevision === 0 || finalReview) return;
    const snapshot: DraftDetails = {
      mode,designSource,occasion,size,orientation,template,textLayout,
      topText,bottomText,paragraph,accessory,recipient,sender,memoryMessage,
    };
    const currentId = draftRef.current;
    const currentPhoto = photo;
    const currentAudio = audio;
    const currentStep = stepIndex;
    setDraftStatus('Saving draft securely…');
    const timer = setTimeout(() => {
      draftQueue.current = draftQueue.current.catch(()=>{}).then(async () => {
        const base = {id:currentId,slug,stepIndex:currentStep,details:snapshot};
        await persistDraft(base);
        if (currentPhoto !== draftPhotoBlob.current) {
          const path = currentPhoto
            ? await uploadPrivateDraftMedia(currentId,currentPhoto,'photo')
            : null;
          await persistDraft({...base,photoPath:path});
          draftPhotoBlob.current=currentPhoto;
          draftPhotoPath.current=path;
        }
        if (currentAudio !== draftAudioBlob.current) {
          const path = currentAudio
            ? await uploadPrivateDraftMedia(currentId,currentAudio,'audio')
            : null;
          await persistDraft({...base,audioPath:path});
          draftAudioBlob.current=currentAudio;
          draftAudioPath.current=path;
        }
        setDraftStatus('Draft saved securely.');
      }).catch(err=>{
        const message=err instanceof Error ? err.message : 'Could not save draft.';
        setDraftStatus(message);
        if (message.includes('Sign in')) setDraftEnabled(false);
      });
    },1200);
    return ()=>clearTimeout(timer);
  }, [draftReady,draftEnabled,draftRevision,finalReview,slug,stepIndex,mode,designSource,occasion,size,orientation,template,
    textLayout,topText,bottomText,paragraph,accessory,recipient,sender,memoryMessage,photo,audio]);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior:
        'smooth',
    });
  }

  function markChanged() {
    setDraftRevision(n => n + 1);
    setFinalReview(false);
    setStepError('');
  }

  function changeStep(
    index: number
  ) {
    setDraftRevision(n => n + 1);
    setStepIndex(index);
    setStepError('');
    scrollToTop();
  }

  function goBack() {
    if (
      stepIndex <= 0
    ) {
      return;
    }

    changeStep(
      stepIndex - 1
    );
  }

  function validateStep() {
    setStepError('');

    if (
      currentStep ===
        'photo' &&
      !photo
    ) {
      setStepError(
        'Please add your main photo before continuing.'
      );

      return false;
    }

    if (
      currentStep ===
        'message' &&
      !recipient.trim()
    ) {
      setStepError(
        'Please enter who this Smart Memory is for before continuing.'
      );

      return false;
    }

    if (
      recording
    ) {
      setStepError(
        'Please stop the voice recording before continuing.'
      );

      return false;
    }

    return true;
  }

  function goNext() {
    if (
      !validateStep()
    ) {
      return;
    }

    if (
      stepIndex <
      steps.length - 1
    ) {
      changeStep(
        stepIndex + 1
      );
    }
  }

  /* =====================================================
     PHOTO
     ===================================================== */

  function setChosenPhotos(files: File[]) {
    setStepError('');
    if (!files.length) return;
    if (files.length > maxGiftPhotos) {
      setStepError(`Choose no more than ${maxGiftPhotos} photo${maxGiftPhotos === 1 ? '' : 's'} for this gift.`);
      return;
    }
    if (files.some((file) => !file.type.startsWith('image/') || file.size > MAX_PHOTO_BYTES || !file.size)) {
      setStepError('Each photo must be an image of 10 MB or smaller.');
      return;
    }
    const newPhotos = files.map((file) => ({file, url: URL.createObjectURL(file)}));
    giftPhotos.forEach(({url}) => URL.revokeObjectURL(url));
    if (photoUrl && !giftPhotos.some((item) => item.url === photoUrl)) URL.revokeObjectURL(photoUrl);
    setGiftPhotos(newPhotos);
    setPhoto(newPhotos[0].file);
    setPhotoUrl(newPhotos[0].url);
    setSavedPrintPhotoUrls([]);
    setSavedPrintArtworkUrl(null);
    markChanged();
  }

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length) setChosenPhotos(files.slice(0,1));
    event.target.value = '';
  }

  function chooseGiftPhotos(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length) setChosenPhotos(files);
    event.target.value = '';
  }

  function removeGiftPhoto(index: number) {
    const remaining = giftPhotos.filter((_,i) => i !== index);
    const removed = giftPhotos[index];
    if (removed) URL.revokeObjectURL(removed.url);
    setGiftPhotos(remaining);
    setPhoto(remaining[0]?.file ?? null);
    setPhotoUrl(remaining[0]?.url ?? '');
    setSavedPrintPhotoUrls([]);
    setSavedPrintArtworkUrl(null);
    markChanged();
  }

  function removePhoto() {
    giftPhotos.forEach(({url}) => URL.revokeObjectURL(url));
    if (photoUrl && !giftPhotos.some((item) => item.url === photoUrl)) URL.revokeObjectURL(photoUrl);
    setGiftPhotos([]);
    setPhoto(null);
    setPhotoUrl('');
    setSavedPrintPhotoUrls([]);
    setSavedPrintArtworkUrl(null);
    markChanged();
  }

  /* =====================================================
     VOICE RECORDING
     ===================================================== */

  async function startRecording() {
    setStepError('');

    if (
      !navigator
        .mediaDevices
        ?.getUserMedia ||
      typeof MediaRecorder ===
        'undefined'
    ) {
      setStepError(
        'Voice recording is not supported by this browser. You can upload an audio recording instead.'
      );

      return;
    }

    try {
      const stream =
        await navigator
          .mediaDevices
          .getUserMedia({
            audio: true,
          });

      audioChunks.current =
        [];

      const supportedTypes =
        [
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

      recorder.ondataavailable =
        (event) => {
          if (
            event.data
              .size > 0
          ) {
            audioChunks.current.push(
              event.data
            );
          }
        };

      recorder.onstop =
        () => {
          const type =
            recorder.mimeType ||
            audioChunks
              .current[0]
              ?.type ||
            'audio/webm';

          const blob =
            new Blob(
              audioChunks.current,
              {
                type,
              }
            );

          if (
            blob.size >
            MAX_AUDIO_BYTES
          ) {
            setStepError(
              'This recording is too large. The current maximum audio size is 25 MB.'
            );

            stream
              .getTracks()
              .forEach(
                (track) =>
                  track.stop()
              );

            return;
          }

          if (
            audioUrl
          ) {
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

      recorder.start(
        250
      );

      setRecordingSeconds(
        0
      );

      setRecording(true);

      recordingTimer.current =
        setInterval(() => {
          setRecordingSeconds(
            (seconds) =>
              seconds + 1
          );
        }, 1000);
    } catch {
      setStepError(
        'Microphone access is blocked or unavailable. Enable microphone access in your browser, or upload an audio recording instead.'
      );
    }
  }

  function stopRecording() {
    if (
      mediaRecorder.current &&
      mediaRecorder.current
        .state !==
        'inactive'
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

  function deleteRecording() {
    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );
    }

    setAudio(null);
    setAudioUrl('');
    setRecordingSeconds(
      0
    );

    markChanged();
  }

  function chooseAudio(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target
        .files?.[0];

    if (!file) {
      return;
    }

    setStepError('');

    if (
      file.size >
      MAX_AUDIO_BYTES
    ) {
      setStepError(
        'This audio file is too large. The current maximum is 25 MB.'
      );

      event.target.value =
        '';

      return;
    }

    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl
      );
    }

    setAudio(file);

    setAudioUrl(
      URL.createObjectURL(
        file
      )
    );

    setRecordingSeconds(
      0
    );

    markChanged();
  }

  /* =====================================================
     SAVE SMART MEMORY
     Existing API / storage logic preserved
     ===================================================== */

  async function saveSmartMemory() {
    setStepError('');

    if (
      !recipient.trim()
    ) {
      setStepError(
        'Please enter who this gift is for.'
      );

      return;
    }

    if (!photo) {
      setStepError(
        'Please add your main photo before creating your Smart Memory.'
      );

      return;
    }

    if (recording) {
      setStepError(
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

      formData.set(
        'message',
        finalMemoryMessage
      );

      formData.set(
        'sender',
        sender.trim()
      );

      // Upload photo and audio directly to storage, bypassing the
      // serverless function request-body limit.
      const photoPath = await uploadMemoryMedia(photo, 'photo');
      formData.set('photoPath', photoPath);

      // Save original full-resolution files for fulfilment. The first image
      // remains the Smart Memory photo; a collage is additional print artwork.
      const printPhotos = selectedGiftPhotos.length ? selectedGiftPhotos.map(item => item.file) : [photo];
      const printPaths = await Promise.all(printPhotos.map((file, index) =>
        index === 0 ? Promise.resolve(photoPath) : uploadMemoryMedia(file, 'photo')
      ));
      const storageBase = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!storageBase) throw new Error('Photo storage is not configured.');
      const publicPhoto = (path: string) =>
        `${storageBase}/storage/v1/object/public/memory-media/${path.split('/').map(encodeURIComponent).join('/')}`;
      const galleryUrls = printPaths.map(publicPhoto);
      let printArtworkUrl: string | null = null;
      if (!isCoaster && printPhotos.length > 1) {
        const collage = await composePrintArtwork(printPhotos, photoLayout,
          slug === 'mouse-mat' || slug === 'photo-mug' ? 3000 : 2400,
          slug === 'mouse-mat' || slug === 'photo-mug' ? 2000 : 2400);
        printArtworkUrl = publicPhoto(await uploadMemoryMedia(collage, 'photo'));
      }
      setSavedPrintPhotoUrls(galleryUrls);
      setSavedPrintArtworkUrl(printArtworkUrl);

      if (audio) {
        const audioPath = await uploadMemoryMedia(audio, 'audio');
        formData.set('audioPath', audioPath);
      }

      const response =
        await fetch(
          '/api/memories',
          {
            method:
              'POST',
            body:
              formData,
          }
        );

      const result = await readMemorySaveResult(response);

      setSavedCode(
        result.code ||
          result.memory
            ?.code ||
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

      setDraftEnabled(false);
      await draftQueue.current.catch(()=>{});
      if (draftReady && draftRevision > 0) {
        try { await completeDraft(draftRef.current); } catch { /* A saved memory must not fail because draft cleanup failed. */ }
      }
      setFinalReview(
        true
      );

      const readyIndex =
        steps.findIndex(
          (step) =>
            step.key ===
            'ready'
        );

      changeStep(
        readyIndex >= 0
          ? readyIndex
          : steps.length -
              1
      );
    } catch (error) {
      setStepError(
        error instanceof
          Error
          ? error.message
          : 'We could not save your Smart Memory. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     ADD TO BASKET
     Existing cart model preserved
     ===================================================== */

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
        shopProduct
          ?.category ||
        'Personalised Gift',

      occasion:
        occasion ||
        undefined,

      design:
        designSource ===
        'own'
          ? 'Customer design'
          : template ||
            undefined,

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
          mode ===
            'quick'
            ? template
            : null,

        textLayout,

        topText,

        bottomText,

        paragraph,

        memoryMessage:
          finalMemoryMessage,

        accessory,

        sender,

        coasterQuantity:
          product.slug ===
          'coaster-set'
            ? size
            : null,

        // Production assets: original photographs and optional assembled collage.
        printPhotoUrls: savedPrintPhotoUrls,
        printArtworkUrl: savedPrintArtworkUrl,
        photoLayout: isCoaster ? 'individual-coasters' : (selectedGiftPhotos.length > 1 ? photoLayout : 'single'),
        printPhotoCount: savedPrintPhotoUrls.length,
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
        Array.isArray(
          parsed
        )
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
      setStepError(
        'Your Smart Memory was saved, but the product could not be added to the basket.'
      );
    }
  }

  /* =====================================================
     PRODUCT CHECK
     ===================================================== */

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

  const productBackHref =
    initialOccasion
      ? `/shop/${product.slug}?occasion=${encodeURIComponent(
          initialOccasion
        )}`
      : `/shop/${product.slug}`;

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <section className="personaliserPage smWizardPage">
      <div className="smWizardHeader">
        <Link
          href={
            productBackHref
          }
          className="smWizardBackToProduct"
        >
          ← Back to gift
        </Link>

        <span className="v14Eyebrow">
          CREATE YOUR SMART MEMORY
        </span>

        <h1>
          Create Your Smart Memory
        </h1>

        <p className="smWizardIntro">
          Personalise your gift, add a photo and share a memory.
        </p>

        <div className="smWizardProductName">
          <strong>
            {product.name}
          </strong>

          {shopProduct && (
            <span>
              £
              {shopProduct.price.toFixed(
                2
              )}
            </span>
          )}
        </div>
      </div>

      {draftFeatureEnabled && (
        <div className="smWizardDraftNotice" role="status" aria-live="polite">
          <span>{draftStatus || 'Your progress saves automatically when signed in.'}</span>
          <a href="/account/drafts">My Drafts</a>
        </div>
      )}

      <PersonaliserProgress
        steps={steps}
        currentIndex={
          stepIndex
        }
      />

      <div className="smWizardShell">
        <div className="smWizardStepContent" id="smWizardFields" role="region" aria-label={`${steps[stepIndex]?.label || 'Gift'} details`}>

          {/* =========================================
              STEP 1 — YOUR GIFT
              ========================================= */}

          {currentStep ===
            'gift' && (
            <>
              <div className="smWizardStepHeading">
                <span>
                  STEP{' '}
                  {stepIndex +
                    1}
                </span>

                <h2>
                  Your Gift
                </h2>

                <p>
                  Start by making
                  the physical
                  gift yours.
                </p>
              </div>

              <div className="smWizardSection">
                <h3>
                  How would you
                  like to create
                  it?
                </h3>

                <div className="choiceGrid two">
                  <button
                    type="button"
                    className={
                      mode ===
                      'quick'
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
                      Quick
                      Template
                    </strong>

                    <small>
                      Choose a
                      ready-made
                      style and
                      personalise
                      it.
                    </small>
                  </button>

                  <button
                    type="button"
                    className={
                      mode ===
                      'custom'
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
                      Choose the
                      layout and
                      wording
                      yourself.
                    </small>
                  </button>
                </div>
              </div>

              <div className="smWizardSection">
                <h3>
                  What is it for?
                </h3>

                {initialOccasion && (
                  <div className="smWizardOccasionNotice">
                    You arrived
                    through:{' '}
                    <strong>
                      {
                        initialOccasion
                      }
                    </strong>
                  </div>
                )}

                <div className="occasionGrid">
                  {product.occasions
                    .slice(
                      0,
                      12
                    )
                    .map(
                      (
                        item
                      ) => (
                        <button
                          type="button"
                          key={
                            item
                          }
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
                          {
                            item
                          }
                        </button>
                      )
                    )}
                </div>

                <select
                  value={
                    occasion
                  }
                  onChange={(
                    event
                  ) => {
                    setOccasion(
                      event.target
                        .value
                    );
                    markChanged();
                  }}
                >
                  <option value="">
                    More
                    occasions...
                  </option>

                  {product.occasions.map(
                    (
                      item
                    ) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {allowsOwnDesign && (
                <div className="smWizardSection">
                  <h3>
                    How would you
                    like to design
                    it?
                  </h3>

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
                        Use Our
                        Designs
                      </strong>

                      <small>
                        Choose a
                        Smart
                        Memories
                        style.
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
                        Upload My
                        Own Design
                      </strong>

                      <small>
                        Use your
                        finished
                        artwork or
                        image.
                      </small>
                    </button>
                  </div>
                </div>
              )}

              {mode ===
                'quick' &&
                (!allowsOwnDesign ||
                  designSource ===
                    'ours') && (
                  <div className="smWizardSection">
                    <h3>
                      Choose a
                      design
                    </h3>

                    <div className="templateGrid">
                      {product.templates.map(
                        (
                          item
                        ) => (
                          <button
                            type="button"
                            key={
                              item
                            }
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
                              {
                                item
                              }
                            </strong>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

              {product.sizes &&
                product.sizes
                  .length >
                  0 && (
                  <div className="smWizardSection">
                    <h3>
                      {isCoaster
                        ? 'How many coasters would you like?'
                        : 'Choose the size'}
                    </h3>

                    <div className="choiceRow">
                      {product.sizes.map(
                        (
                          item
                        ) => (
                          <button
                            type="button"
                            key={
                              item
                            }
                            className={
                              size ===
                              item
                                ? 'optionPill active'
                                : 'optionPill'
                            }
                            onClick={() => {
                              setSize(item);
                              if (isCoaster) {
                                const nextMax = item === 'Single' ? 1 : Number(item.match(/[0-9]+/)?.[0] || 1);
                                if (giftPhotos.length > nextMax) {
                                  const keep = giftPhotos.slice(0, nextMax);
                                  giftPhotos.slice(nextMax).forEach(({url}) => URL.revokeObjectURL(url));
                                  setGiftPhotos(keep);
                                  setPhoto(keep[0]?.file ?? null);
                                  setPhotoUrl(keep[0]?.url ?? '');
                                }
                              }
                              markChanged();
                            }}
                          >
                            {
                              item
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

              {product.orientations &&
                product
                  .orientations
                  .length >
                  1 && (
                  <div className="smWizardSection">
                    <h3>
                      Which
                      direction?
                    </h3>

                    <div className="choiceGrid two">
                      {product.orientations.map(
                        (
                          item
                        ) => (
                          <button
                            type="button"
                            key={
                              item
                            }
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

              {product.textLayouts &&
                product
                  .textLayouts
                  .length >
                  0 &&
                designSource !==
                  'own' && (
                  <div className="smWizardSection">
                    <h3>
                      Words on the
                      physical gift
                    </h3>

                    <div className="choiceGrid">
                      {product.textLayouts.map(
                        (
                          item
                        ) => (
                          <button
                            type="button"
                            key={
                              item
                            }
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

                    {textLayout !==
                      'photo-only' && (
                      <div className="smWizardFields">
                        {(textLayout ===
                          'top' ||
                          textLayout ===
                            'top-bottom') && (
                          <label>
                            <span>
                              Top
                              phrase
                            </span>

                            <input
                              value={
                                topText
                              }
                              onChange={(
                                event
                              ) => {
                                setTopText(
                                  event
                                    .target
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
                            <span>
                              Bottom
                              phrase
                            </span>

                            <input
                              value={
                                bottomText
                              }
                              onChange={(
                                event
                              ) => {
                                setBottomText(
                                  event
                                    .target
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
                            <span>
                              Printed
                              message
                            </span>

                            <textarea
                              rows={
                                5
                              }
                              value={
                                paragraph
                              }
                              onChange={(
                                event
                              ) => {
                                setParagraph(
                                  event
                                    .target
                                    .value
                                );
                                markChanged();
                              }}
                              placeholder="Write the wording for the physical gift..."
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                )}

              {product.accessories &&
                product
                  .accessories
                  .length >
                  0 && (
                  <div className="smWizardSection">
                    <h3>
                      Would you
                      like a stand?
                    </h3>

                    <div className="choiceRow">
                      {product.accessories.map(
                        (
                          item
                        ) => (
                          <button
                            type="button"
                            key={
                              item
                            }
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
                            {
                              item
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}
            </>
          )}

          {/* =========================================
              STEP 2 — MAIN PHOTO
              ========================================= */}

          {currentStep ===
            'photo' && (
            <>
              <div className="smWizardStepHeading">
                <span>
                  STEP{' '}
                  {stepIndex +
                    1}
                </span>

                <h2>
                  Choose Your Main
                  Photo
                </h2>

                <p>
                  This is the image
                  that will appear
                  on your
                  personalised gift
                  and current Smart
                  Memory page.
                </p>
              </div>

              <div className="smWizardUploadCard">
                {!photoUrl ? (
                  <label className="smWizardUploadButton">
                    <strong>
                      Add Main Photo
                    </strong>

                    <span>
                      Choose from
                      your camera
                      roll, photo
                      library or
                      files
                    </span>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={
                        choosePhoto
                      }
                    />
                  </label>
                ) : (
                  <div className="smWizardPhotoReady">
                    <img
                      src={
                        photoUrl
                      }
                      alt="Your selected main photo"
                    />

                    <div>
                      <strong>
                        Main photo
                        added
                      </strong>

                      <div className="choiceRow">
                        <label className="optionPill">
                          Replace
                          <input
                            className="smHiddenFileInput"
                            type="file"
                            accept="image/*"
                            onChange={
                              choosePhoto
                            }
                          />
                        </label>

                        <button
                          type="button"
                          className="optionPill"
                          onClick={
                            removePhoto
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <small>
                  Supported image
                  format through
                  your browser •
                  Maximum 10 MB
                </small>

                <div className="smMultiPhotoPicker">
                  <h3>{isCoaster ? 'Choose your coaster photos' : 'Create a photo collage'}</h3>
                  <p>
                    {isCoaster
                      ? `Select 1 to ${maxGiftPhotos} different photos for your ${size.toLowerCase()}. If you select fewer than the coasters in the set, photos repeat in order.`
                      : 'Choose 1 to 6 photos. A single photo fills the gift; two or more create a collage.'}
                  </p>
                  <label className="optionPill smMultiPhotoPickButton">
                    {giftPhotos.length ? 'Change selected photos' : 'Choose photos'}
                    <input className="smHiddenFileInput" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple onChange={chooseGiftPhotos} />
                  </label>
                  <small>{selectedGiftPhotos.length} of {maxGiftPhotos} photos selected · 10 MB each</small>
                  {selectedGiftPhotos.length > 0 && (
                    <div className="smMultiPhotoThumbs">
                      {selectedGiftPhotos.map(({url}, index) => (
                        <div key={url} className="smMultiPhotoThumb">
                          <img src={url} alt={`Selected photo ${index + 1}`} />
                          <button type="button" onClick={() => removeGiftPhoto(index)} aria-label={`Remove photo ${index + 1}`}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {!isCoaster && selectedGiftPhotos.length > 1 && (
                    <div className="smMultiPhotoLayouts">
                      <strong>Choose your collage layout</strong>
                      <div className="choiceRow">
                        {(['grid','strip'] as PhotoLayout[]).map(layout => (
                          <button key={layout} type="button"
                            className={photoLayout === layout ? 'optionPill active' : 'optionPill'}
                            onClick={() => {setPhotoLayout(layout);markChanged();}}>
                            {layout === 'grid' ? 'Photo grid' : 'Photo strip'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {allowsOwnDesign &&
                  designSource ===
                    'own' && (
                    <p>
                      Your uploaded
                      finished
                      artwork will
                      also be used
                      as the current
                      Smart Memory
                      image.
                    </p>
                  )}
              </div>
            </>
          )}

          {/* =========================================
              VOICE
              ========================================= */}

          {currentStep ===
            'voice' && (
            <>
              <div className="smWizardStepHeading">
                <span>
                  STEP{' '}
                  {stepIndex +
                    1}
                </span>

                <h2>
                  Add Your Voice
                </h2>

                <p>
                  Sometimes hearing
                  someone's voice
                  means more than
                  any photograph.
                </p>
              </div>

              <div className="smWizardVoiceCard">
                {!audioUrl &&
                  !recording && (
                    <div className="smWizardVoiceActions">
                      <button
                        type="button"
                        className="btn big"
                        onClick={
                          startRecording
                        }
                      >
                        🎙 Record a
                        Message
                      </button>

                      <label className="btn secondary">
                        Upload
                        Recording

                        <input
                          className="smHiddenFileInput"
                          type="file"
                          accept="audio/*"
                          onChange={
                            chooseAudio
                          }
                        />
                      </label>
                    </div>
                  )}

                {recording && (
                  <div className="smWizardRecordingLive">
                    <span className="smWizardRecordingDot" />

                    <strong>
                      Recording...
                    </strong>

                    <span>
                      {formatTime(
                        recordingSeconds
                      )}
                    </span>

                    <button
                      type="button"
                      className="btn"
                      onClick={
                        stopRecording
                      }
                    >
                      Stop Recording
                    </button>
                  </div>
                )}

                {audioUrl && (
                  <div className="smWizardAudioReady">
                    <strong>
                      ✓ Voice
                      message ready
                    </strong>

                    <audio
                      controls
                      preload="metadata"
                      src={
                        audioUrl
                      }
                    />

                    <div className="choiceRow">
                      <button
                        type="button"
                        className="optionPill"
                        onClick={
                          deleteRecording
                        }
                      >
                        Remove
                      </button>

                      <label className="optionPill">
                        Replace with
                        upload

                        <input
                          className="smHiddenFileInput"
                          type="file"
                          accept="audio/*"
                          onChange={
                            chooseAudio
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}

                <small>
                  Audio maximum:
                  25 MB
                </small>
              </div>

              <div className="smWizardPromptIdeas">
                <strong>
                  Not sure what to
                  say?
                </strong>

                <p>
                  “Happy birthday —
                  I hope you always
                  remember...”
                </p>

                <p>
                  “I wanted you to
                  hear this whenever
                  you miss me...”
                </p>

                <p>
                  “Here's to all the
                  memories we've
                  made together...”
                </p>

                <p>
                  “I love you
                  because...”
                </p>
              </div>

              <p className="smWizardOptional">
                Voice is optional.
                You can continue
                without adding one.
              </p>
            </>
          )}

          {/* =========================================
              MESSAGE
              ========================================= */}

          {currentStep ===
            'message' && (
            <>
              <div className="smWizardStepHeading">
                <span>
                  STEP{' '}
                  {stepIndex +
                    1}
                </span>

                <h2>
                  Write Your
                  Message
                </h2>

                <p>
                  Add the words you
                  want them to see
                  when their Smart
                  Memory opens.
                </p>
              </div>

              <div className="smWizardFields">
                <label>
                  <span>
                    Who is this
                    memory for? *
                  </span>

                  <input
                    value={
                      recipient
                    }
                    onChange={(
                      event
                    ) => {
                      setRecipient(
                        event
                          .target
                          .value
                      );
                      markChanged();
                    }}
                    placeholder="e.g. Mum, Sarah, Grandad..."
                  />
                </label>

                <label>
                  <span>
                    Personal
                    message
                  </span>

                  <textarea
                    rows={7}
                    value={
                      memoryMessage
                    }
                    onChange={(
                      event
                    ) => {
                      setMemoryMessage(
                        event
                          .target
                          .value
                      );
                      markChanged();
                    }}
                    placeholder={
                      occasion ===
                      'Pet Memory'
                        ? 'Add your favourite moments together...'
                        : occasion ===
                            'Remembrance'
                          ? 'Write about the moments you never want to forget...'
                          : occasion ===
                              'New Baby'
                            ? 'Write about the little moments you want to remember forever...'
                            : 'Write something they will want to keep...'
                    }
                  />
                </label>

                <label>
                  <span>
                    From
                  </span>

                  <input
                    value={
                      sender
                    }
                    onChange={(
                      event
                    ) => {
                      setSender(
                        event
                          .target
                          .value
                      );
                      markChanged();
                    }}
                    placeholder="Your name"
                  />
                </label>
              </div>
            </>
          )}

          {/* =========================================
              PREVIEW
              ========================================= */}

          {currentStep ===
            'preview' && (
            <>
              <div className="smWizardStepHeading">
                <span>
                  STEP{' '}
                  {stepIndex +
                    1}
                </span>

                <h2>
                  Preview Your
                  Smart Memory
                </h2>

                <p>
                  See what they'll
                  experience when
                  they tap their
                  gift.
                </p>
              </div>

              <div className="smWizardDualPreview">
                <article>
                  <span className="v14Eyebrow">
                    A. YOUR
                    PHYSICAL GIFT
                  </span>

                  <ConfiguredProductPreview
                    slug={
                      product.slug
                    }
                    photoUrl={
                      photoUrl
                    }
                    photos={selectedGiftPhotos.map(item => item.url)}
                    photoLayout={photoLayout}
                    coasterCount={coasterCount}
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
                </article>

                <article>
                  <span className="v14Eyebrow">
                    B. THEIR SMART
                    MEMORY
                  </span>

                  <SmartMemoryLivePreview
                    recipient={
                      recipient
                    }
                    message={
                      finalMemoryMessage
                    }
                    sender={
                      sender
                    }
                    occasion={
                      occasion
                    }
                    photoUrl={
                      photoUrl
                    }
                    audioUrl={
                      audioUrl
                    }
                  />
                </article>
              </div>

              <div className="smWizardReviewSummary">
                <div>
                  <span>
                    Gift
                  </span>

                  <strong>
                    {
                      product.name
                    }
                  </strong>
                </div>

                <div>
                  <span>
                    Main photo
                  </span>

                  <strong>
                    {photo
                      ? '✓ Added'
                      : 'Not added'}
                  </strong>
                </div>

                <div>
                  <span>
                    Voice
                  </span>

                  <strong>
                    {audio
                      ? '✓ Added'
                      : 'Optional'}
                  </strong>
                </div>

                <div>
                  <span>
                    Message
                  </span>

                  <strong>
                    {finalMemoryMessage
                      ? '✓ Ready'
                      : 'Not added'}
                  </strong>
                </div>

                {shopProduct && (
                  <div>
                    <span>
                      Price
                    </span>

                    <strong>
                      £
                      {shopProduct.price.toFixed(
                        2
                      )}
                    </strong>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn big smWizardCreateButton"
                disabled={
                  saving
                }
                onClick={
                  saveSmartMemory
                }
              >
                {saving
                  ? 'Creating your Smart Memory...'
                  : 'Create My Smart Gift →'}
              </button>

              {saving && (
                <p className="smWizardSavingNote">
                  Uploading your
                  photo and voice
                  message and
                  preparing your
                  Smart Memory...
                </p>
              )}
            </>
          )}

          {/* =========================================
              READY
              ========================================= */}

          {currentStep ===
            'ready' && (
            <>
              <div className="smWizardReady">
                <span className="smWizardReadyMark">
                  ✓
                </span>

                <span className="v14Eyebrow">
                  YOUR SMART MEMORY
                  IS READY
                </span>

                <h2>
                  Ready to add your
                  Smart Gift to the
                  basket.
                </h2>

                <div className="smWizardReadySummary">
                  <div>
                    <span>
                      Gift
                    </span>

                    <strong>
                      {
                        product.name
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Main photo
                    </span>

                    <strong>
                      ✓ Added
                    </strong>
                  </div>

                  <div>
                    <span>
                      Voice
                    </span>

                    <strong>
                      {audio
                        ? '✓ Added'
                        : 'Not added'}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Message
                    </span>

                    <strong>
                      ✓ Added
                    </strong>
                  </div>

                  {savedCode && (
                    <div>
                      <span>
                        Memory
                        reference
                      </span>

                      <strong>
                        {
                          savedCode
                        }
                      </strong>
                    </div>
                  )}

                  {shopProduct && (
                    <div>
                      <span>
                        Price
                      </span>

                      <strong>
                        £
                        {shopProduct.price.toFixed(
                          2
                        )}
                      </strong>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn big smWizardCreateButton"
                  onClick={
                    addToBasket
                  }
                >
                  Add My Smart Gift
                  to Basket →
                </button>

                <p>
                  Your existing
                  memory code will
                  stay attached to
                  this product
                  through the
                  basket and order.
                </p>
              </div>
            </>
          )}

          {stepError && (
            <div
              className="smWizardError"
              role="alert"
            >
              {stepError}
            </div>
          )}

          {/* BACK / CONTINUE */}

          {currentStep !==
            'preview' &&
            currentStep !==
              'ready' && (
              <div className="smWizardNavigation">
                {stepIndex >
                  0 ? (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={
                      goBack
                    }
                  >
                    ← Back
                  </button>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  className="btn big"
                  onClick={
                    goNext
                  }
                >
                  Continue →
                </button>
              </div>
            )}

          {currentStep ===
            'preview' && (
            <div className="smWizardNavigation smWizardPreviewBack">
              <button
                type="button"
                className="btn secondary"
                disabled={
                  saving
                }
                onClick={
                  goBack
                }
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* =========================================
            LIVE PHYSICAL PREVIEW
            ========================================= */}

        {currentStep !==
          'preview' &&
          currentStep !==
            'ready' && (
            <aside className="smWizardStickyPreview">
              <span className="eyebrow">
                LIVE GIFT PREVIEW
              </span>

              <ConfiguredProductPreview
                slug={
                  product.slug
                }
                photoUrl={
                  photoUrl
                }
                photos={selectedGiftPhotos.map(item => item.url)}
                photoLayout={photoLayout}
                coasterCount={coasterCount}
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

              <div className="smWizardMiniSummary">
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

                {recipient && (
                  <p>
                    <strong>
                      For:
                    </strong>{' '}
                    {recipient}
                  </p>
                )}

                <p>
                  <strong>
                    Voice:
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
            </aside>
          )}
      </div>
    </section>
  );
}