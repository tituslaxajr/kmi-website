# Kapatid Ministry — Vercel + Supabase

This is the native Next.js deployment of the Kapatid Ministry public website and staff Content Desk.

## Architecture

- **Hosting:** Vercel
- **Source:** GitHub
- **Framework:** Next.js App Router
- **Authentication:** Supabase Auth magic links
- **Content:** Supabase Postgres
- **Images:** public `content-media` bucket in Supabase Storage
- **Authorization:** server-side `KMI_STAFF_EMAILS` allowlist; the Supabase service-role key never reaches the browser

The public website reads published records and retains the verified seed stories and prayer content when Supabase is unavailable. `/admin` requires both a valid Supabase session and an approved email.

## Local setup

1. Create a Supabase project.
2. Run `supabase/migrations/20260715000100_kmi_content.sql` in the Supabase SQL Editor, or apply it with the Supabase CLI.
3. Copy `.env.example` to `.env.local` and fill in the five required Supabase/staff values.
4. In Supabase Auth URL Configuration, add:
   - `http://localhost:3000/auth/callback`
   - `https://www.kapatidministry.org/auth/callback`
   - `https://kapatidministry.org/auth/callback`
5. Run `npm install`, then `npm run dev`.

Run `npm run env:check` before starting local development. It reports missing key names without printing any values.

`KMI_LOCAL_EDITOR=true` is an optional localhost convenience only. Never enable it in Vercel.

## Vercel environment variables

Add these to Development, Preview, and Production:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `KMI_STAFF_EMAILS`

Optional form endpoints can be added with `NEXT_PUBLIC_CONTACT_ENDPOINT` and `NEXT_PUBLIC_NEWSLETTER_ENDPOINT`.

## Publishing flow

Authorized staff visit `/admin`, request a magic link, write or edit content, upload a feature image, and publish. Published content appears on the corresponding public route. The editor also creates downloadable square, story, and landscape social cards.

## GitHub and Vercel

Push this repository to an empty GitHub repository with `main` as the default branch. The included GitHub Actions workflow runs install, lint, build, and architecture tests for every pull request and push to `main`.

Import the GitHub repository into Vercel as a Next.js project, add the required environment variables to Development, Preview, and Production, and deploy. Vercel's Git integration will then create preview deployments for branches and production deployments from `main`.
