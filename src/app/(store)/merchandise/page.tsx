import CategoryPage from "../category-page";

export default async function MerchandisePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return CategoryPage({
    base: "/merchandise",
    categorySlug: "merchandise",
    title: "Merchandise",
    type: "MERCH",
    searchParams,
  });
}