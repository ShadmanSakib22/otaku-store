import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
});

export const productVariantFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(100),
  sku: z.string().trim().min(1).max(100),
  price: z.coerce.number().positive(),
  size: z.string().trim().max(20).optional().default(""),
  color: z.string().trim().max(30).optional().default(""),
  stock: z.coerce.number().int().min(0),
  lowStockAt: z.coerce.number().int().min(0),
});

export const productFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: z.enum(["MANGA", "LIGHT_NOVEL", "MERCH"]),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]),
  summary: z.string().trim().max(300).optional().default(""),
  description: z.string().trim().min(1),
  categoryId: z.string().min(1),
  publisherId: z.string().optional().default(""),
  releaseDate: z.string().optional().default(""),
  genres: z.array(z.string()),
  authors: z.array(z.string()),
  imageUrls: z.array(z.string()),
  variants: z.array(productVariantFormSchema).min(1),
  volume: z.coerce.number().int().min(1).optional(),
  isbn: z.string().trim().max(20).optional().default(""),
  language: z.string().trim().max(30).optional().default("Japanese"),
  pageCount: z.coerce.number().int().min(1).optional(),
});

export const heroSlideFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  subtitle: z.string().trim().max(300).optional().default(""),
  imageUrl: z.string().min(1),
  ctaText: z.string().trim().max(60).optional().default(""),
  ctaUrl: z.string().trim().max(200).optional().default(""),
  position: z.coerce.number().int().min(0),
  isActive: z.boolean(),
  startsAt: z.string().optional().default(""),
  endsAt: z.string().optional().default(""),
});
