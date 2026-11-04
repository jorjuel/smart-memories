'use client';

import { useEffect, useState } from 'react';
import { products, money, type Product } from '@/lib/products';
import { compressProductImage } from '@/lib/productImages';

type Catalog = { images: Record<string, string>; configured: boolean };

export default function AdminProductPhotosPage() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [message, setMessage] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  async function reload() {
    const response = await fetch('/api/product-photos', { cache: 'no-store' });
    if (!response.ok) throw new Error('Could not load cloud product photos.');
    const result: Catalog = await response.json();
    setImages(result.images || {});
    setConfigured(result.configured);
  }

  useEffect(() => { void reload().catch(() => setConfigured(false)); }, []);

  async function upload(product: Product, file?: File) {
    if (!file) return;
    setBusy(product.slug);
    setMessage((m) => ({ ...m, [product.slug]: 'Preparing photograph...' }));
    try {
      const optimised = await compressProductImage(file);
      const body = new FormData();
      body.set('slug', product.slug);
      body.set('file', optimised, `${product.slug}.jpg`);
      const response = await fetch('/api/product-photos', {
        method: 'POST', body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed.');
      await reload();
      window.dispatchEvent(new Event('sm-product-image-updated'));
      setMessage((m) => ({ ...m, [product.slug]: 'Photo published for all visitors.' }));
    } catch (error) {
      setMessage((m) => ({ ...m, [product.slug]:
        error instanceof Error ? error.message : 'Upload failed.' }));
    } finally {
      setBusy(null);
    }
  }

  async function remove(product: Product) {
    if (!window.confirm(`Remove public photograph for ${product.name}?`)) return;
    setBusy(product.slug);
    try {
      const response = await fetch('/api/product-photos', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: product.slug }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not remove photo.');
      await reload();
      window.dispatchEvent(new Event('sm-product-image-updated'));
      setMessage((m) => ({ ...m, [product.slug]: 'Public photograph removed.' }));
    } catch (error) {
      setMessage((m) => ({ ...m, [product.slug]:
        error instanceof Error ? error.message : 'Could not remove photo.' }));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="wrap">
      <span className="eyebrow">OWNER / PRODUCT PHOTOGRAPHY</span>
      <h1>Product photography</h1>
      <p className="lead">Upload your final product images here. Cloud photos appear in the shop for every customer, including on mobile. JPEGs are compressed before uploading.</p>
      {configured === false && (
        <div className="card adminNote" role="status">
          <strong>Cloud setup required.</strong> Create the public
          <code> product-catalog </code> storage bucket in Supabase before uploading.
          Until then, product illustrations remain visible in the shop.
        </div>
      )}
      <div className="adminProducts">
        {products.map((product) => (
          <article className="card adminProduct" key={product.slug}>
            <div className="adminProductPreview">
              {images[product.slug] ? (
                <img src={images[product.slug]} alt={product.name} />
              ) : (
                <><span>{product.emoji}</span><small>No public photo yet</small></>
              )}
            </div>
            <div>
              <h2>{product.name}</h2>
              <p>{product.category} · <b>{money(product.price)}</b></p>
              <label className="btn small uploadBtn">
                {busy === product.slug ? 'Saving...' : images[product.slug] ? 'Replace photo' : 'Upload photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  disabled={busy !== null || configured === false}
                  onChange={(event) => {
                    void upload(product, event.target.files?.[0]);
                    event.currentTarget.value = '';
                  }} />
              </label>
              {images[product.slug] && (
                <button type="button" className="danger smallAction"
                  disabled={busy !== null} onClick={() => void remove(product)}>
                  Remove photo
                </button>
              )}
              {message[product.slug] && <p role="status">{message[product.slug]}</p>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
