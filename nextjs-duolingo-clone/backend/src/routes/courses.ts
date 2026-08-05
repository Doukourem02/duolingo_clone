import { Hono } from "hono";

import { getCourseById, getCourses } from "../services/queries";
import type { AppVariables } from "../types/hono";

export const coursesRoute = new Hono<{ Variables: AppVariables }>()
  .get("/", async (c) => {
    const data = await getCourses();
    return c.json(data);
  })
  .get("/:courseId", async (c) => {
    const courseId = Number(c.req.param("courseId"));

    if (Number.isNaN(courseId)) {
      return c.json({ error: "Invalid course id" }, 400);
    }

    const data = await getCourseById(courseId);

    if (!data) {
      return c.json({ error: "Course not found" }, 404);
    }

    return c.json(data);
  });
