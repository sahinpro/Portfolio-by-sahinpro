# Performance Verification Results

Date: 2026-08-22 (Redmi 5 Plus pass)  
Production: `npm run build` (Next.js 15.5.19)  
Method: source runtime map, capability-mode implementation, production bundle. **No Redmi 5 Plus, no Chrome Performance panel in this environment.**

Do not treat localhost timings as field Core Web Vitals or FPS.

---

## Redmi 5 Plus Findings

The previous pass already skipped WebGL, particles, typewriter, count-up, and pointer systems on all touch devices. The phone was still laggy because **those skips were not the remaining cost**.

Redmi 5 Plus class hardware (Snapdragon 625, Adreno 506, typically 3–4 GB RAM) still executed:

1. **Large `backdrop-filter` while scrolling** — header `backdrop-blur-md` (fixed), editor `backdrop-blur-xl`, stats `backdrop-blur-sm`, `.glass-card` 8px. Adreno 506 re-blurs whatever sits behind those layers on every frame of scroll.
2. **Framer Motion stagger trees on every section enter** — `whileInView` + `staggerChildren` on Hero, Stats (4 cards), and later lazy sections. Projection + style updates hitch on a 2018 CPU.
3. **A scroll listener on phones that never needed it** — Header appearance on `<lg` does not use `isScrolled`. The listener still scheduled rAF and a `setState` updater on every coalesced scroll.

`deviceMemory` on Chrome/Mi Browser for a 4 GB Redmi 5 Plus reports **4**, which now maps to **LOW**. iPhone (no `deviceMemory`) maps to **MEDIUM** and keeps reduced glass. Desktop fine pointer maps to **HIGH**.

---

## Root Cause

**Compositing + motion on the main/render thread during scroll**, not Three.js and not first-load JS size.

Homepage First Load JS is unchanged at **194 kB** / shared **102 kB**. Three.js remains an async desktop chunk. Settings fetch, analytics, and page-view ingest remain deferred.

If this were “too much JS,” the previous pass would have fixed the phone. The user still saw hitching, which matches **backdrop-filter + section-enter motion** on Adreno 506.

---

## Evidence

| Claim | Evidence | Measured on device? |
|---|---|---|
| Header glass still on mobile after previous pass | `Header.tsx` `max-lg:backdrop-blur-md` | Code |
| Editor chrome still `backdrop-blur-xl` | `aboutCodeLayout.ts` | Code |
| Stats still `backdrop-blur-sm` + `blur-xl` orb | `PortfolioStatCard.tsx` | Code |
| `.glass-card` still 8px blur ≤1023px | `globals.css` | Code |
| Scroll listener ran on all viewports | `useScrollPosition.ts` (pre-fix) attached `scroll` always | Code |
| Header `isScrolled` only changes `lg:` classes | `Header.tsx` | Code |
| Homepage is a client tree with many `whileInView` staggers | `HomePage.tsx`, `scrollMotion.ts`, section files | Code |
| Redmi 5 Plus → LOW via RAM, not UA | `deviceMemory <= 4` + coarse pointer; no `userAgent` | Code |
| FPS / long tasks on the phone | — | **Not measured** |
| Chrome Performance panel | No Chrome in this environment | **Not measured** |

### Runtime map (homepage, while scrolling)

| Component | Event | Frequency | React render? | Layout? | Paint? | On mobile? |
|---|---|---|---|---|---|---|
| `useScrollPosition` (before) | scroll → rAF → `setState` updater | ≤1/frame while finger moves | Bail-out if boolean unchanged; **rAF still ran** | `scrollY` read | No | Yes |
| `useScrollPosition` (after) | none below 1024px | — | No | No | No | **No listener** |
| Header `backdrop-filter` (before) | scroll (browser) | every frame | No | No | **Yes, expensive** | Yes |
| Header (LOW after) | scroll | compositor only | No | No | Solid fill | Yes |
| Framer Motion `whileInView` | intersection | once per section | Yes (animation frames) | Possible | Yes | Yes, until LOW `MotionConfig` |
| `useTypewriter` | timeout | ~18ms | Yes | No | Yes | Skipped (`simpleVisuals`) |
| `useStatCountUp` | rAF | ~1.4s | Yes | No | text | Skipped |
| ChromaGrid rAF | pointermove | desktop | No (CSS vars) | `getBoundingClientRect` | masks | No (`simpleVisuals`) |
| Aurora WebGL | rAF | 60 | No | resize | canvas | No (`richDesktopEffects`) |
| MagicBento lite | none | — | No | No | static cards | Lite grid |
| `PublicSiteGate` settings | idle 3.5s | once | Yes | No | No | Deferred (verified in source) |
| Analytics / pageview | idle 4–4.5s | once | No | No | No | Deferred |

### `whileInView` table

| Component | Animated children | Type | LOW | MEDIUM | HIGH |
|---|---|---|---|---|---|
| HeroContent | title, subtitle, desc, 2 CTAs, 7 social icons | stagger opacity/y | static (`MotionConfig always` + instant hero) | reduced stagger | full |
| StatsSection | 4 cards + icon scale | stagger + scale | static, no blur | cards animate, no count-up | full + count-up |
| FeaturedProjects | per-card fade | opacity/y | instant visible | fade | fade + pointer follow |
| Skills / MagicBento | 0 motion nodes (lite) | static | static | static lite | liquid + spotlight |
| TechStack / Career / Process / FAQ / CTA | section stagger | opacity/y | instant | stagger | stagger |
| WhyChoose / ChromaGrid | static cards on touch | — | static | static | spotlight |
| Footer TextEffect | char/word spans | stagger | **plain text** | word fade | word/char |
| About / Services pages | same patterns | opacity/y | instant | stagger | stagger |

---

## Experiments

Mandatory A/B/C/D comparison **was not run on a Redmi 5 Plus**. No Chrome, no physical device.

| Profile | What it would isolate | Result here |
|---|---|---|
| A Current (previous mobile path) | glass + FM staggers | Baseline in code |
| B No blur | compositing | Implemented as LOW CSS (`data-perf=low`) |
| C No decorative motion | FM hitching | Implemented as `MotionConfig reducedMotion="always"` on LOW |
| D LOW mode | B + C + no phone scroll listener + static aurora | **This pass** |

If the phone is smooth after D, the cause was animation/compositing (predicted). If it is still laggy, next suspects are hydration of the full `HomePage` client tree, DOM size of the code editor, and image decode. **Not measured.**

To force a profile in DevTools: set `document.documentElement.dataset.perf` after load (HIGH/MEDIUM ignore it until hydrate; LOW CSS keys off the attribute immediately via the boot script).

---

## Final Fixes

| Problem | Evidence | Fix | Measured effect |
|---|---|---|---|
| Touch, 4 GB RAM, and 8-core SD625 all looked like one “simple” path | `simpleVisuals` treated every phone the same | `HIGH` / `MEDIUM` / `LOW` from hover, pointer, width, `deviceMemory`, `hardwareConcurrency`, `saveData`, reduced motion. **No UA string.** | Not measured |
| First paint blur on LOW | CSS applied after hydrate | Blocking `<head>` boot script sets `data-perf` | Not measured |
| Header/editor/stats/CTA blur on weak GPU | class list + `globals.css` | LOW: `backdrop-filter: none`, solid header, 1-stop aurora. MEDIUM: 8px instead of 12–46px. HIGH: unchanged | Not measured |
| Scroll → rAF on phones | `useScrollPosition` | Listener only at `min-width: 1024px` | Not measured |
| Section-enter hitching | many `whileInView` trees | LOW: `MotionConfig reducedMotion="always"`; TextEffect renders static text | Not measured |
| Stats icons stayed `opacity: 0` until IO | `animate={inView ? … : hidden}` | LOW/reduced-motion: always visible | Not measured |
| Continuous CSS aurora cost | 4 full-viewport gradients | LOW: single radial | Not measured |

Desktop HIGH path is unchanged: WebGL aurora, ChromaGrid spotlight, liquid bento, pointer follow, header shrink.

---

## Before / After

| Item | Previous mobile path | This pass |
|---|---|---|
| Modes | `simpleVisuals` boolean | `high` / `medium` / `low` |
| Redmi 5 Plus (4 GB Chrome) | same as iPhone (glass + FM) | **LOW** |
| iPhone (no `deviceMemory`) | glass + reduced FX | **MEDIUM** (8px glass, no WebGL) |
| Desktop mouse | full FX | **HIGH** |
| Header blur on LOW | `backdrop-blur-md` | none, `rgba(10,10,10,0.94)` |
| Phone scroll listener | yes | no |
| Home First Load JS | 194 kB | **194 kB** |
| Home route | 7.66 kB | **7.51 kB** |
| Shared JS | 102 kB | **102 kB** |
| Three.js on `/` | not in HTML | still not in HTML |
| Type-check / lint / build | pass | pass (lint: 0 errors, existing admin warnings) |
| Device FPS | Not measured | **Not measured** |

---

## Remaining Bottlenecks

1. **Whole public tree still hydrates** (`PublicLayoutShell` + `HomePage` are client). Not rewritten; islands would be a later pass.
2. **Hero code editor DOM** (line numbers × highlighted spans) is still large. LOW skips typing but still mounts the static highlighted tree.
3. **Contact route** 397 kB First Load (Lottie) — off homepage.
4. **`Group 24.png` 412 kB source** — served through `next/image` when Get Started mounts (below fold).
5. Real **Redmi 5 Plus FPS / INP** — **Not measured**.

---

## Desktop Regression Check

| Check | Status |
|---|---|
| `richDesktopEffects` still requires desktop + hover + fine pointer | Yes |
| WebGL still `next/dynamic` + `import("three")` | Yes |
| ChromaGrid interactive only when `simpleVisuals === false` | Yes |
| MagicBento lite only when `simpleVisuals` | Yes |
| Header shrink still `lg:` + scroll threshold | Yes, listener desktop-only |
| LOW CSS gated on `html[data-perf="low"]` | Yes — HIGH does not match |

Visual desktop check in a browser: **Not measured** here.

---

## Final Recommendation

The Redmi 5 Plus target should now take the **LOW** path automatically in Chromium (4 GB `deviceMemory`). That is the device test:

1. `npm run start` (not `next dev`).
2. Confirm `document.documentElement.dataset.perf === "low"`.
3. Confirm no Three.js chunk on the network log.
4. Scroll Hero → Stats → Skills. Header must stay a solid bar, code window already filled, no blur smear.

If that session is still hitchy, the next evidence-backed cut is **homepage client-island split** (Hero/Stats static server markup), not more blur tweaks.

---

## Acceptance (code)

- [x] No Three.js on LOW/MEDIUM (`richDesktopEffects` false)
- [x] No large mobile blur on LOW
- [x] No pointer effects on touch (`simpleVisuals`)
- [x] No continuous decorative animation on LOW (aurora static, no pulse/shimmer)
- [x] No per-frame React scroll updates on phones
- [x] Scroll listener cleaned up; no new leaks
- [x] No layout reads on phone scroll
- [x] Hydration: `useSyncExternalStore` + boot script (warnings **Not measured** in a browser)
- [x] Production build / type-check / lint pass
- [ ] Redmi 5 Plus “noticeably smoother” — **device experience not measured in this environment**

---

## Previous pass baseline (kept)

| Metric | Value |
|---|---|
| Home First Load JS | 194 kB |
| Shared JS | 102 kB |
| Three.js async | ~655 kB, not in `/` HTML |
| Settings / analytics | `deferUntilIdle` |
| MagicBento listener leak | fixed earlier |

LCP / INP / CLS: **Not measured**.
