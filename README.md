# Portfolio (Sahinhub)

A modern portfolio site with a **Supabase-backed CMS**: public pages read published projects, testimonials, hero copy, SEO metadata, social links, and site settings. An authenticated **admin** area manages content, inbox, analytics, resume uploads, and more.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

## Features

- **Public site**: Home, About, Projects, Services, Contact; animated sections; responsive layout.
- **Dynamic content**: Projects, testimonials, hero text, social icons, and per-route SEO when Supabase is configured (with in-memory caching for snappy navigation).
- **Admin dashboard** (`/admin`): projects CRUD, testimonials, blog, contact inbox, page-view analytics, site settings, social links, SEO fields, resume/CV in storage.
- **Security**: Row Level Security (RLS) on the database; admin allowlist; protected admin routes.
- **SEO**: `react-helmet-async` for titles and meta tags driven from the database where available.
- **Contact**: Supabase Edge Function inbox flow with optional Resend email notifications and optional Cloudflare Turnstile.
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
| `VITE_TURNSTILE_SITE_KEY`                                           | Optional        | Cloudflare Turnstile on contact form                                                 |

The Supabase client lives in `src/utils/supabase.ts`.

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

- `/` — Home
- `/about`, `/projects`, `/services`, `/contact`
- `*` — Not found

**Admin** (sign in at `/admin/login`)

- `/admin` — Dashboard
- `/admin/projects`, `/admin/projects/new`, `/admin/projects/:id`
- `/admin/testimonials`
- `/admin/blog`, `/admin/blog/new`, `/admin/blog/:id`
- `/admin/inbox`
- `/admin/analytics`
- `/admin/settings`, `/admin/settings/social`, `/admin/settings/seo`, `/admin/settings/resume`

## Project structure

```
Portfolio-by-sahinhub/
├── public/                 # Static assets
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

## License

MIT — use freely for your own portfolio.

## Author

**Sahin Alam**

- Email: [sahinhub@gmail.com](mailto:sahinhub@gmail.com)
- GitHub: [@sahinhub](https://github.com/sahinhub)
