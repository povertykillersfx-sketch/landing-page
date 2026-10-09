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

Run this as a Node server with a persistent disk. The database is a SQLite file, so it is not a fit for a stateless serverless host.

## Configuration

Edit [`src/config/site.ts`](src/config/site.ts). Environment variables override those values.

| What | Config field | Environment variable |
| --- | --- | --- |
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
- Lead writes are validated on the server, parameterized in SQLite, and rate limited.
- Browser mutations check the request origin.
- Secrets stay in environment variables and are not shipped to the browser.

## Tests

```bash
npm test
npm run typecheck
```
