# backend

Shared REST API for `nextjs-duolingo-clone` (web) and `Baro` (mobile). Hono + Drizzle ORM, same Postgres database and Clerk project as the web app.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, CLERK_SECRET_KEY, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET
npm run db:push         # verify schema matches the shared database (should be a no-op)
npm run dev
```

## Auth

Clients send `Authorization: Bearer <clerk-session-token>`. Routes are either:
- **public** — no auth check (course catalog)
- **optional auth** — works signed-out, returns `null`/`[]` (mirrors the web app's previous behavior)
- **required auth** — 401 without a valid token

## Routes

See `src/app.ts` for the full mount list: `/courses`, `/units`, `/user-progress`, `/course-progress`, `/lessons`, `/challenge-progress`, `/subscriptions`, `/leaderboard`, `/webhooks/stripe`.
