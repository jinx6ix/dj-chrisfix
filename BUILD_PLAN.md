# Build Plan: DJ Platform & Management Dashboard

This document outlines the master build plan for completing the DJ Platform (`dj-platform`), structured across Phases P2 through P8 as defined in `docs/PHASES.md` and `CLAUDE.md`.

## Architecture Summary

- **Framework & Stack**: Next.js 15 App Router, TypeScript (strict), Tailwind CSS v4, Framer Motion, Zod validation.
- **Database & Auth**: Supabase PostgreSQL with robust Row Level Security (RLS), custom role-based access control (`owner`, `editor`, `social_manager`, `booking_manager`), and Supabase Auth.
- **Security & Reliability**: CSP headers, secure server actions, rate-limiting on public forms with bot honeypots, parameterized queries, and strict input validation.

---

## Foundation & Design System Status (Completed & Verified)
- [x] Next.js 15 App Router setup & configuration.
- [x] Tailwind CSS v4 design tokens (`globals.css`), glassmorphism, responsive container layouts, interactive hover/focus states, and accessibility (`prefers-reduced-motion`).
- [x] **Global Visual Design System**: Midnight-black and graphite theme with amber-orange accents, violet ambient lighting, translucent glassmorphism cards, backdrop blur, subtle borders, shadows, and smooth transitions.
- [x] **Reusable Design System Components**:
  - `GlassCard`: Card with subtle border illumination and hover lift (`src/components/glass-card.tsx`)
  - `GlassIcon`: Lucide icon wrapper with glowing ambient background (`src/components/glass-icon.tsx`)
  - `AnimatedButton`: Spring-press feedback button with amber/violet/ghost variants (`src/components/animated-button.tsx`)
  - `SkeletonCard`: Shimmer loading placeholder (`src/components/skeleton-card.tsx`)
  - `AudioEqualizerLoader`: Animated visualizer bars representing audio playback (`src/components/audio-equalizer-loader.tsx`)
  - `LoadingSpinner`: Smooth spinning loading indicator (`src/components/loading-spinner.tsx`)
- [x] Design System Preview page at `/design-system` demonstrating all components on desktop and mobile.
- [x] **Public DJ Homepage for DJ ChrisFix**: Full-screen artist hero, DJ bio, prominent CTA buttons, featured mixes, upcoming events, latest videos, artist stats introduction, gallery preview, official channels, and complete footer.
- [x] **Complete DJ Music Library & Persistent Audio Player (P4)**:
  - `/mixes` with search, genre filters, featured mixes, artwork, release dates, and duration.
  - `/mixes/[slug]` with mix details, cover art, tracklist with timestamps, related mixes, and authorized SoundCloud/Mixcloud embed support or direct audio.
  - Persistent global audio mini-player (`AudioProvider`, `PersistentPlayer`) with play, pause, progress scrubbing, seeking, volume controls, and track metadata that stays active across page navigations.
- [x] Public pages: Bookings (`/bookings`).
- [x] Dashboard administration: Overview, Mixes management, Booking inquiries workflow, and Artist profile settings.
- [x] Verified clean execution of `npm run build` (production build successful with 0 errors).

---

## Recommended Implementation Order (Build Checklist)

### Phase P2: Public Site & SEO
- [x] Implement public DJ homepage for **DJ ChrisFix** with full-screen hero, featured mixes, upcoming events, latest videos, bio, gallery preview, and footer.
- [x] Implement `/events` and `/events/[slug]` with upcoming/past event filters, featured showcases, ticket links, timezone-aware dates, SEO metadata, and Supabase integration.
- [x] Implement additional public pages (`/about`, `/videos`, `/gallery`, `/contact`).
- [ ] Generate dynamic `sitemap.xml` and `robots.txt`, JSON-LD schema markup, newsletter signup, and Turnstile integration.

### Phase P3: CMS & Management Dashboards
- [x] Implement dashboard mixes CRUD views.
- [ ] Implement dashboard views for Events, Videos, and Gallery.
- [ ] Build Media Library interface with signed direct uploads and validation.
- [ ] Upgrade Booking CRM with internal notes, status workflows, follow-up dates, and CSV export.
- [ ] Add Team management UI (owner role) and audit log viewer.
- [ ] Generate Supabase TypeScript definitions.

### Phase P4: Global Audio Player & Hosted Audio
- [x] Build persistent bottom/floating audio player supporting continuous playback across page navigations.
- [x] Implement complete music library (`/mixes` and `/mixes/[slug]`) with tracklist timestamps, search, genre filtering, and authorized embeds/direct audio.

### Phase P5: Social Media Integration & Composer
- [ ] Implement secure OAuth connection flows and AES-GCM token encryption.
- [ ] Build Social Accounts dashboard (`/dashboard/social`) with connection status and test hooks.
- [ ] Build Post Composer with platform-specific character limits and media attachments.

### Phase P6: Publishing Scheduler & Automation
- [ ] Build `/api/cron/publish` endpoint with `CRON_SECRET` authentication and atomic locking (`FOR UPDATE SKIP LOCKED`).
- [ ] Build scheduling calendar view with reschedule capabilities.
- [ ] Implement notifications and optional AI caption generator.

### Phase P7: Testing & Quality Assurance
- [ ] Set up unit and integration test suites.
- [ ] Write Playwright E2E tests covering public navigation, booking flow, and dashboard CRUD.
- [ ] Perform accessibility (axe) and security audits.

### Phase P8: Production Deployment & Smoke Tests
- [x] Configure Vercel project, environment variables (`.env`), and production Supabase instance.
- [x] Run final build checks (`npm run typecheck`, lint, tests, `npm run build`).
- [x] Created development database seed (`npm run db:seed`).
