import { Hono } from "hono";
import { logger } from "hono/logger";

import { corsMiddleware } from "./middleware/cors";
import { coursesRoute } from "./routes/courses";
import { unitsRoute } from "./routes/units";
import { userProgressRoute } from "./routes/user-progress";
import { courseProgressRoute } from "./routes/course-progress";
import { lessonsRoute } from "./routes/lessons";
import { challengeProgressRoute } from "./routes/challenge-progress";
import { subscriptionsRoute } from "./routes/subscriptions";
import { leaderboardRoute } from "./routes/leaderboard";
import { webhooksRoute } from "./routes/webhooks";
import type { AppVariables } from "./types/hono";

const app = new Hono<{ Variables: AppVariables }>();

app.use("*", logger());

// Webhooks are mounted before CORS/JSON concerns matter (Stripe calls server-to-server, no browser origin).
app.route("/webhooks", webhooksRoute);

app.use("/*", corsMiddleware);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/courses", coursesRoute);
app.route("/units", unitsRoute);
app.route("/user-progress", userProgressRoute);
app.route("/course-progress", courseProgressRoute);
app.route("/lessons", lessonsRoute);
app.route("/challenge-progress", challengeProgressRoute);
app.route("/subscriptions", subscriptionsRoute);
app.route("/leaderboard", leaderboardRoute);

app.onError((error, c) => {
  console.error(error);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
