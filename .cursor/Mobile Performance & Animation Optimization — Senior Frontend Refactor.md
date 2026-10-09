You are acting as a senior frontend performance engineer reviewing this existing production portfolio codebase.

Repository:
https://github.com/sahinpro/Portfolio-by-sahinpro

The main issue is:

> The website feels noticeably slow and laggy on mobile devices. Scrolling is not consistently smooth, animations drop frames, and some visual effects feel heavy/janky.

Do NOT redesign the website.
Do NOT remove the visual identity.
Do NOT blindly remove animations.

The goal is to preserve the existing premium visual experience while making the website feel extremely smooth on real mobile devices, especially mid-range Android phones.

## Current stack

- Next.js 15.5.19
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- Lottie
- Supabase
- next/font/local

## Important existing areas

Audit these first:

- src/app/globals.css
- src/app/layout.tsx
- src/views/HomePage.tsx
- src/components/effects/AuroraBackground.tsx
- src/components/effects/ChromaGrid.tsx
- src/components/effects/MagicBento.tsx
- src/components/motion/TextEffect.tsx
- src/components/motion/TextLoop.tsx
- src/components/Header/Header.tsx
- src/components/Header/MobileMenu.tsx
- src/screens/sections/HeroSection/*
- src/components/sections/LazySection.tsx
- all components used by the homepage sections

---

# PHASE 1 — PERFORMANCE AUDIT

Before changing code, inspect the complete codebase and identify:

1. Every continuous animation.
2. Every requestAnimationFrame loop.
3. Every mousemove/pointermove/scroll listener.
4. Every Framer Motion animation.
5. Every `backdrop-filter`.
6. Every CSS `filter: blur()`.
7. Every large box-shadow.
8. Every animated box-shadow.
9. Every animated gradient.
10. Every WebGL/Three.js renderer.
11. Every Lottie animation.
12. Every component using viewport/scroll-triggered animation.
13. Every component creating DOM nodes dynamically.
14. Every component calling `getBoundingClientRect()` repeatedly.
15. Every component updating CSS custom properties on pointer movement.
16. Every component causing React state updates during scroll or pointer movement.
17. Large images and unoptimized images.
18. Components that can be server-rendered instead of client-rendered.
19. Components unnecessarily included in the initial JavaScript bundle.
20. Any duplicate or unnecessary animation libraries/utilities.

Do not guess.

Trace actual imports and component usage.

---

# PHASE 2 — IDENTIFY MOBILE BOTTLENECKS

Treat mobile as a separate performance target.

Create a table in the audit:

| Area | Current implementation | Why expensive | Mobile impact | Priority | Recommended fix |
|---|---|---|---|---|---|

Use priorities:

- P0 = severe frame-rate problem
- P1 = major performance issue
- P2 = moderate optimization
- P3 = cleanup/minor

Pay special attention to:

### A. Backdrop blur

Audit all:

- backdrop-blur
- backdrop-filter
- large blur radius
- overlapping translucent layers

The current global `.glass-card` uses a very large blur radius.

Do not keep expensive blur everywhere just because it looks good.

Use a mobile-specific reduced blur or remove blur from large surfaces.

Prefer:

- solid/semi-transparent backgrounds
- small blur areas
- fewer overlapping glass layers

instead of huge full-surface blur.

---

### B. AuroraBackground

Keep the desktop WebGL experience if it performs well.

For mobile:

- NEVER initialize Three.js/WebGL.
- NEVER import Three.js in the initial mobile bundle.
- Use a lightweight CSS/static fallback.
- Avoid continuously animated large gradients on low-end devices.
- Consider making the mobile aurora static or very subtly animated.
- Respect `prefers-reduced-motion`.

Do not simply hide WebGL after loading it.

The browser should not download/initialize unnecessary WebGL code on mobile.

---

### C. TextEffect

Audit character-level animation.

Character-by-character animation creates many DOM/motion nodes.

On mobile:

- Prefer word-level animation.
- Prefer opacity + transform.
- Avoid blur animation.
- Avoid animating dozens of characters simultaneously.
- Avoid unnecessary Framer Motion instances.

If `per="char"` is currently used in important hero text, create a mobile-safe behavior without changing the desktop appearance.

---

### D. MagicBento

This is a major audit target.

Inspect:

- particles
- GlobalSpotlight
- mousemove listeners
- getBoundingClientRect()
- dynamic DOM particle creation
- Framer Motion animation calls
- CSS custom property updates
- backdrop-filter
- box shadows

On mobile, do NOT mount unnecessary desktop interaction systems.

Instead of:

```text
mount heavy component
↓
detect mobile
↓
disable effects
```

prefer:

```text
detect capability
↓
render lightweight mobile implementation
```

Desktop can keep rich interactions.

Mobile should render a simplified visual card/grid.

---

### E. ChromaGrid

Audit the pointer interaction architecture.

Avoid continuous pointer-driven animation on mobile.

For desktop:

- keep spotlight interaction if performant
- minimize layout reads
- avoid repeatedly calling getBoundingClientRect()
- avoid creating competing animation controllers on every pointer event

If necessary, use requestAnimationFrame throttling or direct MotionValues.

For mobile:

- render a static/simple version.

---

### F. Header

The header currently uses glass/backdrop blur on mobile.

Evaluate whether this is actually necessary.

The mobile header should prioritize:

- fixed positioning
- simple semi-transparent background
- minimal blur
- transform/opacity animations only

Avoid animating expensive properties.

---

### G. Scroll animations

Find every scroll-based animation.

Do not use React state for values that change every frame.

Prefer:

- MotionValues
- CSS transforms
- IntersectionObserver for trigger-only animations
- `whileInView`
- GPU-friendly `transform` and `opacity`

Avoid:

- width animation
- height animation
- top/left animation
- box-shadow animation
- large blur animation
- layout-affecting properties

---

# PHASE 3 — MOBILE PERFORMANCE ARCHITECTURE

Introduce a small capability utility/hook if necessary.

Example concept:

```ts
usePerformanceMode()
```

It should distinguish:

- reduced motion
- mobile/touch
- low-power/mobile device where practical
- desktop pointer device

Do NOT rely only on viewport width.

Use capability detection where appropriate:

- pointer
- hover
- reduced motion
- device memory where supported
- hardware concurrency where useful

Do not use unreliable UA sniffing.

Create a small reusable capability layer rather than scattering `window.innerWidth` checks everywhere.

---

# PHASE 4 — ANIMATION RULES

Apply these rules throughout the public site:

### Prefer

```css
transform
opacity
```

### Use carefully

```css
filter
clip-path
```

### Avoid animating

```css
width
height
top
left
margin
padding
box-shadow
background
```

unless there is a strong reason.

Never add `will-change` everywhere.

Only use it for elements that genuinely need compositor promotion.

---

# PHASE 5 — MOBILE MOTION BUDGET

Define a clear mobile animation budget.

Mobile should have:

- fewer simultaneous animations
- shorter animation duration
- less blur
- no cursor-following effects
- no hover effects
- no particle systems
- no WebGL
- no continuous expensive background animation
- no character-level text animation unless very small

Keep the design premium through:

- opacity
- translateY
- scale
- subtle reveal
- static gradients
- borders
- lightweight shadows

---

# PHASE 6 — IMAGE PERFORMANCE

Audit all images.

For every public image:

- use Next/Image where appropriate
- provide width/height or responsive sizing
- use lazy loading below the fold
- use priority only for actual LCP images
- use modern formats
- avoid loading unnecessarily large images
- avoid duplicate image requests

Do not optimize images blindly; inspect actual usage first.

---

# PHASE 7 — JAVASCRIPT / BUNDLE

Inspect the production bundle.

Look for:

- Three.js
- Framer Motion
- Lottie
- icon libraries
- unused dependencies
- duplicated libraries
- components that can be dynamically imported

Important:

Desktop-only heavy libraries should not unnecessarily increase the mobile critical path.

Use dynamic imports where appropriate.

Do NOT create dozens of tiny dynamic imports that make the app worse.

Optimize based on actual bundle analysis.

---

# PHASE 8 — RENDERING

Identify components that are unnecessarily `"use client"`.

Where possible:

- keep static content server-rendered
- move client boundaries downward
- isolate interactive components
- avoid making entire sections client components because one small child needs interactivity

Do not change architecture just for theoretical optimization; only make changes that improve real performance.

---

# PHASE 9 — CSS PERFORMANCE

Audit globals.css.

Pay special attention to:

- backdrop-filter
- filters
- gradients
- large shadows
- animated pseudo-elements
- global transitions
- expensive selectors
- unnecessary CSS variables
- animation rules

The goal is not to delete the design system.

Keep the visual language intact while reducing expensive rendering.

---

# PHASE 10 — ACCESSIBILITY

All optimizations must preserve:

```css
@media (prefers-reduced-motion: reduce)
```

For reduced-motion users:

- disable continuous animation
- disable decorative motion
- keep essential transitions minimal
- preserve content and functionality

---

# PHASE 11 — DO NOT MAKE THESE MISTAKES

Do NOT:

- remove all animations
- remove Framer Motion globally
- replace everything with CSS
- remove the Aurora just because it is animated
- remove the premium glass design entirely
- add `will-change: transform` everywhere
- add `translateZ(0)` everywhere
- use arbitrary `setTimeout` hacks
- add debounce to animation loops without understanding the interaction
- use `requestAnimationFrame` incorrectly
- move everything to client components
- blindly memoize every component
- blindly add React.memo/useMemo/useCallback
- sacrifice desktop visual quality
- introduce a new animation library unless absolutely necessary

---

# PHASE 12 — VALIDATION

After changes, run:

```bash
npm run type-check
npm run build
npm run lint
```

If lint script is incompatible with the current Next.js version, investigate and fix the script/config rather than ignoring the issue.

Use production mode for performance validation:

```bash
npm run build
npm run start
```

Do NOT judge performance only from `next dev`.

---

# PERFORMANCE ACCEPTANCE CRITERIA

Target real mobile UX:

### Scrolling

- scrolling should feel consistently smooth
- no obvious frame drops during normal scrolling
- no visible animation stutter

### Hero

- page should become interactive quickly
- no heavy animation competing with initial interaction
- code editor animation must not block scrolling

### Sections

- sections should animate when entering viewport
- avoid multiple heavy animations running simultaneously

### Mobile

Mobile must be treated as a first-class performance mode, not simply a smaller desktop layout.

---

# IMPORTANT: CREATE A PERFORMANCE REPORT

Before making changes, create:

```text
PERFORMANCE-AUDIT.md
```

Include:

1. Executive summary
2. Current architecture
3. Performance bottlenecks
4. Mobile-specific problems
5. Animation audit
6. Rendering audit
7. Bundle audit
8. Image audit
9. CSS/compositing audit
10. Priority matrix
11. Recommended fixes
12. Files affected
13. Before/after measurements
14. Validation checklist

For every major issue include:

```text
Problem
Evidence
Why it is expensive
Affected devices
Recommended solution
Expected impact
Risk
```

Do not claim a performance improvement unless it was actually measured.

---

# IMPLEMENTATION STRATEGY

Work in small safe phases:

Phase 1:
Audit + report only.

Phase 2:
Fix P0 issues.

Phase 3:
Fix P1 issues.

Phase 4:
Fix P2 issues.

Phase 5:
Bundle/image cleanup.

Phase 6:
Final performance validation.

After every phase:

```bash
npm run type-check
npm run build
```

Do not rewrite unrelated code.

Do not change the visual design unless the change is directly required for performance.

At the end provide:

- files changed
- issues fixed
- issues intentionally left unchanged
- performance measurements
- remaining risks
- recommended future improvements

The primary goal is:

> Keep the portfolio visually impressive on desktop, but make mobile feel fast, stable, responsive and genuinely smooth.