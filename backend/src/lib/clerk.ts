import { createClerkClient, verifyToken } from "@clerk/backend";

import { env } from "../env";

export const clerkClient = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
});

export const verifyBearerToken = async (token: string): Promise<string | null> => {
  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    return payload.sub ?? null;
  } catch {
    return null;
  }
};
