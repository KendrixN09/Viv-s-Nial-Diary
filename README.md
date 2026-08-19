# Viv's Nail Diary

A full-screen interactive Y2K composition-notebook booking site for a Kennesaw-based nail tech. Real Supabase-backed appointment requests (pending → admin accept/decline), a password-protected admin dashboard for availability/portfolio/policies/pricing management, and one-tap call/text/Instagram-DM links so Viv contacts clients herself rather than automatic SMS.

## 1. Create your accounts (you do this — Claude can't create accounts on your behalf)

- **Supabase**: https://supabase.com → New project
- **Vercel**: https://vercel.com → sign up (GitHub login is easiest)

Twilio and Google Cloud are optional and not part of the current flow at all — see the note at the bottom of this file.

## 2. Set up the database

In your Supabase project: **SQL Editor → New query**, paste the entire contents of `supabase/schema.sql`, run it. This creates the `appointments`, `availability_slots`, `blocked_days`, `portfolio_images`, and `site_content` tables, and seeds the policies/pricing text extracted from Viv's reference images plus 8 placeholder portfolio images.

Then create two **public** storage buckets (**Storage → New bucket**, toggle **Public bucket** on for each):
- `portfolio-images` — real nail photos uploaded via the admin Portfolio Manager
- `inspiration-photos` — client-uploaded inspo pics from the booking form

Grab your keys from **Project Settings → API**:
- `SUPABASE_URL` = the Project URL
- `SUPABASE_SERVICE_ROLE_KEY` = the `service_role` secret key (never the `anon` key)

## 3. Set your admin login

Pick `ADMIN_PASSWORD` and generate a random `ADMIN_SESSION_SECRET` (e.g. `openssl rand -hex 32`). **On Vercel specifically, `ADMIN_SESSION_SECRET` must be added with the "Sensitive" toggle turned OFF** — it's read inside `middleware.ts`, which Next.js always runs on the Edge runtime, and Vercel's Sensitive variables aren't readable there. (`ADMIN_PASSWORD` is fine as Sensitive — it's only read in a normal server route.)

## 4. Push this to GitHub, then import to Vercel

```bash
cd vivs-nail-diary
git init
git add .
git commit -m "Initial build"
```

Create an empty GitHub repo, then:

```bash
git remote add origin <your-repo-url>
git push -u origin main
```

In Vercel: **Add New → Project** → import that repo. Before the first deploy, add every variable from `.env.example` (Project → Settings → Environment Variables) — remembering the Sensitive-toggle note above for `ADMIN_SESSION_SECRET`. Deploy.

## 5. Custom domain (optional)

Vercel → project → **Settings → Domains** → add your domain, or buy one directly through Vercel's domain search in that same tab.

## Using the admin dashboard

Go to `https://<your-domain>/admin` (also linked as a small "admin" link at the bottom of the public site), log in with `ADMIN_PASSWORD`.

- **Home** — this month's appointments, confirmed/pending/declined counts, upcoming, today, unique clients
- **Pending Requests** — every request waiting on a decision, with tap-to-call, tap-to-text, and Instagram-DM buttons so Viv can reach out and confirm details herself before deciding; click the inspo photo to enlarge; Accept confirms the slot + auto-declines any other pending request for that same slot (and syncs Google Calendar if it's ever turned on); Decline frees nothing (the slot was never locked by a pending request in the first place). No text message is ever sent automatically — decided requests stay on the page with a "Mark as contacted" toggle so Viv can track who she's already messaged
- **Calendar** — Confirmed/Declined tabs; Confirmed shows a month grid (click a day's appointment for full details), Declined shows a simple list; both open the same detail view with call/text/DM buttons and the contacted toggle
- **Availability** — open specific day/time slots, block an entire day, remove a not-yet-booked slot (booked ones are locked from removal)
- **Portfolio** — upload/replace/delete/reorder/hide the 8 photos shown on the public gallery; changes are live immediately
- **Policies** — individually add/edit/reorder/delete the policy lines shown on the public Notices page, no code changes needed
- **Pricing** — individually add/edit/reorder/delete price list items, no code changes needed
- **Settings** — Instagram handle/link, "Kennesaw Based" text, and booking instructions shown on the public site

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values above
npm run dev
```

## Notes on what's seeded vs. what needs Viv's real content

- The 8 portfolio slots start out as illustrated placeholder SVGs (not real photos) labeled with what should go there — replace them via **Admin → Portfolio** with Viv's actual nail photos.
- Policies/pricing are seeded from the reference images provided, with one flagged discrepancy already resolved by making pricing admin-editable: the "Price List" image framed full sets as a monthly-rotating deal (July $40 / August $50) while the "Notice" policy image stated a flat "$50 all full sets." The seed uses the flat $50 — correct it in **Admin → Pricing** if the real current price differs.
