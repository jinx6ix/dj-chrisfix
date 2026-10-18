# Production Readiness & Deployment Guide

This document outlines the end-to-end production deployment and configuration guide for **DJ ChrisFix** (DJ Platform).

---

## 1. Prerequisites & Infrastructure Setup

1. **Supabase Project**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to **SQL Editor** and run the complete initialization migration located at `supabase/migrations/0001_init.sql`. This sets up all database tables, Row Level Security (RLS) policies, and custom role functions (`has_role`).
   - Configure **Authentication**: Enable Email/Password authentication.
   - Create the initial Owner user in Supabase Authentication, then grant owner membership by running:
     ```sql
     insert into memberships (user_id, role)
     select id, 'owner' from auth.users where email = 'your-email@example.com';
     ```
   - Set up Supabase Storage buckets for media uploads (`media` or similar).

2. **Vercel Project**:
   - Import the repository into Vercel.
   - Configure the root directory and build settings (`npm run build`).

---

## 2. Environment Variables Configuration

Set the following environment variables in Vercel (**Settings > Environment Variables**) and in your local `.env.local` (copied from `.env.example`):

| Variable | Required | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | Public production URL (e.g., `https://dj-chrisfix.com`) used for canonical URLs, Open Graph metadata, and sitemaps. |
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase Project URL (`https://xyz.supabase.co`). Found in Supabase Project Settings > API. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase Anonymous / Public API Key. Found in Supabase Project Settings > API. |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes** | Supabase Service Role Key (**Secret**). Bypasses RLS for server-side admin operations, secure uploads, and cron processing. |
| `RATE_LIMIT_SALT` | **Yes** | Long random secret string used to salt hashed visitor IPs for booking form rate limiting. |
| `RESEND_API_KEY` | Recommended | API key from [Resend](https://resend.com) for sending booking inquiry notification emails. |
| `EMAIL_FROM` | Recommended | Verified sender address (e.g., `DJ ChrisFix Bookings <bookings@dj-chrisfix.com>`). |
| `BOOKING_NOTIFY_EMAIL` | Recommended | Email address receiving new booking inquiries. |
| `TOKEN_ENCRYPTION_KEY` | **Yes** (for socials) | 32-byte base64 key used for AES-GCM encryption of OAuth social platform tokens at rest. |
| `CRON_SECRET` | Recommended | Bearer token secret securing `/api/cron/publish` against unauthorized triggers. |
| `AI_API_KEY` | Recommended | Groq API key (`gsk_...`) for the AI Promotional Content Generator (`/dashboard/ai`). |
| `GA4_MEASUREMENT_ID` | Optional | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`). |
| *Social OAuth Keys* | Optional | `META_APP_ID`, `META_APP_SECRET`, `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `X_CLIENT_ID`, `X_CLIENT_SECRET`, etc. for social integrations. |

---

## 3. Scheduled Jobs & Cron Configuration

The platform includes a robust publishing scheduler at `/api/cron/publish` supporting idempotent job claiming, exponential backoff, and retry handling.

- **Vercel Cron / External Scheduler Setup**:
  Configure Vercel Cron in `vercel.json` or your external scheduler (e.g., GitHub Actions, EasyCron) to trigger every minute:
  ```json
  {
    "crons": [
      {
        "path": "/api/cron/publish",
        "schedule": "* * * * *"
      }
    ]
  }
  ```
- **Authorization Header**:
  When invoking the cron endpoint externally, include the bearer token header:
  `Authorization: Bearer <CRON_SECRET>`

---

## 4. Production Smoke Tests

After deploying to Vercel and configuring environment variables, perform the following smoke tests:

1. **Public Website Verification**:
   - Open `https://your-domain.com` and verify hero, bio, mixes, upcoming tour events, videos, gallery, and footer render correctly.
   - Navigate to `/mixes` and test audio playback using the persistent mini-player.
   - Navigate to `/events` and check timezone-aware dates and ticket links.
   - Verify dynamic sitemap at `/sitemap.xml` and crawling rules at `/robots.txt`.
   - Test a non-existent URL and verify the custom 404 error recovery page (`/not-found`).

2. **Authentication & Dashboard Verification**:
   - Navigate to `/login`, sign in with your staff credentials.
   - Verify `requireRole` server guards redirect unauthorized users.
   - Check Overview metrics at `/dashboard` displaying real database counts.

3. **Database Operations & CRM**:
   - Submit a test booking inquiry via `/bookings`. Verify rate limiting and database insertion.
   - Manage booking inquiries in `/dashboard/bookings`.
   - Create/publish a test mix and event in `/dashboard/mixes` and `/dashboard/events`.

4. **Integrations Verification**:
   - Test Supabase storage uploads in `/dashboard/media` (50MB limit, MIME validation).
   - Test AI promotional caption generation in `/dashboard/ai` (Groq Llama 3.3 70B).
   - Check real metrics in `/dashboard/analytics`.

---

## 5. Production Readiness Checklist

- [x] TypeScript strict compilation (`npm run build` passes with 0 errors).
- [x] Database schema & RLS policies applied via Supabase migrations.
- [x] Server-side role authorization (`requireRole`) on all dashboard routes and server actions.
- [x] AES-GCM token encryption for social OAuth credentials in service-role-only storage.
- [x] Idempotent publishing queue scheduler (`/api/cron/publish`).
- [x] Zod validation on all user inputs, booking forms, and API routes.
- [x] WCAG 2.2 AA accessibility and responsive glassmorphism design system.
- [x] SEO metadata, Open Graph tags, XML sitemaps, and robots rules configured.
- [x] Zero hardcoded mock metrics or simulated data without explicit database backing.
