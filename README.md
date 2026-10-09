# Poverty Killers FX

Lead-generation site for Poverty Killers FX (PKFX): a landing page, qualification form, Calendly booking step, and a private admin dashboard.

The funnel is:

1. Landing page
2. Video walkthrough
3. Testimonials and offer
4. **Get My Market Scanner + Free Course**
5. Qualification form (`/apply` or the reserve-spot modal)
6. Lead saved to the database
7. Booking page (`/book-call`) with the Calendly embed
8. After a time is booked, redirect to the PKFX Telegram channel
9. Admin dashboard (`/admin`)

Landing-page buttons never send someone straight to Calendly. The booking page only opens after a valid application.

## Run locally

```bash
cp .env.example .env.local
# Edit .env.local and set ADMIN_EMAIL, ADMIN_PASSWORD, and SESSION_SECRET
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production:

```bash
npm run build
npm start
```

With `SUPABASE_URL` and `SUPABASE_ANON_KEY` set, leads are stored in Supabase and the app can run on a serverless host. Without those variables it falls back to a local SQLite file, which needs a persistent disk.

## Netlify

This app is at the **repository root**. `package.json`, `package-lock.json`, and `next.config.ts` are not inside a subfolder. In Netlify:

1. Leave **Base directory** blank.
2. Build command: `npm run build` (from `netlify.toml`; do not use a bare `next build`).
3. Publish directory: `.next`
4. Deploy the branch that contains this app. `main` currently only has a README, so production must use this branch until the pull request is merged.
5. Set these environment variables (Site configuration → Environment variables), then redeploy:

| Variable | Purpose |
| --- | --- |
| `SITE_URL` | Public https origin, e.g. `https://your-site.netlify.app` |
| `SUPABASE_URL` | `https://YOUR-PROJECT.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon / publishable key (not the service role secret) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin login password (12+ characters) |
| `SESSION_SECRET` | Random string, at least 32 characters |

Do not put secrets in git. After the first deploy, point `SITE_URL` at your real domain.

The reserve form also needs `SUPABASE_URL` and `SUPABASE_ANON_KEY` on Netlify. Admin login can succeed without them; form submit cannot. After adding variables, trigger a new deploy.

`ADMIN_EMAIL` must match a confirmed Supabase Auth user with `ADMIN_PASSWORD`, and that email must be in `public.admin_emails`. You can run [`supabase/ensure-admin.sql`](supabase/ensure-admin.sql) in the SQL editor.

## Configuration

Edit [`src/config/site.ts`](src/config/site.ts). Environment variables override those values.

| What | Config field | Environment variable |
| --- | --- | --- |
| Supabase project | — | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Calendly link | `calendlyUrl` / `CALENDLY_URL` | `CALENDLY_URL` |
| Telegram channel | `telegramUrl` | `TELEGRAM_URL` |
| Walkthrough video | `vslVideoUrl` | `VSL_VIDEO_URL` |
| Logo | `logoUrl` | `LOGO_URL` |
| Instagram, YouTube | matching fields | — |
| Google Analytics | `gaMeasurementId` | `GA_MEASUREMENT_ID` |
| Meta Pixel | `metaPixelId` | `META_PIXEL_ID` |
| Dashboard timezone | `businessTimezone` | `BUSINESS_TIMEZONE` |
| Public site URL | `siteUrl` | `SITE_URL` |

Video URLs can be YouTube, Vimeo, or a direct `.mp4` / `.webm` file. Calendly links on `calendly.com` are embedded on `/book-call` after the form is submitted. When a time is booked, the page redirects to the Telegram channel. Any other configured booking URL is used as a redirect after the lead is saved.

Other editable content:

- [`src/config/testimonials.ts`](src/config/testimonials.ts) — quotes, photos, and screenshots. Samples are labeled as placeholders. Set `testimonialsArePlaceholders` to `false` after you add real quotes.
- [`src/config/features.ts`](src/config/features.ts) — “What You’ll Get” cards.
- [`src/config/metrics.ts`](src/config/metrics.ts) — social-proof numbers. Leave a value empty until you want it published. Empty values are not shown as fake numbers.
- [`src/config/form-options.ts`](src/config/form-options.ts) — experience, previous products, and deposit ranges.
- [`src/config/content.ts`](src/config/content.ts) — headlines, call-to-action text, and the disclaimer.

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql).
3. Copy **Project URL** and the **anon public** / **publishable** key from **Project Settings → API**. Do not use the service role secret.
4. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local` (and in production).
5. Create an Auth user with the same email and password as `ADMIN_EMAIL` / `ADMIN_PASSWORD` (Authentication → Users), or turn off **Confirm email** so the app can create it on first admin login.

The browser never talks to Supabase. The anon key is used only on the server. Row Level Security allows anonymous **inserts** of new leads and blocks anonymous **reads**. Admin listing uses a signed-in Auth user whose email is in `admin_emails`.

## Admin

Set `ADMIN_EMAIL` and a password of at least 10 characters (`ADMIN_PASSWORD`), or set `ADMIN_PASSWORD_HASH` to a bcrypt hash instead. `SESSION_SECRET` must be at least 32 characters.

Sign in at `/admin/login`. From the dashboard you can search, filter, sort, change status, save notes, open a lead, and export the current result set as CSV.

Calls booked counts leads with a recorded booking time, including:

- the Calendly embed event after someone picks a time
- a Calendly `invitee.created` webhook signed with `CALENDLY_WEBHOOK_SIGNING_KEY`
- a status change to Call Booked

Webhook endpoint: `POST /api/webhooks/calendly`. It stays disabled until the signing key is set.

## Analytics

Events recorded in the database, and forwarded to Google Analytics or Meta when those IDs are set:

- `landing_page_view`
- `cta_click`
- `form_started`
- `form_completed`
- `calendly_view`
- `booking_completed`

## Security

- Admin pages and the CSV export require a signed httpOnly session cookie. Hiding `/admin` is not the access control.
- Lead writes are validated on the server, stored in Supabase with insert-only RLS (or parameterized SQLite as a fallback), and rate limited.
- Browser mutations check the request origin.
- Secrets stay in environment variables and are not shipped to the browser.

## Tests

```bash
npm test
npm run typecheck
```
