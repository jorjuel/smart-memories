import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { products } from '../../lib/products';

const occasionProducts: Record<string, string[]> = {
  Birthday: [
    'photo-mug',
    'smart-photo-slate',
    'coaster-set',
    'keyring',
    'white-t-shirt',
  ],

  Wedding: [
    'smart-photo-slate',
    'smart-memory-plaque',
    'photo-mug',
    'coaster-set',
    'keyring',
  ],

  Anniversary: [
    'smart-photo-slate',
    'smart-memory-plaque',
    'photo-mug',
    'keyring',
  ],

  Retirement: [
    'photo-mug',
    'smart-photo-slate',
    'mouse-mat',
    'keyring',
  ],

  'Leaving Gift': [
    'photo-mug',
    'mouse-mat',
    'smart-photo-slate',
    'keyring',
  ],

  'Teacher Gift': [
    'photo-mug',
    'mouse-mat',
    'coaster-set',
    'keyring',
  ],

  'Pet Memory': [
    'smart-photo-slate',
    'keyring',
    'photo-mug',
    'coaster-set',
    'mouse-mat',
  ],

  'Family Memory': [
    'smart-photo-slate',
    'photo-mug',
    'coaster-set',
    'smart-memory-plaque',
  ],

  'New Baby': [
    'smart-photo-slate',
    'photo-mug',
    'smart-memory-plaque',
    'keyring',
  ],

  Graduation: [
    'photo-mug',
    'smart-photo-slate',
    'white-t-shirt',
    'keyring',
  ],

  Christmas: [
    'photo-mug',
    'coaster-set',
    'smart-photo-slate',
    'keyring',
  ],

  'Just Because': products.map(
    (product) => product.slug
  ),
};

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{
    occasion?: string;
  }>;
}) {
  const { occasion } = await searchParams;

  const allowedProducts =
    occasion && occasionProducts[occasion]
      ? occasionProducts[occasion]
      : null;

  const filteredProducts =
    allowedProducts
      ? products.filter((product) =>
          allowedProducts.includes(
            product.slug
          )
        )
      : products;

  return (
    <section className="wrap">
      <span className="eyebrow">
        PERSONALISED NFC GIFTS
      </span>

      <h1>
        {occasion
          ? `Gifts for ${occasion}`
          : 'Shop Smart Memories'}
      </h1>

      <p className="lead">
        {occasion
          ? `We’ve selected the Smart Memories products that work especially well for ${occasion}.`
          : 'Choose a physical gift, personalise the photo, then attach a private voice memory through its permanent NFC/QR link.'}
      </p>

      {occasion && (
        <p>
          <Link href="/occasions">
            ← Choose another occasion
          </Link>
        </p>
      )}

      <div className="products">
        {filteredProducts.map(
          (product) => (
            <ProductCard
              key={product.slug}
              p={product}
              occasion={occasion}
            />
          )
        )}
      </div>
    </section>
  );
}