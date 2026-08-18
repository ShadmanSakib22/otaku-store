import { z } from "zod";

const termsSchema = z.literal(true, {
  error: "You must accept the terms to continue.",
});

export const cashCheckoutSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(30),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, {
      message: "Enter a valid email address.",
    })
    .optional()
    .default(""),
  termsAccepted: termsSchema,
});

export const shippingAddressSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  address1: z.string().trim().min(1).max(200),
  address2: z.string().trim().max(200).optional().default(""),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  country: z.string().trim().min(2).max(2),
  phone: z.string().trim().min(1).max(30),
});

export const stripeCheckoutSchema = z.object({
  customerName: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(1).max(30),
  termsAccepted: termsSchema,
  shippingAddress: shippingAddressSchema,
});

export type CashCheckoutInput = z.infer<typeof cashCheckoutSchema>;
export type StripeCheckoutInput = z.infer<typeof stripeCheckoutSchema>;
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
