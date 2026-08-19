import { NextRequest } from "next/server";
import { verifyWebhookSignature, handleCheckoutSessionCompleted } from "@/lib/stripe/webhook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = verifyWebhookSignature(rawBody, signature);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as { id: string };
    const result = await handleCheckoutSessionCompleted(session.id);
    if (result && !result.processed && result.reason === "no_payment") {
      return Response.json(
        { error: "No payment record found for session" },
        { status: 500 }
      );
    }
  }

  return Response.json({ received: true }, { status: 200 });
}