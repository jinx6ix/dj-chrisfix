# Remaining phases
Prompt one phase at a time. Each phase ends with: tests written, typecheck + lint + tests + build run, `PROGRESS.md` updated. Do not start the next phase until the gate passes.

**P2 Public site.** /events and /events/[slug] (timezone-aware, Event JSON-LD only for real data), /about, /videos, /gallery (lightbox, keyboard nav), /contact, editable legal pages, sitemap.xml, robots.txt, newsletter signup, Cloudflare Turnstile on forms. Gate: every route renders against seeded data; Lighthouse run recorded, not assumed.

**P3 CMS.** Editors for events, videos, gallery, pages and navigation. Media library with direct-to-storage signed uploads, MIME and size checks, alt text. Booking notes, assignment, follow-up date, CSV export. Team management (owner only), audit-log viewer, password reset, generated DB types. Gate: role-matrix test and RLS tests run with non-privileged JWTs.

**P4 Music.** Persistent player with a single audio instance and provider adapters. Visualiser driven by a real analyser node only. Hosted audio through signed URLs with range support. Gate: Playwright player test.

**P5 Social.** Provider adapters with a capability registry. OAuth with state and PKCE, AES-GCM token encryption (`TOKEN_ENCRYPTION_KEY`), connection test, refresh, reauthorize, disconnect. Composer with per-platform validation and previews. Gate: mocked-adapter tests; a real-account test only with the owner's explicit approval.

**P6 Scheduling.** `/api/cron/publish` guarded by `CRON_SECRET`. Claim due jobs with `FOR UPDATE SKIP LOCKED`, keep the unique-target idempotency guard, back off exponentially, never retry auth or validation errors. Calendar with drag-reschedule that updates the job. Notifications, approvals, optional AI caption assist. Gate: duplicate-prevention and retry-state tests.

**P7 QA.** Unit, integration and Playwright suites, axe checks, security review. **P8 Deploy.** Migrations, storage, email, OAuth apps, scheduler, production smoke tests, final delivery report.
