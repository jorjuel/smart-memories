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
  const validCode = /^[A-HJ-NP-Z2-9]{8}$/.test(code);
  const [colour, setColour] = useState<string>('rose-gold');
  const [confirmed, setConfirmed] = useState(false);
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
        setConfirmed(true);
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

  function confirmColour() {
    if (!validCode) return;
    try {
      localStorage.setItem(`sm-bow-choice:${code}`, JSON.stringify({colour,code}));
      setConfirmed(true);
      setError('');
    } catch {
      setError('Unable to save this choice on your device. Please check browser storage permissions.');
    }
  }

  function addToBasket() {
    if (!validCode || !confirmed || !pricePence) return;
    const selected = colours.find(item => item.id === colour);
    if (!selected) return;
    try {
      const existing = JSON.parse(localStorage.getItem('smart-memories-cart') || '[]');
      const basket = Array.isArray(existing) ? existing : [];
      basket.push({
        id: crypto.randomUUID(),
        productType:'product',
        productSlug:'memory-tag',
        name:'Smart Memory Tag with Decorative Bow',
        category:'Smart Memory Tags',
        memoryCode: code,
        recipient: '',
        imageUrl: null,
        price:pricePence/100,
        quantity:1,
        personalisation:{
          bowColour: selected.name,
          bowColourId: selected.id,
          finish:'decorative satin bow',
          memoryCode:code,
        },
      });
      localStorage.setItem('smart-memories-cart', JSON.stringify(basket));
      router.push('/cart');
    } catch {
      setError('We could not add the memory tag to your basket. Please try again.');
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
      <h1>Choose your satin bow colour</h1>
      <p>Your memory has been saved. Choose the finishing touch for its personalised gift tag.</p>
      <p className="smBowMemoryReference">Memory reference: <strong>{code}</strong> · <Link href={`/m/${code}`}>View memory</Link></p>
    </div>
    <div className="smBowLayout">
      <div className="smBowPreview">
        <div className="smBowPreviewArt" role="img" aria-label="Smart Memories decorative satin ribbon bow and hanging gift tag" />
        <strong>{colours.find(item=>item.id===colour)?.name} satin bow</strong>
        <small>Illustration shows the rose-gold design. Other colours are represented by swatches until product photography is available.</small>
      </div>
      <div className="smBowSelection">
        <h2>Select a colour</h2>
        <div className="smBowColourGrid">
          {colours.map(item => (
            <button type="button" key={item.id}
              aria-pressed={colour===item.id}
              className={colour===item.id ? 'smBowColour active' : 'smBowColour'}
              onClick={() => {setColour(item.id);setConfirmed(false);}}
            >
              <span className="smBowSwatch" style={{backgroundColor:item.value}} aria-hidden="true" />
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
        {error && <p role="alert" className="smBowError">{error}</p>}
        {!confirmed ? (
          <button className="btn big" type="button" onClick={confirmColour}>Confirm bow colour</button>
        ) : (
          <div className="smBowConfirmed">
            <p role="status">✓ Your {colours.find(item=>item.id===colour)?.name} bow is selected.</p>
            {pricePence ? (
              <>
                <strong>£{(pricePence/100).toFixed(2)} excluding delivery</strong>
                <button type="button" className="btn big" onClick={addToBasket}>Add Memory Tag to basket</button>
              </>
            ) : checking ? <p>Checking availability and price…</p> : (
              <>
                <p>The physical Memory Tag is not available for online checkout until its price has been configured. Your digital memory is saved and your bow choice is kept on this device.</p>
                <Link href="/contact?type=memory-tag" className="btn">Enquire about your gift tag</Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  </main>;
}

export default function BowPage() {
  return <Suspense fallback={<div className="smBowPage">Loading bow colours…</div>}><BowColourContent /></Suspense>;
}
