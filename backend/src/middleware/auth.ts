import { createMiddleware } from "hono/factory";

import { verifyBearerToken } from "../lib/clerk";
import type { AppVariables } from "../types/hono";

const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.slice("Bearer ".length);
};

export const optionalAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const token = extractToken(c.req.header("Authorization"));
  const userId = token ? await verifyBearerToken(token) : null;

  c.set("userId", userId);
  await next();
});

export const requireAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  const token = extractToken(c.req.header("Authorization"));
  const userId = token ? await verifyBearerToken(token) : null;

  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId", userId);
  await next();
});
