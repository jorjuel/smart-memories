'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGiftTags } from '@/lib/useGiftTags';
import { giftTagsOnly } from '@/lib/storefrontAvailability';
import { uploadMemoryMedia } from '@/lib/memoryMediaUpload';
import { getProductPricePence } from '@/lib/pricing';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const colours = [
  { id:'rose-gold', name:'Rose Gold', value:'#b67c6e' },
  { id:'champagne', name:'Champagne', value:'#d4b99a' },
  { id:'ivory', name:'Ivory', value:'#eee4d1' },
  { id:'blush', name:'Blush Pink', value:'#dbabb9' },
  { id:'burgundy', name:'Burgundy', value:'#743246' },
  { id:'sage', name:'Sage Green', value:'#a4b19d' },
] as const;

const digitalPrice = getProductPricePence('digital-memory') / 100;

function BowColourContent() {
  const router = useRouter();
  const query = useSearchParams();
  const code = query.get('code')?.trim() || '';
  const validCode = /^[A-HJ-NP-Z2-9]{8}$/.test(code);
  const [colour, setColour] = useState<string>('rose-gold');
  const [savedDesignId, setSavedDesignId] = useState<string>();
  const { tags, failed: tagsFailed } = useGiftTags(validCode);
  const [selectedDesign, ...selectedNext] = query.getAll('selection');
  const [nextDesign, ...remaining] = [...selectedNext, ...query.getAll('nextDesign')];
  const reuseMemory = Boolean(selectedDesign) || query.get('reuseMemory') === '1';
  const designId = query.get('design') ?? selectedDesign ?? savedDesignId;
  const customTag = designId === 'custom';
  const design = customTag ? { id: 'custom', name: 'Your own tag design', image: '' }
    : tags?.find(item => item.id === designId);
  const [artwork, setArtwork] = useState<File>();
  const [savedArtwork, setSavedArtwork] = useState<{ code: string; path: string }>();
  const savedArtworkPath = savedArtwork?.code === code ? savedArtwork.path : undefined;
  const artworkUrl = savedArtworkPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/memory-media/${savedArtworkPath}`
    : '';
  const [artworkPreview, setArtworkPreview] = useState('');
  useEffect(() => {
    if (!artwork) {
      setArtworkPreview('');
      return;
    }
    const url = URL.createObjectURL(artwork);
    setArtworkPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [artwork]);
  const [submitting, setSubmitting] = useState(false);
  const [pricePence, setPricePence] = useState<number|null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!validCode) return;
    try {
      const path = sessionStorage.getItem(`sm-tag-artwork:${code}`);
      if (path) setSavedArtwork({ code, path });
      const stored = localStorage.getItem(`sm-bow-choice:${code}`);
      const parsed = stored ? JSON.parse(stored) : null;
      if (colours.some(item => item.id === parsed?.colour)) {
        setColour(parsed.colour);
      }
      setSavedDesignId(parsed?.designId);
    } catch { /* No prior selection on this device. */ }
  }, [code, validCode]);

  useEffect(() => {
    let active = true;
    fetch('/api/memory-tag-price', {cache:'no-store'})
      .then(response => response.json())
      .then(result => {
        if (!active) return;
        if (result.available && Number.isInteger(result.pricePence) && result.pricePence>0) {
          setPricePence(result.pricePence);
        }
      })
      .catch(() => { /* A missing price never implies a free physical item. */ })
      .finally(() => { if(active) setChecking(false); });
    return () => { active = false; };
  }, []);

  function addDigitalMemoryToBasket() {
    if (!validCode || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const existing = JSON.parse(localStorage.getItem('smart-memories-cart') || '[]');
      const basket = Array.isArray(existing) ? existing : [];
      const index = basket.findIndex((item: {productSlug?:string;memoryCode?:string}) =>
        item.productSlug === 'digital-memory' && item.memoryCode === code);
      const line = {
        id: index >= 0 && typeof basket[index]?.id === 'string' ? basket[index].id : crypto.randomUUID(),
        productType:'product',
        productSlug:'digital-memory',
        name:'Smart Memory — Digital Only',
        category:'Digital Memories',
        memoryCode:code,
        imageUrl:null,
        price:digitalPrice,
        quantity:1,
        personalisation:{digitalOnly:true,memoryCode:code},
      };
      if(index>=0) basket[index]=line;
      else basket.push(line);
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      router.push('/cart');
    } catch {
      setSubmitting(false);
      setError('Could not add your digital memory to the basket. Please check your browser storage settings and try again.');
    }
  }

  async function addTagToBasket() {
    if (!design || (customTag && !artwork && !savedArtworkPath)) return;
    if (!validCode || !pricePence || submitting) return;
    const selected = colours.find(item => item.id === colour);
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const artworkPath = customTag
        ? artwork ? await uploadMemoryMedia(artwork, 'photo') : savedArtworkPath
        : undefined;
      const imageUrl = artworkPath
        ? new URL(`/storage/v1/object/public/memory-media/${artworkPath}`, process.env.NEXT_PUBLIC_SUPABASE_URL).href
        : design.image;
      localStorage.setItem(`sm-bow-choice:${code}`, JSON.stringify({colour,code,designId:design.id}));
      const existing = JSON.parse(localStorage.getItem('smart-memories-cart') || '[]');
      const basket = Array.isArray(existing) ? existing : [];
      const previous = basket.findIndex((item: {
        productSlug?: string;
        memoryCode?: string;
        personalisation?: { tagDesignId?: string; bowColourId?: string; artworkPath?: string };
      }) =>
        item?.productSlug === 'memory-tag' && item.memoryCode === code &&
        item.personalisation?.tagDesignId === design.id &&
        item.personalisation.bowColourId === selected.id &&
        item.personalisation.artworkPath === artworkPath
      );
      const line = {
        id: previous >= 0 && typeof basket[previous]?.id === 'string'
          ? basket[previous].id : crypto.randomUUID(),
        productType:'product',
        productSlug:'memory-tag',
        name:'Smart Memory Tag with Decorative Bow',
        category:'Smart Memory Tags',
        memoryCode: code,
        design: design.name,
        imageUrl,
        price:pricePence/100,
        quantity: previous >= 0 ? basket[previous].quantity : 1,
        personalisation:{
          bowColour: selected.name,
          bowColourId: selected.id,
          tagDesign: design.name,
          tagDesignId: design.id,
          artworkPath,
          finish:'decorative satin bow',
          memoryCode:code,
        },
      };
      if (previous >= 0) basket[previous] = line;
      else basket.push(line);
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      if (nextDesign) {
        const next = new URLSearchParams(reuseMemory ? { code, design: nextDesign, reuseMemory: '1' } : { mode: 'tag', design: nextDesign });
        remaining.forEach(id => next.append('nextDesign', id));
        window.location.assign(`${reuseMemory ? '/create/bow' : '/create'}?${next}`);
      } else {
        router.push('/cart');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not add your tag to the basket. Please try again.');
      setSubmitting(false);
    }
  }

  if (!validCode) {
    return <section className="smBowPage"><h1>Start by creating your memory</h1>
      <p>Save a memory first so that your gift tag can be linked to it.</p>
      <Link className="btn" href="/tags">Choose a gift tag</Link>
    </section>;
  }

  return <main className="smBowPage">
    <div className="smBowIntro">
      <span className="v14Eyebrow">MEMORY ONLY · FINAL STEP</span>
      <h1>Your Smart Memory is ready</h1>
      <p>Choose a satin bow for a tag you can attach to your own present.</p>
      <p className="smBowMemoryReference">Memory reference: <strong>{code}</strong> · <Link href={`/m/${code}`}>View memory</Link></p>
    </div>
    {!giftTagsOnly && <section className="smDigitalMemoryCheckout">
      <div>
        <span className="v14Eyebrow">SMART MEMORY ALONE</span>
        <h2>Digital Smart Memory — £{digitalPrice.toFixed(2)}</h2>
        <p>Photo, personal message and voice memory. No physical tag, bow or delivery charge.</p>
      </div>
      <button type="button" className="btn big" disabled={submitting}
        onClick={addDigitalMemoryToBasket}>
        Add digital memory to basket
      </button>
    </section>}
    {error && <p role="alert" className="smBowError">{error}</p>}
    {!design && <p role="status">{!designId ? 'Choose a tag design to preview it with a bow.' : tagsFailed ? 'Could not load Gift Tags.' : tags ? 'This tag is unavailable.' : 'Loading your Gift Tag…'}
      {' '}<Link href={{ pathname: '/tags', query: { code } }}>Browse Gift Tags</Link></p>}
    {design && <>
    <p className="smPhysicalBowDivider">Choose a bow colour for {design.name}.</p>
    <div className="smBowLayout">
      <div className="smBowPreview">
        {(customTag ? artworkPreview || artworkUrl : design.image) && <Image className="smTagDesignPreview" src={customTag ? artworkPreview || artworkUrl : design.image} width={300} height={390}
          sizes="(max-width: 600px) 65vw, 280px" alt={design.name} unoptimized={customTag || design.image.startsWith('https://')} />}
        <strong>{design.name}</strong>
        {customTag && !savedArtworkPath && <label>
          Upload the image to print on your tag (JPEG, PNG or WebP, up to 10 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={submitting}
            onChange={(event) => {
              const file = event.target.files?.[0];
              const valid = file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size > 0 && file.size <= 10 * 1024 * 1024;
              setArtwork(valid ? file : undefined);
              setError(file && !valid ? 'Choose a JPEG, PNG or WebP image up to 10 MB.' : '');
            }} />
        </label>}
        <small>Selected bow: {colours.find(item=>item.id===colour)?.name}</small>
        <Link href={{ pathname: '/tags', query: { code } }}>Change tag design</Link>
      </div>
      <div className="smBowSelection">
        <h2>Choose a bow colour</h2>
        <div className="smBowColourGrid">
          {colours.map(item => (
            <button type="button" key={item.id}
              aria-pressed={colour===item.id}
              className={colour===item.id ? 'smBowColour active' : 'smBowColour'}
              onClick={() => setColour(item.id)}
            >
              <span className="smBowSwatch" style={{backgroundColor:item.value}} aria-hidden="true" />
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
        <div className="smBowConfirmed">
          <strong>Memory Tag with satin bow{pricePence ? ` — £${(pricePence / 100).toFixed(2)}` : ''}</strong>
          <small>Delivery is calculated at checkout.</small>
          <button className="btn big" type="button"
            disabled={checking || !pricePence || submitting || (customTag && !artwork && !savedArtworkPath)}
            onClick={addTagToBasket}>
            {submitting ? 'Adding to basket…' : checking ? 'Checking price…' : nextDesign ? 'Add tag and continue to next' : 'Add tag to basket'}
          </button>
          <Link href={`/m/${code}`}>View your saved memory</Link>
        </div>
      </div>
    </div>
    </>}
  </main>;
}

export default function BowPage() {
  return <Suspense fallback={<div className="smBowPage">Loading bow colours…</div>}><BowColourContent /></Suspense>;
}
