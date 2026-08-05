import { Hono } from "hono";

import { ServiceError, upsertChallengeProgress } from "../services/mutations";
import { requireAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

export const challengeProgressRoute = new Hono<{ Variables: AppVariables }>().post(
  "/:challengeId",
  requireAuth,
  async (c) => {
    const userId = c.get("userId")!;
    const challengeId = Number(c.req.param("challengeId"));

    if (Number.isNaN(challengeId)) {
      return c.json({ error: "Invalid challenge id" }, 400);
    }

    try {
      const result = await upsertChallengeProgress(userId, challengeId);
      return c.json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return c.json({ error: error.message }, error.status as 400 | 404);
      }
      throw error;
    }
  },
);
