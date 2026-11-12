'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGiftTags } from '@/lib/useGiftTags';
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
  const designId = query.get('design') ?? savedDesignId;
  const design = designId ? tags?.find(item => item.id === designId) : tags?.[0];
  const [submitting, setSubmitting] = useState(false);
  const [pricePence, setPricePence] = useState<number|null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!validCode) return;
    try {
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

  function addTagToBasket() {
    if (!design) return;
    if (!validCode || !pricePence || submitting) return;
    const selected = colours.find(item => item.id === colour);
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      localStorage.setItem(`sm-bow-choice:${code}`, JSON.stringify({colour,code,designId:design.id}));
      const existing = JSON.parse(localStorage.getItem('smart-memories-cart') || '[]');
      const basket = Array.isArray(existing) ? existing : [];
      // Replace an earlier unfinished entry for this exact memory tag so a
      // returning customer does not accidentally buy two copies.
      const previous = basket.findIndex((item: {productSlug?: string;memoryCode?: string}) =>
        item.productSlug === 'memory-tag' && item.memoryCode === code
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
        imageUrl: design.image,
        price:pricePence/100,
        quantity:1,
        personalisation:{
          bowColour: selected.name,
          bowColourId: selected.id,
          tagDesign: design.name,
          tagDesignId: design.id,
          finish:'decorative satin bow',
          memoryCode:code,
        },
      };
      if (previous >= 0) basket[previous] = line;
      else basket.push(line);
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      router.push('/cart');
    } catch {
      setError('Could not add your tag to the basket. Please check your browser storage settings and try again.');
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
      <p>Choose a satin bow for a tag you can attach to your own present, or add the digital memory on its own.</p>
      <p className="smBowMemoryReference">Memory reference: <strong>{code}</strong> · <Link href={`/m/${code}`}>View memory</Link></p>
    </div>
    <section className="smDigitalMemoryCheckout">
      <div>
        <span className="v14Eyebrow">SMART MEMORY ALONE</span>
        <h2>Digital Smart Memory — £{digitalPrice.toFixed(2)}</h2>
        <p>Photo, personal message and voice memory. No physical tag, bow or delivery charge.</p>
      </div>
      <button type="button" className="btn big" disabled={submitting}
        onClick={addDigitalMemoryToBasket}>
        Add digital memory to basket
      </button>
    </section>
    {error && <p role="alert" className="smBowError">{error}</p>}
    {!design && <p role="status">{tagsFailed ? 'Could not load Gift Tags.' : tags ? 'This tag is unavailable.' : 'Loading your Gift Tag…'}
      {' '}<Link href={{ pathname: '/tags', query: { code } }}>Browse Gift Tags</Link></p>}
    {design && <>
    <p className="smPhysicalBowDivider">Choose a bow colour for your gift tag.</p>
    <div className="smBowLayout">
      <div className="smBowPreview">
        <Image className="smTagDesignPreview" src={design.image} width={300} height={390}
          sizes="(max-width: 600px) 65vw, 280px" alt={design.name} unoptimized={design.image.startsWith('https://')} />
        <strong>{design.name}</strong>
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
            disabled={checking || !pricePence || submitting}
            onClick={addTagToBasket}>
            {submitting ? 'Adding to basket…' : checking ? 'Checking price…' : 'Add tag to basket'}
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
