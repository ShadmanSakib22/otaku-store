import { PagePlaceholder } from "@/components/ui";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <PagePlaceholder
      title="Product"
      description={`Product page for "${slug}".`}
    />
  );
}