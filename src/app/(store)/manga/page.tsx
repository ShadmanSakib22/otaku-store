import CategoryPage from "../category-page";

export default async function MangaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return CategoryPage({
    base: "/manga",
    categorySlug: "manga",
    title: "Manga",
    type: "MANGA",
    searchParams,
  });
}