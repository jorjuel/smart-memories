import ProductPersonaliser from '../../../components/ProductPersonaliser';

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    occasion?: string;
  }>;
};

export default async function PersonalisePage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { occasion } = await searchParams;

  return (
    <ProductPersonaliser
      slug={slug}
      initialOccasion={occasion}
    />
  );
}