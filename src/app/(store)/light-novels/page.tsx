import CategoryPage from "../category-page";

export default async function LightNovelsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return CategoryPage({
    base: "/light-novels",
    categorySlug: "light-novels",
    title: "Light Novels",
    type: "LIGHT_NOVEL",
    searchParams,
  });
}