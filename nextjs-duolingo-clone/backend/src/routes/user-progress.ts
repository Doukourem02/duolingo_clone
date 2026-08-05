import { Hono } from "hono";
import { z } from "zod";

import { getUserProgress } from "../services/queries";
import { reduceHearts, refillHearts, ServiceError, upsertUserProgress } from "../services/mutations";
import { optionalAuth, requireAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

const upsertBodySchema = z.object({ courseId: z.number().int() });
const heartsBodySchema = z.object({ challengeId: z.number().int() });

export const userProgressRoute = new Hono<{ Variables: AppVariables }>()
  .get("/", optionalAuth, async (c) => {
    const userId = c.get("userId");
    const data = userId ? await getUserProgress(userId) : null;
    return c.json(data);
  })
  .post("/", requireAuth, async (c) => {
    const userId = c.get("userId")!;
    const parsed = upsertBodySchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid body" }, 400);
    }

    try {
      await upsertUserProgress(userId, parsed.data.courseId);
      return c.json({ ok: true });
    } catch (error) {
      if (error instanceof ServiceError) {
        return c.json({ error: error.message }, error.status as 400 | 404);
      }
      throw error;
    }
  })
  .patch("/hearts/reduce", requireAuth, async (c) => {
    const userId = c.get("userId")!;
    const parsed = heartsBodySchema.safeParse(await c.req.json());

    if (!parsed.success) {
      return c.json({ error: "Invalid body" }, 400);
    }

    try {
      const result = await reduceHearts(userId, parsed.data.challengeId);
      return c.json(result);
    } catch (error) {
      if (error instanceof ServiceError) {
        return c.json({ error: error.message }, error.status as 400 | 404);
      }
      throw error;
    }
  })
  .patch("/hearts/refill", requireAuth, async (c) => {
    const userId = c.get("userId")!;

    try {
      await refillHearts(userId);
      return c.json({ ok: true });
    } catch (error) {
      if (error instanceof ServiceError) {
        return c.json({ error: error.message }, error.status as 400 | 404);
      }
      throw error;
    }
  });
