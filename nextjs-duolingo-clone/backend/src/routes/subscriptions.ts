import { Hono } from "hono";

import { getUserSubscription } from "../services/queries";
import { createStripeCheckoutUrl, ServiceError } from "../services/mutations";
import { optionalAuth, requireAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

export const subscriptionsRoute = new Hono<{ Variables: AppVariables }>()
  .get("/me", optionalAuth, async (c) => {
    const userId = c.get("userId");
    const data = await getUserSubscription(userId);
    return c.json(data);
  })
  .post("/checkout-url", requireAuth, async (c) => {
    const userId = c.get("userId")!;

    try {
      const url = await createStripeCheckoutUrl(userId);
      return c.json({ data: url });
    } catch (error) {
      if (error instanceof ServiceError) {
        return c.json({ error: error.message }, error.status as 400 | 404);
      }
      throw error;
    }
  });
