# Portfolio (Sahinpro)

Personal site for **Sahin Alam** — Full Stack Developer (React, Next.js, WordPress). Live at [www.sahinpro.me](https://www.sahinpro.me).

Public pages read published projects, testimonials, hero copy, SEO metadata, social links, and site settings from **Supabase**. An authenticated **admin** area manages content, media, inbox-related settings, analytics, and resume uploads.

Built with **Next.js 15** (App Router), **React 18**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

## Features

- **Public site**: Home, About, Projects (list + slug detail), Services, Contact; animated sections; dark theme; responsive layout.
- **Dynamic content**: Projects, testimonials, hero text, social icons, and per-route SEO when Supabase is configured (in-memory cache plus optional Upstash Redis).
- **ISR**: Public pages revalidate about every hour (`revalidate = 3600`); `/api/revalidate` and `/api/admin/flush-cache` can bust caches after CMS edits.
- **Admin dashboard** (`/admin`): projects CRUD, testimonials, media library, page-view analytics, site settings (including coming-soon mode), resume/CV in storage.
- **Security**: Row Level Security (RLS) on the database; admin email allowlist; protected admin routes; `noindex` on `/admin`.
- **SEO**: Next.js Metadata API, Open Graph, sitemap (`scripts/generate-sitemap.mjs`), `robots.txt`, `llms.txt`, and JSON-LD. Legacy hosts `sahin.pro.bd` / `www.sahin.pro.bd` 301 to the canonical domain.
- **Contact**: Edge route (`/api/contact`) → Resend email delivery (optional Cloudflare Turnstile).
- **Performance**: Self-hosted Inter + MonteCarlo via `next/font/local`; CSS-only hero aurora on mobile / reduced motion; deferred Three.js WebGL aurora on capable desktops; `DeferredSection` + `React.lazy` for below-fold homepage sections; Calendly loaded on demand from the contact page; device-tier visuals (`high` / `medium` / `low`).
- **TypeScript** throughout, ESLint, path aliases under `@/`.

## Tech stack

| Area     | Libraries                                                                                  |
| -------- | ------------------------------------------------------------------------------------------ |
| App      | Next.js 15 App Router, React 18, TypeScript 5                                              |
| UI       | Tailwind CSS, Radix UI primitives, shadcn-style components, Lucide & React Icons           |
| Motion   | Framer Motion, Lottie, Three.js (desktop aurora only)                                      |
| Data     | Supabase JS client, public data hooks + cache (`src/lib/publicDataCache.ts`), Upstash Redis (optional) |
| Forms    | React Hook Form, Zod, `@hookform/resolvers`                                                |
| Admin UX | `@dnd-kit` (sortable lists), Recharts                                                      |
| Deploy   | Vercel (`vercel.json` headers/redirects), Vercel Analytics                                 |

## Prerequisites

- **Node.js** (LTS recommended) and npm.
- **Supabase project** (optional for local UI-only dev; required for live content and admin). SQL lives in `supabase/migrations/`; the `record-page-view` Edge Function is under `supabase/functions/`.
- **Resend** account for the contact form (production).
- **Upstash Redis** (optional) for a shared public-data cache in front of Supabase.

## Installation

```bash
git clone https://github.com/sahinpro/Portfolio-by-sahinpro.git
cd Portfolio-by-sahinpro
npm install
```

## Environment variables

Create a `.env.local` file in the project root (values are not committed). `next.config.ts` still maps legacy `VITE_*` names to `NEXT_PUBLIC_*` so older Vercel env vars keep working.

| Variable                                                            | Required        | Purpose                                                                              |
| ------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`                                          | For CMS / admin | Supabase project URL                                                                 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For CMS / admin | Public/anon key for the browser client                                               |
| `NEXT_PUBLIC_ADMIN_EMAIL`                                           | Optional        | If set, only this email may use admin after sign-in                                  |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                    | Optional        | Cloudflare Turnstile on contact form (public site key)                               |
| `NEXT_PUBLIC_ANALYTICS_INGEST_SECRET`                               | Optional        | Shared secret for `/api/pageview` ingest                                             |
| `NEXT_PUBLIC_REVALIDATE_SECRET`                                     | Optional        | Public token for `/api/revalidate` (falls back to the analytics secret)              |
| `NEXT_PUBLIC_ADMIN_DISPLAY_NAME` / `NEXT_PUBLIC_ADMIN_AVATAR_URL`   | Optional        | Admin shell identity                                                                 |
| `NEXT_PUBLIC_SUPABASE_STORAGE_QUOTA_GB`                             | Optional        | Storage quota shown in admin (default `1`)                                           |
| `RESEND_API_KEY`                                                    | For contact     | Resend API key **server-only**, do not prefix with `NEXT_PUBLIC_`                    |
| `CONTACT_NOTIFICATION_TO_EMAIL`                                     | Optional        | Inbox for form submissions (defaults to `contact@sahinpro.me`)                       |
| `CONTACT_NOTIFICATION_FROM_EMAIL`                                   | Optional        | Sender (defaults to `Sahin Alam <contact@sahinpro.me>`)                              |
| `RESEND_CONTACT_TEMPLATE_ID`                                        | Optional        | Published Resend template ID when set, sends via template + variables                |
| `TURNSTILE_SECRET_KEY`                                              | Recommended     | Pairs with `NEXT_PUBLIC_TURNSTILE_SITE_KEY` for bot protection (server-only)         |
| `CONTACT_RATE_LIMIT_PER_MINUTE`                                     | Optional        | Per-IP API limit (default `6`)                                                       |
| `CONTACT_RATE_LIMIT_WINDOW_MS`                                      | Optional        | Rate-limit window in ms (default `60000`)                                            |
| `REVALIDATE_SECRET`                                                 | Optional        | Server-only secret for `/api/revalidate`                                             |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`               | Optional        | Redis cache for public projects, testimonials, settings, and resume                  |

The Supabase client lives in `src/utils/supabase.ts`. Public env accessors are in `src/lib/env.ts`. The contact form does not use Supabase.

### Contact form (`.env.local` + Resend)

```env
RESEND_API_KEY=re_xxxxxxxx
CONTACT_NOTIFICATION_TO_EMAIL=contact@sahinpro.me
CONTACT_NOTIFICATION_FROM_EMAIL=Sahin Alam <contact@sahinpro.me>
# Optional published Resend template:
# RESEND_CONTACT_TEMPLATE_ID=re_xxxxxxxx
# Bot protection (recommended in production):
# NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
# TURNSTILE_SECRET_KEY=...
# Optional traffic controls:
# CONTACT_RATE_LIMIT_PER_MINUTE=6
```

For **Vercel production**, add the same server variables in **Project → Settings → Environment Variables** (not exposed to the browser). Redeploy after saving.

**Resend notes**

- Uses the official Resend `/emails` API with `Idempotency-Key`, `html` + `text`, `reply_to`, and `tags`.
- Retries Resend `429` / `5xx` responses using the `retry-after` header.
- Resend team rate limit is **5 requests/second** by default; a burst of thousands of simultaneous submissions will queue/fail at Resend. Turnstile + per-IP rate limiting reduce abuse.
- After domain verification, send from `contact@sahinpro.me` via `CONTACT_NOTIFICATION_FROM_EMAIL`.
- Replies go to the visitor’s email via `reply_to`.

## Scripts

| Command                                | Description                                              |
| -------------------------------------- | -------------------------------------------------------- |
| `npm run dev`                          | Next.js dev server (default `http://localhost:3000`)     |
| `npm run build`                        | Generate favicons + sitemap, then production build       |
| `npm start`                            | Serve the production build                               |
| `npm run lint`                         | ESLint                                                   |
| `npm run type-check`                   | `tsc --noEmit`                                           |
| `npm run type-check:functions`         | Typecheck Supabase Edge Functions                        |
| `npm run generate:favicons`            | Rebuild favicon set from source art                      |
| `npm run generate:sitemap`             | Write `public/sitemap.xml`                               |
| `npm run deploy:function:record-page-view` | Deploy the `record-page-view` Edge Function          |
| `npm run clean`                        | Remove `.next` and Vite-era cache leftovers              |

## Routes

**Public**

- `/` Home
- `/about`, `/projects`, `/projects/[slug]`, `/services`, `/contact`
- Custom `not-found` page

**Admin** (sign in at `/admin/login`)

- `/admin` Dashboard
- `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`
- `/admin/testimonials`, `/admin/testimonials/new`, `/admin/testimonials/:id`
- `/admin/media`
- `/admin/analytics`
- `/admin/settings`, `/admin/settings/resume`

**API**

- `POST /api/contact` — contact form (Edge)
- `POST /api/pageview` — analytics ingest
- `GET /api/public/projects`, `/api/public/testimonials`, `/api/public/settings`, `/api/public/resume`
- `GET /api/public/resume/file` — resume download proxy
- `POST /api/revalidate` — cache revalidation
- `POST /api/admin/flush-cache` — admin cache flush

## Project structure

```
Portfolio-by-sahinpro/
├── public/
│   ├── fonts/              # Self-hosted Inter + MonteCarlo (woff2)
│   └── …                   # Static assets, sitemap, robots.txt, llms.txt
├── api/lib/                # Shared contact-form helpers (Resend, rate limit, Turnstile)
├── scripts/                # Favicon + sitemap generators
├── supabase/
│   ├── migrations/         # SQL migrations (run in order)
│   └── functions/          # Edge Functions (e.g. record-page-view)
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, API routes)
│   ├── admin/              # Admin app (pages, layout, schemas, charts)
│   ├── components/         # Shared UI (Header, public SEO/social, effects)
│   ├── constants/          # Navigation, profile copy, styles
│   ├── data/               # Public Supabase mappers (server + client)
│   ├── hooks/              # usePublicData, usePublishedProjects, usePerformanceMode, etc.
│   ├── lib/                # Cache, SEO, fonts, revalidate, performance
│   ├── screens/sections/   # Home/marketing sections
│   ├── theme/              # Colors / theme tokens
│   ├── utils/              # supabase client
│   └── views/              # Route-level page compositions
├── next.config.ts
├── vercel.json
└── tsconfig.json
```

## Code style

- Functional components with TypeScript; hooks for reusable logic.
- Imports from `src/` use the `@/` alias (see `tsconfig.json`).
- Components: PascalCase; functions and variables: camelCase.

## Performance

Device capability is classified in `src/lib/performanceLevel.ts` and applied as `data-perf` on `<html>` (`high` / `medium` / `low`). Low-power phones skip heavy filters and WebGL; typical phones keep a lighter glass look; capable desktops get the full effect stack.

| Technique                         | Location                                              | Effect                                                                  |
| --------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Self-hosted fonts                 | `public/fonts/`, `src/lib/fonts.ts`                   | Inter 400/600/700 + MonteCarlo; no Google Fonts round-trip              |
| CSS-only hero aurora on mobile    | `src/components/effects/AuroraBackground.tsx`         | Skips Three.js WebGL except on rich desktop                             |
| Deferred WebGL aurora             | `src/components/effects/AuroraBackgroundDesktop.tsx`  | Dynamic import, idle delay, CSS fallback while loading                  |
| Below-fold deferral               | `DeferredSection` in `src/views/HomePage.tsx`         | Mounts sections near viewport only                                      |
| Optimistic site gate              | `src/components/layout/PublicSiteGate.tsx`            | Renders public pages immediately; coming-soon check after settings load |
| Deferred Calendly                 | `src/lib/loadCalendly.ts`, Contact page CTA           | Third-party widget loads on click only                                  |
| Redis public cache                | `src/lib/redisPublicCache.ts`                         | Optional shared TTL cache for public CMS reads                          |

## License

MIT — use freely for your own portfolio.

## Author

**Sahin Alam**

- Email: [contact@sahinpro.me](mailto:contact@sahinpro.me)
- GitHub: [@sahinpro](https://github.com/sahinpro)
- LinkedIn: [sahinpro](https://linkedin.com/in/sahinpro)
