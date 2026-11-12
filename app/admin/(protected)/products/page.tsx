'use client';

import { useEffect, useState } from 'react';
import { products } from '@/lib/products';
import { defaultCatalogueCards, type CatalogueCard } from '@/lib/cardDesigns';
import ProductGalleryAdmin from '@/components/ProductGalleryAdmin';
import AdminCardEditor from '@/components/AdminCardEditor';
import AdminGiftTags from '@/components/AdminGiftTags';

type Catalog = { images: Record<string, string>; configured: boolean; cards?: CatalogueCard[]; giftPrices?: Record<string, number> };

export default function AdminProductPhotosPage() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [giftPrices, setGiftPrices] = useState<Record<string, number>>({});
  const [cards, setCards] = useState(defaultCatalogueCards);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [selectedCard, setSelectedCard] = useState(defaultCatalogueCards[0].photoSlug);
  const [editorVersions, setEditorVersions] = useState<Record<string, number>>({});
  const [giftSlug, setGiftSlug] = useState(products[0].slug);
  const gift = products.find((product) => product.slug === giftSlug) ?? products[0];
  const [cardStatus, setCardStatus] = useState('');

  async function reload() {
    const response = await fetch('/api/product-photos', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load cloud product photos.');
    const result: Catalog = await response.json();
    setImages(result.images || {});
    setGiftPrices(result.giftPrices ?? {});
    const nextCards = result.cards ?? defaultCatalogueCards;
    setCards(nextCards);
    setSelectedCard(current => current === 'new' || nextCards.some(card => card.photoSlug === current)
      ? current : nextCards[0]?.photoSlug ?? 'new');
    setConfigured(result.configured);
  }

  useEffect(() => { void reload().catch(() => setConfigured(false)); }, []);

  return (
    <section className="wrap">
      <span className="eyebrow">OWNER / PRODUCT PHOTOGRAPHY</span>
      <h1>Product photography</h1>
      <p className="lead">Upload photographs for the shop and Handcrafted Cards gallery. Images are compressed before uploading.</p>
      {configured === false && (
        <div className="card adminNote" role="status">
          <strong>Cloud setup required.</strong> Create the public
          <code> product-catalog </code> storage bucket in Supabase before uploading.
          The shop and card gallery use illustrations when a photo is unavailable.
        </div>
      )}
      <section>
        <h2>Handcrafted cards</h2>
        <label className="adminCardSelector">Card design
          <select value={selectedCard} onChange={(event) => { setSelectedCard(event.target.value); setCardStatus(''); }}>
            {cards.map((card) => <option key={card.photoSlug} value={card.photoSlug}>{card.name}</option>)}
            <option value="new">＋ Add a new card design</option>
          </select>
        </label>
        {configured !== null && [...cards, undefined].map((card) => {
          const key = card?.photoSlug ?? 'new';
          return <div key={key} hidden={selectedCard !== key}>
            <AdminCardEditor key={editorVersions[key] ?? 0} card={card} images={images} disabled={configured !== true}
              onRemoved={async () => {
                await reload();
                setCardStatus('Card removed from the shop.');
                window.dispatchEvent(new Event('sm-product-image-updated'));
              }}
              onSaved={async (slug) => {
                await reload();
                setEditorVersions((current) => ({ ...current, [key]: (current[key] ?? 0) + 1 }));
                setSelectedCard((current) => current === key ? slug : current);
                setCardStatus('Card changes applied.');
                window.dispatchEvent(new Event('sm-product-image-updated'));
              }} />
          </div>;
        })}
        {cardStatus && <p role="status">{cardStatus}</p>}
      </section>
      <AdminGiftTags disabled={configured !== true} />
      <section>
        <h2>Personalised gifts</h2>
        <label className="adminCardSelector">Gift
          <select value={giftSlug} onChange={(event) => setGiftSlug(event.target.value)}>
            {products.map((product) => <option key={product.slug} value={product.slug}>{product.name}</option>)}
          </select>
        </label>
        {configured === true && <ProductGalleryAdmin key={gift.slug} slug={gift.slug} name={gift.name}
          main={images[gift.slug]} pricePence={giftPrices[gift.slug] ?? Math.round(gift.price * 100)} onSaved={async () => {
            await reload();
            window.dispatchEvent(new Event('sm-product-image-updated'));
          }} />}
      </section>
    </section>
  );
}
