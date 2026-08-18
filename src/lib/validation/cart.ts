import { z } from "zod";

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const cartSchema = z.object({
  items: z.array(cartItemSchema).min(1),
});

export type CartInput = z.infer<typeof cartSchema>;
