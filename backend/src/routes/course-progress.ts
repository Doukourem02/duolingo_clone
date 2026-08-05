import { Hono } from "hono";

import { getCourseProgress } from "../services/queries";
import { optionalAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

export const courseProgressRoute = new Hono<{ Variables: AppVariables }>().get(
  "/",
  optionalAuth,
  async (c) => {
    const userId = c.get("userId");
    const data = await getCourseProgress(userId);
    return c.json(data);
  },
);
