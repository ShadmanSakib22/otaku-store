import {
  catalogueParamsSchema,
  parsePriceRange,
  type CatalogueParams,
} from "@/lib/validation/search";

export type { CatalogueParams };
export { parsePriceRange };

export const FILTER_KEYS = ["q", "genre", "author", "publisher", "language", "size", "color", "price", "type", "sort"] as const;

export function parseCatalogueParams(
  searchParams: Record<string, string | string[] | undefined>
): CatalogueParams {
  const flat: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") flat[key] = value;
    else if (Array.isArray(value) && value.length > 0) flat[key] = value[0];
  }
  return catalogueParamsSchema.parse(flat);
}

export function buildCatalogueUrl(
  base: string,
  params: Partial<CatalogueParams>,
  overrides: Partial<CatalogueParams>
): string {
  const filterChanged = (FILTER_KEYS as readonly string[]).some(
    (key) => {
      const override = overrides[key as keyof CatalogueParams];
      return (
        override !== undefined &&
        override !== "" &&
        override !== params[key as keyof CatalogueParams]
      );
    }
  );

  let page = overrides.page ?? params.page ?? 1;
  if (filterChanged) page = 1;

  const merged: Record<string, string> = {
    q: overrides.q ?? params.q ?? "",
    genre: overrides.genre ?? params.genre ?? "",
    author: overrides.author ?? params.author ?? "",
    publisher: overrides.publisher ?? params.publisher ?? "",
    language: overrides.language ?? params.language ?? "",
    size: overrides.size ?? params.size ?? "",
    color: overrides.color ?? params.color ?? "",
    type: overrides.type ?? params.type ?? "",
    price:
      Object.prototype.hasOwnProperty.call(overrides, "price") &&
      overrides.price === undefined
        ? ""
        : overrides.price ?? params.price ?? "",
    sort: overrides.sort ?? params.sort ?? "relevance",
  };

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (key === "sort" && value === "relevance") continue;
    if (value) query.set(key, value);
  }
  if (page > 1 || filterChanged) query.set("page", String(page));

  const qs = query.toString();
  return qs ? `${base}?${qs}` : base;
}