# Portfolio (Sahinpro)

A modern portfolio site with a **Supabase-backed CMS**: public pages read published projects, testimonials, hero copy, SEO metadata, social links, and site settings. An authenticated **admin** area manages content, inbox, analytics, resume uploads, and more.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

## Features

- **Public site**: Home, About, Projects, Services, Contact; animated sections; responsive layout.
- **Dynamic content**: Projects, testimonials, hero text, social icons, and per-route SEO when Supabase is configured (with in-memory caching for snappy navigation).
- **Admin dashboard** (`/admin`): projects CRUD, testimonials, blog, page-view analytics, site settings, social links, SEO fields, resume/CV in storage.
- **Security**: Row Level Security (RLS) on the database; admin allowlist; protected admin routes.
- **SEO**: `react-helmet-async` for titles and meta tags driven from the database where available.
- **Contact**: Vercel API route (`/api/contact`) → Resend email delivery (optional Cloudflare Turnstile).
- **Mobile performance**: Self-hosted fonts (`public/fonts/`), CSS-only hero aurora on mobile, below-fold `LazySection` deferral on the homepage, Calendly loaded on demand from the contact page.
- **TypeScript** throughout, ESLint with zero-warning policy, path aliases under `@/`.

## Tech stack

| Area     | Libraries                                                                                  |
| -------- | ------------------------------------------------------------------------------------------ |
| UI       | React 18, Tailwind CSS, Radix UI primitives, shadcn-style components, Lucide & React Icons |
| Motion   | Framer Motion, Lottie                                                                      |
| Data     | Supabase JS client, public data hooks + cache (`src/lib/publicDataCache.ts`)               |
| Forms    | React Hook Form, Zod, `@hookform/resolvers`                                                |
| Admin UX | `@dnd-kit` (sortable lists), `@uiw/react-md-editor`, Recharts                              |
| Routing  | React Router v6                                                                            |
| Build    | Vite 6, TypeScript 5                                                                       |

## Prerequisites

- **Node.js** (LTS recommended) and npm.
- **Supabase project** (optional for local UI-only dev; required for live content and admin). See [`supabase/README.md`](supabase/README.md) for migrations, auth, allowlist, Edge Functions, and storage.

## Installation

```bash
git clone <your-repo-url>
cd Portfolio-by-sahinhub
npm install
```

## Environment variables

Create a `.env` file in the project root (values are not committed).

| Variable                                                            | Required        | Purpose                                                                              |
| ------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------ |
| `VITE_SUPABASE_URL`                                                 | For CMS / admin | Supabase project URL                                                                 |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` or `VITE_SUPABASE_ANON_KEY` | For CMS / admin | Public/anon key for the browser client                                               |
| `VITE_ADMIN_EMAIL`                                                  | Optional        | If set, only this email may use admin login UI (allowlist still required for writes) |
| `VITE_TURNSTILE_SITE_KEY`                                           | Optional        | Cloudflare Turnstile on contact form (public site key)                               |
| `RESEND_API_KEY`                                                    | For contact     | Resend API key **server-only**, do not prefix with `VITE_`                           |
| `CONTACT_NOTIFICATION_TO_EMAIL`                                     | Optional        | Inbox for form submissions (defaults to `sahinweb@proton.me`)                        |
| `CONTACT_NOTIFICATION_FROM_EMAIL`                                   | Optional        | Sender (defaults to `Sahin Alam <contact@sahin.pro.bd>`)                             |
| `RESEND_CONTACT_TEMPLATE_ID`                                        | Optional        | Published Resend template ID when set, sends via template + variables                |
| `TURNSTILE_SECRET_KEY`                                              | Recommended     | Pairs with `VITE_TURNSTILE_SITE_KEY` for bot protection (server-only)                |
| `CONTACT_RATE_LIMIT_PER_MINUTE`                                     | Optional        | Per-IP API limit (default `6`) helps under traffic spikes                            |
| `CONTACT_RATE_LIMIT_WINDOW_MS`                                      | Optional        | Rate-limit window in ms (default `60000`)                                            |

The Supabase client lives in `src/utils/supabase.ts` (CMS/admin only contact form does not use Supabase).

### Contact form (`.env` + Resend)

Add to your root `.env` for local dev (`npm run dev` serves `/api/contact` via Vite middleware):

```env
RESEND_API_KEY=re_xxxxxxxx
CONTACT_NOTIFICATION_TO_EMAIL=sahinweb@proton.me
CONTACT_NOTIFICATION_FROM_EMAIL=Sahin Alam <contact@sahin.pro.bd>
# Optional published Resend template:
# RESEND_CONTACT_TEMPLATE_ID=re_xxxxxxxx
# Bot protection (recommended in production):
# VITE_TURNSTILE_SITE_KEY=...
# TURNSTILE_SECRET_KEY=...
# Optional traffic controls:
# CONTACT_RATE_LIMIT_PER_MINUTE=6
```

For **Vercel production**, add the same server variables in **Project → Settings → Environment Variables** (not exposed to the browser). Redeploy after saving.

**Resend notes**

- Uses the official Resend `/emails` API with `Idempotency-Key`, `html` + `text`, `reply_to`, and `tags`.
- Retries Resend `429` / `5xx` responses using the `retry-after` header (per Resend rate-limit docs).
- Resend team rate limit is **5 requests/second** by default a burst of thousands of simultaneous submissions will queue/fail at Resend; Turnstile + per-IP rate limiting reduce abuse.
- After domain verification, send from `contact@sahin.pro.bd` via `CONTACT_NOTIFICATION_FROM_EMAIL`.
- Replies go to the visitor’s email via `reply_to`.

## Scripts

| Command              | Description                                       |
| -------------------- | ------------------------------------------------- |
| `npm run dev`        | Vite dev server (default `http://localhost:5173`) |
| `npm run build`      | Typecheck + production build → `dist/`            |
| `npm run build:prod` | Build with `--mode production`                    |
| `npm run preview`    | Serve the production build locally                |
| `npm run lint`       | ESLint (`--max-warnings 0`)                       |
| `npm run type-check` | `tsc --noEmit`                                    |
| `npm run clean`      | Remove `dist` and Vite cache                      |
| `npm run analyze`    | Bundle visualizer                                 |

## Routes

**Public**

- `/` Home
- `/about`, `/projects`, `/services`, `/contact`
- `*` Not found

**Admin** (sign in at `/admin/login`)

- `/admin` Dashboard
- `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`
- `/admin/testimonials`
- `/admin/blog`, `/admin/blog/new`, `/admin/blog/:id`
- `/admin/analytics`
- `/admin/settings`, `/admin/settings/social`, `/admin/settings/seo`, `/admin/settings/resume`

## Project structure

```
Portfolio-by-sahinhub/
├── public/
│   ├── fonts/              # Self-hosted Inter + MonteCarlo (woff2)
│   └── …                   # Static assets
├── supabase/
│   ├── migrations/         # SQL migrations (run in order)
│   └── README.md           # Backend setup, RLS, Edge Functions, secrets
├── src/
│   ├── admin/              # Admin app (pages, layout, schemas, charts)
│   ├── components/         # Shared UI (Header, public SEO/social, effects)
│   ├── constants/          # Navigation, styles
│   ├── data/               # Public Supabase mappers
│   ├── hooks/              # usePublicData, usePublishedProjects, useSeoForPage, etc.
│   ├── lib/                # publicDataCache, utils
│   ├── pages/              # Route-level pages
│   ├── screens/sections/   # Home/marketing sections
│   ├── theme/              # Colors / theme tokens
│   ├── utils/              # supabase client
│   ├── global.d.ts
│   └── index.tsx           # App entry + routes
├── index.html
├── tailwind.css
├── vite.config.ts
└── tsconfig.json
```

## Code style

- Functional components with TypeScript; hooks for reusable logic.
- Imports from `src/` use the `@/` alias (see `vite.config.ts` / `tsconfig`).
- Components: PascalCase; functions and variables: camelCase.

## Mobile performance

Phase 1 optimizations for faster first paint on phones:

| Technique                      | Location                                        | Effect                                                                  |
| ------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------- |
| Self-hosted fonts              | `public/fonts/`, `@font-face` in `tailwind.css` | Inter 400/600/700 + MonteCarlo only; no Google Fonts round-trip         |
| CSS-only hero aurora on mobile | `src/components/AuroraBackground.tsx`           | Skips Three.js WebGL below 768px                                        |
| Below-fold deferral            | `LazySection` in `src/pages/HomePage.tsx`       | Mounts sections near viewport only                                      |
| Optimistic site gate           | `src/routes/PublicSiteGate.tsx`                 | Renders public pages immediately; coming-soon check after settings load |
| Deferred Calendly              | `src/lib/loadCalendly.ts`, Contact page CTA     | Third-party widget loads on click only                                  |

Font files were sourced from `@fontsource/inter` and `@fontsource/montecarlo` (devDependencies used at build/setup time).

## License

MIT use freely for your own portfolio.

## Author

**Sahin Alam**

- Email: [sahinweb@proton.me](mailto:sahinweb@proton.me)
- GitHub: [@sahinhub](https://github.com/sahinhub)
