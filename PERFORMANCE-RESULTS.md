# Performance Verification Results

Date: 2026-08-22  
Production: `next start` on `http://127.0.0.1:3001` (Next.js 15.5.19)  
Method: production build output, homepage HTML inspection, static chunk analysis, source leak/hydration review.

---

## Environment

| Item | Value |
|---|---|
| OS | Windows 10 (dev machine) |
| Node | v24.14.0 |
| Server | `npm run build` then `npx next start -p 3001` |
| Chrome / Lighthouse | Lighthouse CLI 13.4.1 present; **no Chrome installation** (`No Chrome installations found`) |
| Physical phones | **Not available in this environment** |
| Device A (mid-range Android) | Not measured |
| Device B (low-end Android) | Not measured |
| Device C (iPhone Safari) | Not measured |

Do not treat localhost timings as field Core Web Vitals.

---

## Baseline

From the previous pass (`PERFORMANCE-AUDIT.md`):

| Metric | Baseline |
|---|---|
| Home route size | 7.66 kB |
| Home First Load JS | 194 kB |
| Shared JS | 102 kB |
| Three.js async chunk | 655 kB |
| Aurora desktop wrapper | 5.3 kB |

This phase’s production build matched that baseline exactly before the MagicBento cleanup (see Bundle Findings).

---

## Mobile Results

**Not measured in this environment.** No physical Android device and no headless Chrome.

Code + production HTML checks that apply to the mobile/simple path:

| Check | Result |
|---|---|
| Homepage HTML includes Three.js / `b536a0f1` chunk | **No** (mobile UA and desktop UA) |
| Homepage HTML includes Aurora desktop chunk `4512` | **No** |
| `Group 24.png` in homepage HTML | **No** (replaced by `/bgcta.avif`, requested only when CTA section mounts) |
| `usePerformanceMode` uses UA sniffing | **No** — `hover`, `pointer: fine`, `prefers-reduced-motion`, `min-width: 1024`, `deviceMemory` |
| SSR/hydration for capabilities | `useSyncExternalStore` + conservative server snapshot (`simpleVisuals: true`, `richDesktopEffects: false`) |
| MagicBento on touch | Lite grid; no particles, spotlight, or liquid blur |
| ChromaGrid on touch | Static cards; no backdrop masks / pointer rAF |
| Header / glass / editor chrome | Mobile glass restored (`backdrop-blur-md` header, `backdrop-blur-sm` stats, `backdrop-blur-xl` editor). `.glass-card` uses 8px blur ≤1023px instead of 46px |
| Hero typing | Instant when `simpleVisuals` |

---

## Desktop Results

**Not measured in this environment** (no Chrome, no interactive session).

Intended desktop path (code + split points):

| Check | Evidence |
|---|---|
| CSS aurora first | `AuroraBackground` renders CSS until `richDesktopEffects` |
| WebGL is a separate chunk | `AuroraBackground.tsx -> ./AuroraBackgroundDesktop` → `4512.*.js` (5.3 kB) then `-> three` → `b536a0f1.*.js` (655 kB / 670,127 bytes on disk) |
| First-load JS contains `WebGLRenderer` | **No** in `page`, `layout`, or shared first-load chunks |
| ChromaGrid spotlight | Interactive branch only when `simpleVisuals` is false; rAF + CSS vars |
| Featured pointer follow | Starts `false`; enabled in `useEffect` for fine pointer + hover |
| Header glass | Desktop `lg:backdrop-blur-md`; mobile glass matches original (`max-lg:backdrop-blur-md`) |

---

## Core Web Vitals

```text
LCP  — Not measured in this environment.
INP  — Not measured in this environment.
CLS  — Not measured in this environment.
FCP  — Not measured in this environment.
TTFB — Localhost only: 17 ms (time_starttransfer to 127.0.0.1:3001). Not a field TTFB.
```

Targets (LCP < 2.5s, INP < 200ms, CLS < 0.1) are **not claimed**.

---

## Frame / Long Task Findings

Chrome Performance panel was **not available**.

Static classification of remaining homepage work:

| Component | Trigger | Main thread | Rendering | Frequency | Device | Evidence | Recommended fix |
|---|---|---|---|---|---|---|---|
| `useScrollPosition` | scroll | boolean `setState` via rAF | none | ≤1/frame, only when threshold crosses | all | `src/hooks/useScrollPosition.ts` | Keep |
| `useStatCountUp` | in-view | rAF `setState` | text | ~1.4s | desktop only (`simpleVisuals` skips) | `PortfolioStatCard` | Keep |
| `useTypewriter` | hero editor | `setState` ~18ms | highlight | until done | desktop only | `HeroSection` + `simpleVisuals` | Keep |
| ChromaGrid spotlight | pointermove | 1 layout read + rAF | backdrop masks | desktop hover | desktop | `ChromaGridInteractive` | Keep (desktop quality) |
| Aurora WebGL | rAF | GPU shader | canvas | 60fps while visible | desktop after idle | `AuroraBackgroundDesktop` | Keep |
| MagicBento particles/spotlight | — | — | — | — | not on homepage Skills | `disableAnimations` + lite on touch | Keep |

No new P0 frame-time issue was measured.

---

## Network Findings

Production `GET /` (67,062 bytes HTML):

**Initial scripts (17):** shared + app layout + home page. No `4512` / `b536a0f1` (Three.js).

**Preloads:**

- Logo: `sahin.jpg` via `next/image` with `imageSizes="45px"` (srcset includes 3840w as fallback `src`; browser should pick ~48–96w).
- Webpack runtime (low priority).

**Measured asset responses:**

| URL | Status | Bytes |
|---|---|---|
| `/_next/image?url=%2Fsahin.jpg&w=96&q=75` | 200 | 2,064 |
| `/bgcta.avif` | 200 | 80,838 |
| `/Group 24.png` | 200 | 412,334 (file still in `/public`; **not referenced** by homepage HTML) |
| `/_next/static/chunks/b536a0f1.*.js` (Three) | 200 | 670,127 (available, **not linked** from `/`) |
| `/_next/static/chunks/4512.*.js` | 200 | 5,373 |

**Deferred after idle (not in first HTML):** site settings fetch, page-view ingest, Vercel analytics.

**Third-party on first HTML:** none observed in the document.

---

## Bundle Findings

`next build` (this phase, before MagicBento leak fix — same as baseline):

```text
/          7.66 kB    First Load JS 194 kB
Shared                  102 kB
  chunks/1255-*.js       45.7 kB
  chunks/4bd1b696-*.js   54.2 kB
Contact                196 kB route / 397 kB first load (Lottie — unchanged)
```

```text
Three chunk = out of mobile initial/request path
```

No mobile First Load JS regression vs 194 kB / 102 kB.

---

## Memory / Cleanup Findings

Reviewed `addEventListener`, rAF, observers, timers on homepage effects.

| Area | Cleanup |
|---|---|
| `usePerformanceMode` | media `change` listeners removed |
| `useScrollPosition` | scroll + rAF cancelled |
| `LazySection` | IntersectionObserver disconnect |
| `AuroraBackgroundDesktop` | rAF cancel, ResizeObserver disconnect, geometry/material/renderer dispose, `loseContext`, canvas remove |
| `ChromaGridInteractive` | rAF cancelled on unmount |
| `FeaturedProjectCard` | hint rAF cancelled |
| `ParticleCard` / `GlobalSpotlight` | listeners removed (not mounted on homepage Skills) |
| MagicBento non-star cards | **Was a leak:** callback `ref` added `mousemove`/`mouseleave`/`click` with **no** `removeEventListener`. Homepage Skills uses `disableAnimations`, so the leak was dormant. **Fixed** with `InteractiveBentoCard` + `useEffect` cleanup. |

---

## Issues Found

### P0

None newly measured.

### P1

None newly measured (no Chrome/device FPS).

### P2 — MagicBento callback-ref listener leak (fixed)

**Before:** `ref={(el) => { el.addEventListener(...) }}` with no unmount cleanup.  
**Evidence:** `MagicBento.tsx` listener attach without `removeEventListener`.  
**Change:** `InteractiveBentoCard` uses `useEffect` and removes listeners; skips binding when tilt/magnetism/click are off.  
**After:** No leaked listeners on remount. Homepage Skills still has animations off (same visuals).  
**Measured impact:** Not measured (no Chrome heap snapshot).

### P3 (left unchanged)

- Unused `@react-three/*`, `ogl` packages (not in app graph).
- Dead `/public/Group 24.png` (412 kB) still on disk; not requested by home HTML.
- Contact First Load JS 397 kB (Lottie).
- `ecommerce.jpg` 245 kB source (served via `next/image` when Skills mounts).
- No Chrome in CI/dev sandbox → no Lighthouse JSON.

---

## Fixes Applied

### MagicBento pointer listener cleanup

```text
Before: callback ref added mousemove/mouseleave/click with no removeEventListener
Evidence: source inspection of MagicBento.tsx (section 17 leak checklist)
Change: InteractiveBentoCard + useEffect cleanup; no bind when interactions are disabled
After: type-check / lint / build (see validation)
Measured impact: Not measured in this environment
```

No other code changes in this phase. Previous-pass mobile/desktop splits were left intact.

---

## Before vs After

| Item | Previous pass | This verification |
|---|---|---|
| Home First Load JS | 194 kB | 194 kB (no regression) |
| Shared JS | 102 kB | 102 kB |
| Three in `GET /` HTML | not claimed via HTML fetch | **Confirmed absent** |
| Three first-load chunks | not in page/layout | **Confirmed** (`WebGLRenderer` count = 0) |
| CTA 404 | `/Group 24.png` unused in markup | `/bgcta.avif` 200; Group 24 not in HTML |
| Device FPS / CWV | not measured | still not measured |
| MagicBento leak | dormant | cleaned up |

---

## Remaining Risks

1. **Real-device FPS is still unknown.** Mid-range Android / iPhone must be checked with `npm run start` (not `next dev`).
2. Desktop WebGL upgrade, ChromaGrid spotlight, and featured pointer-follow need a **manual** desktop pass.
3. Hydration is designed around `useSyncExternalStore`; React DevTools hydration warnings were **not observed** here because no browser was attached.
4. Localhost TTFB does not represent Vercel/edge TTFB.

---

## Final Recommendation

Stop further speculative optimization.

The previous pass already removed the main mobile costs (blur, WebGL, particles, char typing, pointer systems). This pass confirmed:

- production bundle did not regress,
- Three.js is not on the homepage critical path,
- capability detection is hydration-safe,
- one real listener leak is fixed.

**Next step (human):** on a mid-range Android, run `npm run start`, DevTools Network (confirm no `b536a0f1` / three chunk), then scroll Hero → Stats → Skills → Why choose → CTA/Footer. Only reopen this work if that session shows stutter, a Three.js request, or a console/hydration error.

---

## Validation commands

```text
npm run type-check
npm run lint
npm run build
npx next start -p 3001
```

Production server: Ready in 645ms on port 3001. Homepage HTTP 200.
