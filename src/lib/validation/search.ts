import { z } from "zod";

export const SORTS = [
  "relevance",
  "newest",
  "price-asc",
  "price-desc",
  "best-selling",
] as const;

export const PRICE_BANDS = ["under-500", "500-1000", "1000-plus"] as const;

export const catalogueParamsSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
  genre: z.string().trim().min(1).max(100).optional().default(""),
  author: z.string().trim().min(1).max(100).optional().default(""),
  publisher: z.string().trim().min(1).max(100).optional().default(""),
  price: z.enum(PRICE_BANDS).optional(),
  type: z.enum(["MANGA", "LIGHT_NOVEL", "MERCH"]).optional(),
  sort: z.enum(SORTS).optional().default("relevance"),
  page: z.coerce.number().int().min(1).optional().default(1),
});

export type CatalogueParams = z.infer<typeof catalogueParamsSchema>;
