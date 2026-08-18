import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(apiKey);