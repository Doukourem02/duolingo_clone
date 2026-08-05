import { Hono } from "hono";

import { getLesson, getLessonPercentage } from "../services/queries";
import { optionalAuth } from "../middleware/auth";
import type { AppVariables } from "../types/hono";

export const lessonsRoute = new Hono<{ Variables: AppVariables }>()
  .get("/percentage", optionalAuth, async (c) => {
    const userId = c.get("userId");
    const data = await getLessonPercentage(userId);
    return c.json({ percentage: data });
  })
  .get("/", optionalAuth, async (c) => {
    const userId = c.get("userId");
    const idParam = c.req.query("id");
    const id = idParam ? Number(idParam) : undefined;

    if (idParam && Number.isNaN(id)) {
      return c.json({ error: "Invalid lesson id" }, 400);
    }

    const data = await getLesson(userId, id);
    return c.json(data);
  });
