import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  STRIPE_API_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  ALLOWED_ORIGINS: z.string().min(1),
  WEB_APP_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
});

export const env = envSchema.parse(process.env);
