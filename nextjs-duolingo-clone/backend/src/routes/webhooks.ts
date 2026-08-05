import { Hono } from "hono";
import type Stripe from "stripe";

import { stripe } from "../lib/stripe";
import { env } from "../env";
import { handleStripeCheckoutCompleted, handleStripeInvoicePaymentSucceeded } from "../services/mutations";
import type { AppVariables } from "../types/hono";

export const webhooksRoute = new Hono<{ Variables: AppVariables }>().post("/stripe", async (c) => {
  const body = await c.req.text();
  const signature = c.req.header("stripe-signature");

  if (!signature) {
    return c.json({ error: "Missing Stripe-Signature header" }, 400);
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    return c.text(`Webhook error: ${message}`, 400);
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    await handleStripeCheckoutCompleted({
      subscription: session.subscription as string,
      metadata: session.metadata,
    });
  }

  if (event.type === "invoice.payment_succeeded") {
    await handleStripeInvoicePaymentSucceeded({
      subscription: session.subscription as string,
    });
  }

  return c.body(null, 200);
});
