# Task: Defer mounting of below-the-fold homepage sections to fix mobile scroll jank

## Context
This is a React 18 + TypeScript + Next.js (App Router) portfolio site
(`Portfolio-by-sahinpro`). The homepage (`src/views/HomePage.tsx`) renders 11
sections. Most below-the-fold sections already use `React.lazy()` + `Suspense`,
several with `/* webpackPrefetch: true */`.

## Problem (confirmed by code trace, not a guess)
`React.lazy()` + `Suspense` here only code-splits the JS bundle. It does NOT
defer *mounting* by scroll position — once each lazy chunk loads (which
happens almost immediately after first paint, especially with
`webpackPrefetch: true` pulling it forward), the section mounts into the DOM
right away regardless of whether the user has scrolled anywhere near it.

Net effect: all 11 sections — their DOM nodes, Framer Motion `whileInView`
IntersectionObservers, decorative blur layers, and images — mount almost
simultaneously right after page load. This main-thread work lands exactly
when the user starts touch-scrolling immediately after the page appears,
which is reported as laggy/heavy touch scroll on mobile (confirmed via
Chrome DevTools CPU throttling — issue persists even after two earlier CSS
fixes to `backdrop-filter`/`blur-3xl`, which addressed paint cost but not
this mounting cost).

## Goal
Defer the true mount of below-the-fold sections until they are actually
about to scroll into view, using `IntersectionObserver` — WITHOUT changing
any visual output, animation, copy, or existing feature. This is purely a
"when does it mount" change, not a "what does it look like" change.

## 1. Create a reusable wrapper component

Create `src/components/layout/DeferredSection.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function DeferredSection({
  children,
  fallback,
  rootMargin = "600px 0px",
}: {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (shouldRender) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldRender, rootMargin]);

  return <div ref={ref}>{shouldRender ? children : fallback}</div>;
}
```

Match this project's existing code style (import ordering, quote style,
etc. — check `.eslintrc`/`prettier` config and follow it).

## 2. Wrap the six below-the-fold sections in `src/views/HomePage.tsx`

Wrap ONLY these six sections' existing `<Suspense>` blocks with
`<DeferredSection>`, reusing the same fallback element as both the
`DeferredSection`'s `fallback` prop and the inner `Suspense`'s `fallback`:

- `CareerJourneySection`
- `DevelopmentProcessSection`
- `WhyChooseUsSection`
- `FAQSection`
- `GetStartedSection`
- `FooterSection`

Example transformation:

```tsx
// Before
<Suspense fallback={<div className="w-full min-h-[500px]" aria-hidden />}>
  <CareerJourneySection />
</Suspense>

// After
<DeferredSection fallback={<div className="w-full min-h-[500px]" aria-hidden />}>
  <Suspense fallback={<div className="w-full min-h-[500px]" aria-hidden />}>
    <CareerJourneySection />
  </Suspense>
</DeferredSection>
```

Do NOT wrap `HeroSection`, `StatsSection`, `FeaturedProjectsSection`,
`TestimonialsSection`, or `SkillsSection` — these are near the top of the
page and deferring them would cause visible pop-in/flicker for content the
user sees almost immediately.

## 3. Remove premature prefetch hints for the deferred sections

In `src/views/HomePage.tsx`, find the `lazy(() => import(/* webpackPrefetch: true */ "..."))`
declarations for the same six sections listed in step 2, and remove the
`/* webpackPrefetch: true */` comment from each of those six `import()`
calls only. Leave `webpackPrefetch: true` in place for any section ABOVE
the fold that already has it (if any) — do not touch those.

## 4. Verification
- `npm run type-check` and `npm run lint` must pass with zero warnings (this
  repo enforces `--max-warnings 0`).
- Visually confirm on `localhost:3000` (after `npm run build && npm run start`,
  not `npm run dev`) that all six sections still render correctly and in the
  same order when scrolled to — there should be no visible layout shift
  beyond the placeholder height already defined in each `fallback`.
- Open Chrome DevTools → Performance tab, enable CPU throttling ("Mid-tier
  mobile device" preset if available, or 4x/6x slowdown), record a page load
  + immediate scroll, and confirm fewer/lighter tasks fire in the first 1-2
  seconds after load compared to before this change.

## Do NOT
- Do not change any component's internal markup, styling, animation
  variants, or copy — this task only changes *when* six components mount,
  not what they render.
- Do not wrap `HeroSection`, `StatsSection`, `FeaturedProjectsSection`,
  `TestimonialsSection`, or `SkillsSection`.
- Do not remove the existing `Suspense` boundaries — `DeferredSection` wraps
  around them, it doesn't replace them.
- Do not add any new npm dependencies — `IntersectionObserver` is a native
  browser API.
