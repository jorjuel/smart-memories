import BundlePersonaliser from '../../../../components/BundlePersonaliser';

export default async function BundlePersonalisePage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } =
    await params;

  return (
    <BundlePersonaliser
      slug={slug}
    />
  );
}