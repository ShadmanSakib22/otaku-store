import { z } from "zod";

export const SORTS = [
  "relevance",
  "newest",
  "price-asc",
  "price-desc",
  "best-selling",
] as const;

export const catalogueParamsSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  genre: z.string().trim().min(1).max(100).optional().default(""),
  author: z.string().trim().min(1).max(100).optional().default(""),
  publisher: z.string().trim().min(1).max(100).optional().default(""),
  language: z.string().trim().min(1).max(100).optional().default(""),
  size: z.string().trim().min(1).max(100).optional().default(""),
  color: z.string().trim().min(1).max(100).optional().default(""),
  price: z.string().trim().optional().default(""),
  type: z.enum(["MANGA", "LIGHT_NOVEL", "MERCH"]).optional(),
  sort: z.enum(SORTS).optional().default("relevance"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type CatalogueParams = z.infer<typeof catalogueParamsSchema>;

export function parsePriceRange(price: string): { min?: number; max?: number } {
  if (!price) return {};
  const [minStr, maxStr] = price.split("-");
  const min = minStr ? Number(minStr) : undefined;
  const max = maxStr ? Number(maxStr) : undefined;
  return {
    min: Number.isFinite(min) ? min : undefined,
    max: Number.isFinite(max) ? max : undefined,
  };
}
