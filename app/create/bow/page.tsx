'use client';

import Link from 'next/link';
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

function BowColourContent() {
  const router = useRouter();
  const query = useSearchParams();
  const code = query.get('code')?.trim() || '';
  const tagSelected = query.get('choice') === 'tag';
  const validCode = /^[A-HJ-NP-Z2-9]{8}$/.test(code);
  const [colour, setColour] = useState<string>('rose-gold');
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

  function buyDigitalMemory() {
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
        price:5,
        quantity:1,
        personalisation:{digitalOnly:true,memoryCode:code},
      };
      if(index>=0) basket[index]=line;
      else basket.push(line);
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      router.push('/checkout');
    } catch {
      setSubmitting(false);
      setError('Unable to open checkout. Please check your browser settings.');
    }
  }

  function continueToPayment() {
    if (!validCode || !pricePence || submitting) return;
    const selected = colours.find(item => item.id === colour);
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      localStorage.setItem(`sm-bow-choice:${code}`, JSON.stringify({colour,code}));
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
        imageUrl: null,
        price:pricePence/100,
        quantity:1,
        personalisation:{
          bowColour: selected.name,
          bowColourId: selected.id,
          finish:'decorative satin bow',
          memoryCode:code,
        },
      };
      if (previous >= 0) basket[previous] = line;
      else basket.push(line);
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      router.push('/checkout');
    } catch {
      setError('Could not prepare checkout. Please check your browser storage settings and try again.');
      setSubmitting(false);
    }
  }

  if (!validCode) {
    return <section className="smBowPage"><h1>Start by creating your memory</h1>
      <p>Save a memory first so that your gift tag can be linked to it.</p>
      <Link className="btn" href="/create?mode=tag">Create a memory</Link>
    </section>;
  }

  return <main className="smBowPage">
    <div className="smBowIntro">
      <span className="v14Eyebrow">MEMORY ONLY · FINAL STEP</span>
      <h1>{tagSelected ? 'Choose the bow for your memory tag' : 'Your Smart Memory is ready'}</h1>
      <p>{tagSelected
        ? 'Your memory is saved. Choose a satin bow colour for your £5 gift tag, then continue to checkout.'
        : 'Buy the digital memory on its own for £5, or choose a decorative satin bow and physical gift tag.'}</p>
      <p className="smBowMemoryReference">Memory reference: <strong>{code}</strong> · <Link href={`/m/${code}`}>View memory</Link></p>
    </div>
    {!tagSelected && <section className="smDigitalMemoryCheckout">
      <div>
        <span className="v14Eyebrow">SMART MEMORY ALONE</span>
        <h2>Digital Smart Memory — £5.00</h2>
        <p>Photo, personal message and voice memory. No physical tag, bow or delivery charge.</p>
      </div>
      <button type="button" className="btn big" disabled={submitting}
        onClick={buyDigitalMemory}>
        {submitting ? 'Opening checkout…' : 'Pay £5 — Digital Memory Only'}
      </button>
    </section>}
    {!tagSelected && <p className="smPhysicalBowDivider">Prefer a physical gift? Choose a bow colour below.</p>}
    <div className="smBowLayout">
      <div className="smBowPreview">
        <div className="smBowPreviewArt" role="img" aria-label="Smart Memories decorative satin ribbon bow and hanging gift tag" />
        <strong>{colours.find(item=>item.id===colour)?.name} satin bow</strong>
        <small>Rose-gold example. Choose your preferred colour on the right.</small>
      </div>
      <div className="smBowSelection">
        <h2>Select a colour</h2>
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
        {error && <p role="alert" className="smBowError">{error}</p>}
        <div className="smBowConfirmed">
          <strong>Memory Tag with satin bow — £5.00</strong>
          <small>Delivery is calculated at checkout.</small>
          <button className="btn big" type="button"
            disabled={checking || !pricePence || submitting}
            onClick={continueToPayment}>
            {submitting ? 'Opening checkout…' : checking ? 'Checking price…' : 'Continue to payment — £5.00'}
          </button>
          <Link href={`/m/${code}`}>View your saved memory</Link>
        </div>
      </div>
    </div>
  </main>;
}

export default function BowPage() {
  return <Suspense fallback={<div className="smBowPage">Loading bow colours…</div>}><BowColourContent /></Suspense>;
}
