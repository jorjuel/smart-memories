import { redirect } from 'next/navigation';

/**
 * Legacy Shop links now enter the unified memory-first creator.
 * Preserve occasion links so the relevant gift add-ons appear after saving.
 * Deep links such as /shop/[slug] continue to work independently.
 */
export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string }>;
}) {
  const params = await searchParams;
  const occasion = typeof params.occasion === 'string'
    ? params.occasion.trim()
    : '';
  redirect(occasion
    ? `/create?occasion=${encodeURIComponent(occasion)}`
    : '/create'
  );
}
