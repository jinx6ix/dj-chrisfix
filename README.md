# DJ Platform
Premium DJ website plus management dashboard. Next.js 15 (App Router), Supabase, Tailwind v4.
Read `CLAUDE.md` (standing rules), `PROGRESS.md` (status) and `docs/PHASES.md` (what to build next, one phase per prompt).

## Run locally
1. `cp .env.example .env.local` and fill in the Supabase values. Other variables are optional or reserved for later phases.
2. Create a Supabase project and apply `supabase/migrations/0001_init.sql` (SQL editor or `supabase db push`).
3. In Supabase > Authentication > Users, add yourself with email and password, then run in the SQL editor:
   `insert into memberships (user_id, role) select id, 'owner' from auth.users where email = 'you@example.com';`
   There is no public sign-up. Add staff the same way until the team UI exists (P3).
4. `npm install && npm run dev`, then open http://localhost:3000. The dashboard is at /login.
5. In /dashboard/settings set the artist name, then add a mix at /dashboard/mixes using a SoundCloud, Mixcloud or YouTube https link.

## Deploy
Import the repo into Vercel, add the same environment variables and set `NEXT_PUBLIC_SITE_URL`. Scheduled publishing (P6) needs a scheduler that can fire every minute: check what your Vercel plan allows, otherwise use an external scheduler.

## External approvals (start early; requirements change, so check each platform's docs)
Meta app review and business verification (Instagram, Facebook Pages), TikTok Content Posting API audit, YouTube API compliance audit, X API access tier, LinkedIn product access. SoundCloud, Mixcloud and Spotify are embeds and links only unless their APIs grant more.

## Status
Only what `PROGRESS.md` marks built exists. Nothing has been tested against live Supabase, email or social accounts.
