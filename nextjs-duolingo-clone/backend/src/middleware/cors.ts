import { cors } from "hono/cors";

import { env } from "../env";

const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

export const corsMiddleware = cors({
  origin: allowedOrigins,
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
});
