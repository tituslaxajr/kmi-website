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
- **Supporter responses:** private Supabase inbox for contact, newsletter, prayer, and giving responses

The public website reads published records and retains the verified seed stories and prayer content when Supabase is unavailable. `/admin` requires both a valid Supabase session and an approved email.

## Local setup

1. Create a Supabase project.
2. Run both SQL files in `supabase/migrations` in filename order, or apply them with the Supabase CLI.
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

Direct giving methods are optional. Configure verified details with `KMI_CARD_GIVING_URL`, `KMI_BANK_GIVING_DETAILS`, or `KMI_GCASH_GIVING_DETAILS`; these values stay server-side and only configured methods appear publicly. When none are configured, visitors use the private giving-response form to request current instructions, confirm a transfer, or request a receipt.

## Publishing flow

Authorized staff visit `/admin`, request a magic link, write or edit content, upload a feature image, and publish. Published content appears on the corresponding public route. The editor also creates downloadable square, story, and landscape social cards.

Contact messages, prayer responses, newsletter signups, and giving questions are delivered to the private staff inbox at `/admin/responses`. Public Supabase credentials cannot query that table.

## GitHub and Vercel

Push this repository to an empty GitHub repository with `main` as the default branch. The included GitHub Actions workflow runs install, lint, build, and architecture tests for every pull request and push to `main`.

Import the GitHub repository into Vercel as a Next.js project, add the required environment variables to Development, Preview, and Production, and deploy. Vercel's Git integration will then create preview deployments for branches and production deployments from `main`.

Before launch, run `npm run env:check`, `npm run supabase:verify`, and `npm run production:verify`. The production verifier signs in as approved staff, publishes and removes a temporary update, submits and removes a temporary public response, and checks both public rendering and the private staff inbox.

Run all three launch gates in order with `npm run launch:verify`.

`/api/health` is the deployment readiness endpoint. It returns success only when the content database and private supporter inbox—including the giving-response journey—are available. It never returns credentials or giving details.
