import ProductPersonaliser from '../../../components/ProductPersonaliser';

export default async function PersonalisePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  return (
    <ProductPersonaliser
      slug={slug}
    />
  );
}