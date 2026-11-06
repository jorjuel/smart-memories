import SlateSinglePageCustomiser from '../../../components/SlateSinglePageCustomiser';
import ProductPersonaliser from '../../../components/ProductPersonaliser';

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    occasion?: string;
    draft?: string;
  }>;
};

export default async function PersonalisePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { occasion, draft } = await searchParams;

  if (slug === 'smart-photo-slate') return <SlateSinglePageCustomiser initialOccasion={occasion} />;

  return (
    <ProductPersonaliser
      slug={slug}
      initialOccasion={occasion}
      draftId={draft}
    />
  );
}