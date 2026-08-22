# Performance Audit — Portfolio-by-sahinpro

Date: 2026-08-22  
Scope: Public site, especially homepage on mid-range Android.  
Method: Static import tracing, source inspection, production-bundle review. Device FPS was not measured in this environment.

---

## 1. Executive summary

The desktop visual system is intact: WebGL aurora, glass surfaces, ChromaGrid spotlight, liquid bento borders, and Framer Motion scroll reveals. Mobile jank comes from **the same compositing and interaction path running on touch devices**, not from missing lazy-loading.

Highest-impact issues:

1. Full-surface `backdrop-filter` (`blur(45.94px)` glass, `backdrop-blur-xl` code chrome, header glass on mobile).
2. Pointer/WebGL systems that are **disabled after mount** instead of **never loaded** on touch.
3. Character-level Framer Motion in the footer and character-by-character code typing on the hero.
4. Layout-affecting header/menu transitions and per-frame React state on pointer/scroll.

Desktop quality is kept. Mobile is treated as a first-class performance mode via capability detection (`pointer`, `hover`, `prefers-reduced-motion`, `deviceMemory`).

---

## 2. Current architecture

| Layer | Implementation |
|---|---|
| Framework | Next.js 15.5.19 App Router, React 18, Tailwind |
| Motion | Framer Motion 12 (homepage sections, header not FM) |
| Background | `AuroraBackground`: CSS fallback + deferred `import("three")` shader (16 layers, rAF) |
| Homepage | `HomePage` is a client tree. Hero + Stats eager. Remaining sections `lazy()` + `LazySection` (IntersectionObserver, 200px rootMargin) |
| Data | `PublicSiteGate` client wrapper; settings fetch deferred via `deferUntilIdle` |
| Images | `PublicImage` (next/image) used in featured projects; several raw `<img>` remain |
| Fonts | `next/font/local` (Inter, Monte Carlo) in root layout |

Client boundary: `src/app/layout.tsx` is a Server Component; `PublicLayoutShell` is `"use client"`, so the whole public tree hydrates.

---

## 3. Performance bottlenecks

### P0 — Glass / backdrop blur on large surfaces

**Problem:** `.glass-card` uses `backdrop-filter: blur(45.94px)` on the Get Started CTA (near-viewport-width). Hero code chrome uses `backdrop-blur-xl`. Header uses `backdrop-blur-md` on mobile.

**Evidence:** `src/app/globals.css` `.glass-card`; `AboutCodeWindow.tsx` / `AboutCodePlaceholder.tsx`; `Header.tsx` `mobileGlassBarClasses`.

**Why expensive:** Backdrop blur samples and blurs everything behind the layer every frame while scrolling (aurora, gradients, images). Mid-range GPUs fall off 60fps.

**Affected devices:** Mid-range Android, iOS Safari with many glass layers.

**Recommended solution:** Mobile: opaque/semi-opaque fills, no blur (or ≤8px on tiny chips). Desktop: keep current glass.

**Expected impact:** Largest scroll-jank reduction.  
**Risk:** Slightly less “frosted” look on phones. Identity retained via borders and opacity.

---

### P0 — Aurora / Three.js module strategy

**Problem:** WebGL is correctly skipped at runtime on mobile, but `AuroraBackground.tsx` is a single module containing shaders + Three bootstrap. Eligibility is also read during render (`window`), which is a hydration hazard on desktop.

**Evidence:** `isDesktopAuroraEligible()` called in render; `await import("three")` only inside desktop `useEffect`. `@react-three/*` and `ogl` are in `package.json` with **zero source imports**.

**Why expensive:** Extra JS parse on shared chunks; any future static Three import would ship to phones. Continuous rAF + 16-layer shader is fine on desktop only.

**Recommended solution:** CSS aurora as the default export; dynamically import a desktop-only WebGL module after capability detection. Never init WebGL on touch / reduced-motion.

**Expected impact:** Smaller mobile JS; no GPU shader on phones.  
**Risk:** Desktop still sees CSS first, then WebGL (already the current behavior).

---

### P0 — MagicBento interaction architecture

**Problem:** Skills section already sets `disableAnimations`, but the component still injects particle/spotlight CSS, liquid `backdrop-filter: blur(10px)` on every card, and **attaches `mousemove` listeners in a ref callback with no cleanup** even when animations are disabled.

**Evidence:** `SkillsSection.tsx` props; `MagicBento.tsx` `ParticleCard`, `GlobalSpotlight`, `card--liquid-border`, ref `addEventListener("mousemove")`.

**Why expensive:** Six blurred cards over images; layout reads on pointer; leaked listeners.

**Recommended solution:** Capability-first lite grid on touch (static cards, no blur, no listeners). Desktop keeps liquid border. Do not mount spotlight/particles unless enabled.

**Expected impact:** Skills section scrolls without blur tax on mobile.  
**Risk:** Mobile cards look slightly flatter (images + gradient overlay remain).

---

### P1 — ChromaGrid pointer spotlight

**Problem:** `simpleMode` is width-based (`innerWidth <= 768`) and defaults to `false` on SSR, so mobile HTML can include dual full-grid `backdrop-filter` masks. Desktop `pointermove` calls `getBoundingClientRect()` and spawns new Framer `animate()` controllers every event.

**Evidence:** `ChromaGrid.tsx` `useSimpleMode`, `handleMove`, overlay `backdropFilter: grayscale(1)`.

**Recommended solution:** Server/touch render static cards. Desktop: one rAF loop, cached/coalesced pointer, CSS variables (no per-event animation controllers).

---

### P1 — Hero code typing

**Problem:** `useTypewriter` `setState` every ~18ms per character. Combined with syntax highlighting re-renders, this competes with scroll on the first screen.

**Evidence:** `useTypewriter.ts`, `HeroSection.tsx` (mobile defer 3800ms but still types).

**Recommended solution:** On touch/reduced-motion, mount the completed editor (`instant`). Keep typing on fine-pointer desktops.

---

### P1 — TextEffect `per="char"`

**Problem:** Footer name splits into one Framer node per character.

**Evidence:** `FooterSection.tsx` `per="char"`; `TextEffect.tsx` nested `motion.span`.

**Recommended solution:** Word-level (opacity + transform) when `simpleVisuals`. Skip motion entirely when `prefers-reduced-motion`. Desktop char animation unchanged.

---

### P1 — Featured project following pointer

**Problem:** `followPointer` starts `true`, so the first mobile render mounts `FollowerPointerCard`. `onMouseMove` calls `getBoundingClientRect` + `setPointerHint` every move (React re-render).

**Evidence:** `FeaturedProjectCard.tsx`.

**Recommended solution:** Default `false`; enable only after `hover: hover` + `pointer: fine`. Coalesce hint updates on rAF.

---

## 4. Mobile-specific problems

| Issue | Why mobile is worse |
|---|---|
| Header `backdrop-blur-md` over scrolling aurora | Fixed layer forces continuous backdrop samples |
| `glass-card` 46px blur on CTA | Large dirty region while scrolling into footer |
| Code editor `backdrop-blur-xl` | Large above-the-fold blur over aurora |
| MagicBento liquid blur | Six stacked filters |
| ChromaGrid SSR non-simple | Extra mask layers in first HTML |
| Typewriter + stats count-up rAF | Main-thread work during scroll |
| `useMobileDetection` via `innerWidth` | Ignores touch laptops / hover phones |
| Mobile menu `max-height` transition | Layout thrash on open |

---

## 5. Animation audit

| Animation | Type | Location | Mobile note |
|---|---|---|---|
| WebGL aurora | Continuous rAF shader | `AuroraBackground` | Desktop only; CSS static on mobile |
| Hero intro stagger | FM transform/opacity | `HeroContent` | Keep; GPU-friendly |
| Hero editor reveal | FM opacity/y/scale | `HeroSection` | Keep; skip typing on touch |
| Code typewriter | React state ~18ms | `useTypewriter` | Instant on touch |
| Terminal lines | setTimeout 520ms | `TerminalPanel` | Instant on touch |
| Header mount | CSS opacity/transform | `Header` | Keep |
| Header scroll width | CSS **width** | `Header` desktop | Desktop only; avoid `transition-all` |
| Mobile menu | **max-height** | `MobileMenu` | Switch to grid-rows |
| Section `whileInView` | FM y/opacity | Most sections | Keep, once:true |
| Stats count-up | rAF setState | `useStatCountUp` | Skip on simple visuals |
| Stat card icon | FM scale | `PortfolioStatCard` | Keep short |
| ChromaGrid enter | FM per card | `ChromaGrid` | Skip on simple |
| ChromaGrid spotlight | pointer + backdrop | `ChromaGrid` | Desktop only |
| MagicBento particles | DOM + FM infinite | `MagicBento` | Not used by Skills; still in module |
| Following pointer | MotionValues | `following-pointer` | Desktop featured cards |
| TextEffect char | many FM nodes | Footer | Word-level on mobile |
| TextLoop | interval + FM | unused export | Reduced-motion guard |
| FuzzyText filter | CSS blur | 404 page only | Leave |
| Lottie | lottie-react | Contact success/error | Not homepage |
| Skeleton shimmer | CSS transform | skeletons | Pause on reduced-motion |
| Carousel | FM + rAF | `Carousel.tsx` | Not homepage |

Scroll listeners: `useScrollPosition` (boolean after 50px, unthrottled handler). Pointer: ChromaGrid, MagicBento, FeaturedProjectCard, ComingSoonDisplay.

---

## 6. Rendering audit

Unnecessarily client (acceptable, not rewritten): `HomePage`, `PublicLayoutShell`, `PublicSiteGate`.

Keep client: Header, Hero, effects, motion sections.

`"use client"` on leaves imported by `HomePage` is redundant but harmless.

`LazySection` is the right pattern (IO, not scroll state).

---

## 7. Bundle audit

| Library | Usage | Mobile critical path |
|---|---|---|
| `three` | Dynamic import in aurora desktop | Must stay out of mobile |
| `@react-three/drei`, `fiber`, `postprocessing` | **Unused** | Not in app graph; still installed |
| `ogl` | **Unused** | Same |
| `framer-motion` | Homepage-wide | Keep; `optimizePackageImports` already on |
| `lottie-react` | Contact page only | Route-split if Contact stays a client page |
| `lucide-react` | Icons | Already optimized |
| `recharts` | Admin | Should not hit public home |

`next.config.ts` already sets `optimizePackageImports` for framer-motion / lucide / react-icons / recharts.

---

## 8. Image audit

| Asset | Usage | Issue |
|---|---|---|
| `/Group 24.png` | Get Started | **Missing from `/public`** — failed request |
| `/bgcta.avif` | Other CTAs | Exists; should be reused |
| `/bentocardImage/*` | MagicBento | Raw `<img>`, one `.jpg` |
| Unsplash URLs | ChromaGrid demo | Raw `<img>`, 800px, lazy |
| Project images | `PublicImage` | OK (next/image, AVIF/WebP) |
| Hero | No LCP photo | LCP is likely text + aurora |

---

## 9. CSS / compositing audit

| Rule | Cost |
|---|---|
| `.glass-card` blur 45.94px | Severe, large surface |
| `.liquid-border-frame` blur 10px + saturate | Moderate |
| Header `backdrop-blur-md` + gradient `::after` | Severe on mobile (fixed) |
| `backdrop-blur-xl` code chrome | Severe, above the fold |
| `PortfolioStatCard` `backdrop-blur-sm` + `blur-xl` orb | Moderate × 4 |
| ChromaGrid dual backdrop masks | Severe when mounted |
| `.glass-card-hover { transition: all }` | Animates shadow |
| `*` scrollbar styles | Minor |
| `shading-effect` radial pseudo | Cheap |
| `section-hero-subtitle` text gradient | Paint, not per-frame |

No global `will-change` spray (good).

---

## 10. Priority matrix

| Area | Current | Why expensive | Mobile impact | Priority | Fix |
|---|---|---|---|---|---|
| `.glass-card` | blur 46px | Backdrop blur | Scroll jank | P0 | No blur / solid fill on mobile |
| Header mobile glass | blur-md fixed | Backdrop + scroll | Scroll jank | P0 | Semi-opaque bar, no blur |
| Code editor chrome | blur-xl | Large blur on aurora | Hero jank | P0 | Blur desktop-only |
| Aurora module | Combined CSS+WebGL | Shared parse; render-time window | Extra JS / hydration | P0 | Split + dynamic import |
| MagicBento | Liquid blur + listeners | Filter + leaked mousemove | Skills jank | P0 | Lite grid on touch |
| ChromaGrid | SSR rich + per-event animate | Backdrop + layout reads | Why-choose jank | P1 | Static touch; rAF desktop |
| Typewriter | 18ms setState | Main thread | Hero scroll | P1 | Instant on touch |
| TextEffect char | N motion nodes | Layout/style | Footer | P1 | Word-level on touch |
| Following pointer | Default on | Re-renders | First paint | P1 | Default off |
| Stats count-up | 4× rAF | setState/frame | Mid-page | P1 | Instant on simple visuals |
| Mobile menu | max-height | Layout | Menu only | P2 | grid-template-rows |
| Header transition-all | width+shadow+bg | Extra style recalc | Low | P2 | Explicit properties |
| Get Started img | 404 PNG | Wasted request | Network | P2 | `bgcta.avif` + next/image |
| Bento/Chroma imgs | raw img | No srcset | Decode | P2 | PublicImage |
| Unused 3D deps | installed unused | Install size only | None in bundle | P3 | Future uninstall |
| HomePage client | whole page | Hydration | TTI | P3 | Leave (real islands already via lazy) |

---

## 11. Recommended fixes

1. Add `usePerformanceMode()` (reduced motion, coarse pointer, hover, memory, desktop fine pointer). Do not use UA sniffing.
2. Mobile motion budget: opacity/transform only; no WebGL, particles, cursor follow, char stagger, or large blur.
3. Split aurora; CSS-only until desktop capability is proven.
4. Lite MagicBento / ChromaGrid on `simpleVisuals`.
5. Reduce glass CSS under `max-width: 1023px` and `prefers-reduced-motion`.
6. Instant hero editor + stats on touch.
7. Respect reduced motion on TextEffect, TextLoop, skeletons.

---

## 12. Files affected (planned)

- `PERFORMANCE-AUDIT.md` (this file)
- `src/hooks/usePerformanceMode.ts` (new)
- `src/components/effects/AuroraBackground.tsx`
- `src/components/effects/AuroraBackgroundDesktop.tsx` (new)
- `src/components/effects/MagicBento.tsx`
- `src/components/effects/ChromaGrid.tsx`
- `src/components/motion/TextEffect.tsx`
- `src/components/motion/TextLoop.tsx`
- `src/components/Header/Header.tsx`
- `src/components/Header/MobileMenu.tsx`
- `src/app/globals.css`
- `src/screens/sections/HeroSection/HeroSection.tsx`
- `src/screens/sections/AboutCodeSection/*`
- `src/screens/sections/GetStartedSection/GetStartedSection.tsx`
- `src/components/projects/FeaturedProjectCard.tsx`
- `src/components/sections/PortfolioStatCard.tsx`
- `src/components/sections/LandscapePageCtaSection.tsx`
- `src/hooks/useScrollPosition.ts`
- `next.config.ts` (Unsplash remotePatterns)

---

## 13. Before/after measurements

Device FPS was **not** measured on a physical phone in this environment. Do not treat this section as a frame-rate claim.

### Production bundle (`next build`, 2026-08-22)

| Route | Size | First Load JS |
|---|---|---|
| `/` (home) | 7.66 kB | 194 kB |
| Shared | — | 102 kB |

Async splits confirmed in the loadable manifest:

| Chunk | File | Size | Loaded on mobile home? |
|---|---|---|---|
| `AuroraBackgroundDesktop` | `static/chunks/4512.*.js` | 5.3 kB | No (`richDesktopEffects` false) |
| `three` | `static/chunks/b536a0f1.*.js` | **655 kB** | No (dynamic import from desktop aurora only) |

Homepage first-load JS does not include Three.js. Contact remains heavy (397 kB first load) because Lottie stays on that route — intentionally unchanged.

### Checks run

| Command | Result |
|---|---|
| `npm run type-check` | Pass |
| `npm run build` | Pass (Next.js 15.5.19) |
| `npm run lint` | Pass (`eslint .`, 0 errors; pre-existing admin `<img>` warnings) |

### Still unmeasured (do on a real mid-range Android)

Use `npm run start` (not `next dev`):

- Scroll FPS while moving through hero → skills → why-choose
- Confirm DevTools Network: no `three` chunk on a phone user-agent / coarse pointer
- Desktop: aurora still upgrades to WebGL after idle; ChromaGrid spotlight still tracks

---

## 14. Validation checklist

- [x] `npm run type-check`
- [x] `npm run build`
- [x] `npm run lint`
- [ ] Production `npm run start` on a physical Android phone
- [x] Three.js is a separate 655 kB chunk, imported only from desktop aurora
- [x] Mobile header/CTA/code chrome no longer use large backdrop-blur
- [ ] Desktop: aurora WebGL still appears after idle (manual)
- [ ] Desktop: ChromaGrid spotlight still tracks pointer (manual)
- [x] `prefers-reduced-motion` mapped in `usePerformanceMode` + TextEffect/aurora/typing
- [x] Desktop visual systems kept (glass, liquid bento, WebGL, spotlight)

---

## 15. Implementation outcome

### Files changed

- `PERFORMANCE-AUDIT.md`
- `src/hooks/usePerformanceMode.ts` (new)
- `src/components/effects/AuroraBackground.tsx`
- `src/components/effects/AuroraBackgroundDesktop.tsx` (new)
- `src/components/effects/MagicBento.tsx`
- `src/components/effects/ChromaGrid.tsx`
- `src/components/motion/TextEffect.tsx`
- `src/components/motion/TextLoop.tsx`
- `src/components/Header/Header.tsx`
- `src/components/Header/MobileMenu.tsx`
- `src/app/globals.css`
- `src/screens/sections/HeroSection/HeroSection.tsx`
- `src/screens/sections/AboutCodeSection/aboutCodeLayout.ts`
- `src/screens/sections/AboutCodeSection/AboutCodeWindow.tsx`
- `src/screens/sections/AboutCodeSection/AboutCodePlaceholder.tsx`
- `src/screens/sections/GetStartedSection/GetStartedSection.tsx`
- `src/screens/sections/DevelopmentProcessSection/DevelopmentProcessSection.tsx`
- `src/components/projects/FeaturedProjectCard.tsx`
- `src/components/sections/PortfolioStatCard.tsx`
- `src/components/sections/LandscapePageCtaSection.tsx`
- `src/hooks/useScrollPosition.ts`
- `next.config.ts`
- `eslint.config.js`
- `package.json` (`lint` → `eslint .`)

### Issues fixed

- P0: mobile glass/header/editor blur
- P0: Three.js never downloaded or initialized on touch
- P0: MagicBento lite grid (no liquid blur, no pointer systems)
- P1: ChromaGrid static on touch; rAF spotlight on desktop
- P1: hero typing + stats count-up skipped on simple visuals
- P1: footer TextEffect word-level on mobile
- P1: following-pointer off by default
- P2: missing CTA image, next/image on bento/chroma/process/CTA, menu grid-rows, lint CLI

### Intentionally unchanged

- Desktop WebGL aurora, liquid bento, ChromaGrid spotlight
- Framer Motion section reveals (`whileInView`, transform/opacity)
- Homepage client tree (`HomePage` / `PublicSiteGate`)
- Lottie on Contact
- Unused `@react-three/*` and `ogl` packages (not in the app graph; uninstall later)
- Admin `<img>` warnings

### Remaining risks

- CSS aurora on mobile is static (no shimmer). If it feels too flat, a very slow opacity pulse can be added under `prefers-reduced-motion: no-preference` — not a continuous large gradient animation.
- Hybrid touch laptops with `hover: none` get the mobile path (correct for performance).
- Real-device FPS still needs a production-mode pass.

### Recommended future work

- Uninstall unused `@react-three/drei`, `@react-three/fiber`, `@react-three/postprocessing`, `ogl`
- Split Lottie out of the Contact first-load (dynamic import on submit state only)
- Convert remaining public `<img>` (social brand icons, contact map)
- Measure INP/FPS on a mid-range Android with `npm run start`

