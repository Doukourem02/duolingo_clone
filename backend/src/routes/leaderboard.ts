import { Hono } from "hono";

import { getTopTenUsers } from "../services/queries";
import { optionalAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

export const leaderboardRoute = new Hono<{ Variables: AppVariables }>().get(
  "/",
  optionalAuth,
  async (c) => {
    const userId = c.get("userId");
    const data = await getTopTenUsers(userId);
    return c.json(data);
  },
);
