import { PagePlaceholder } from "@/components/ui";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";

  return (
    <PagePlaceholder
      title="Search"
      description={`Search results for "${query}".`}
    />
  );
}