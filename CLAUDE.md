# DJ Platform: standing rules (read first, every session)

Product: a premium DJ website plus a secure management dashboard (mixes, events, bookings CRM, media, social planner and publisher, analytics). A real product, not mockups.
Stack: Next.js 15 App Router, TypeScript strict, Tailwind v4, Supabase (Postgres, Auth, Storage), Vercel. Zod on all input. Add a dependency only with a reason.

## Non-negotiables
1. Never fake it. No mock APIs, hardcoded metrics, simulated uploads or publishes. A source that is not connected shows "Connect X" or "Data unavailable". Demo data only through an explicit dev seed.
2. Never report "published" until the platform confirms. Unsupported operations are labelled manual or draft.
3. Authorize on the server (`requireRole`) and with RLS on every table. Hiding a button is not security. No public sign-up grants roles.
4. Secrets live in env only. Social tokens are encrypted at rest in service-role-only tables and never logged or sent to the client. Never commit `.env*`.
5. Validate every input and every URL: https only, embed hosts allow-listed, never fetch user-supplied URLs.
6. Publishing is a persisted queue with an authenticated scheduler, an idempotency key and backoff. No timers, tab state or in-memory state.
7. Design: tokens in `globals.css`; glass only on cards, nav and dialogs with a solid fallback; honour reduced motion; target WCAG 2.2 AA.
8. Do not claim done without running `npm run typecheck`, lint, tests and `npm run build`. State what is unverified.

## Workflow
One phase at a time from `docs/PHASES.md`. Build vertical slices (dashboard form, database, public page, test). Update `PROGRESS.md` and commit after each slice. Verify platform API details against current official docs before coding an adapter.
