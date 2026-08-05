import { Hono } from "hono";

import { getUnits } from "../services/queries";
import { optionalAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

export const unitsRoute = new Hono<{ Variables: AppVariables }>().get(
  "/",
  optionalAuth,
  async (c) => {
    const userId = c.get("userId");
    const data = await getUnits(userId);
    return c.json(data);
  },
);
