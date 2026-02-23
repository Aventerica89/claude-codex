---
name: hig-ui-pass
description: Full Apple HIG + web standards compliance pass covering Mobile, iPad, and Desktop. Replaces hig-mobile-pass. Covers CSS token audit, platform-specific checklists, PWA asset generation, web standards (Vercel WIG), and design consistency audit.
---

# HIG UI Pass — Full Platform + Web Standards

Full-platform Apple HIG + web standards compliance pass for Next.js PWAs. Covers Mobile, iPad, Desktop, CSS token master control, optional PWA asset generation, and web-standard guidelines.

---

## Phase 0 — Questionnaire (runs first, gates everything)

Ask all 5 questions before any implementation. Do not proceed until answered.

```
1. Platforms: [Mobile only / Mobile + iPad / All three (+ macOS Desktop)]
2. PWA assets: [Generate from logo / Already have icons / Skip]
3. Design consistency audit: [Yes / No]
4. Web standards layer (Vercel WIG): [Yes / No]
5. New project or existing app: [New / Existing]
```

Store answers — every subsequent phase references them to determine what runs.

---

## Phase 1 — Prerequisites

**Check for context file:**

```
Read .claude/apple-design-context.md
```

If the file does not exist → run `/hig-project-context` first, commit the output, then return here. This file makes all HIG guidance project-specific rather than generic.

**If PWA assets selected (Phase 0, Q2):**
Confirm logo file path. If no logo exists, ask. Note the background color (default: `--background` token value from globals.css).

---

## Phase 2 — Load Context + Fetch Docs (parallel)

```
1. Read .claude/apple-design-context.md
2. Fetch HIG docs in parallel — only fetch what's needed for selected platforms:
```

Mobile (always, if Mobile selected):
```
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/tab-bars
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/layout
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/touchscreen-gestures
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/launching
```

iPad (if Mobile + iPad or All three selected):
```
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/sidebars
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/multitasking
```

Desktop (if All three selected):
```
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/windows
```

---

## Phase 3 — CSS Token Master Control Audit (always runs)

The foundation. Everything else builds on this. Verify these 10 primitives exist and no component hardcodes their values inline.

**The 10 primitives (only hardcoded values in the entire app):**

```css
--space-unit: 0.25rem;           /* 4px base — all spacing derives */
--radius-base: 0.625rem;         /* 10px — all radii derive */
--tab-bar-height: 3.25rem;       /* 52px */
--top-bar-height: 3rem;          /* 48px */
--sidebar-width: 15rem;          /* 240px */
--tab-bar-label-size: 0.6875rem; /* 11px HIG minimum */
--breakpoint-lg: 1024px;         /* tablet to desktop threshold */
--brand-hue: [project value];
--brand-chroma: [project value];
--brand-lightness-base: [project value];
```

**Audit command:**

```bash
grep -rn 'w-60\|w-\[240\|h-\[52\|h-12\|h-16\|text-\[10px\]\|text-\[11px\]\|min-h-\[52' src/components/
```

Zero results = passing.

**Fix pattern:**

```tsx
// Before (hardcoded)
<aside className="w-60 bg-sidebar">
// After (token-driven)
<aside className="w-[var(--sidebar-width)] bg-sidebar">
// Or add to @theme inline for a Tailwind alias:
// --width-sidebar: var(--sidebar-width) → className="w-sidebar"
```

**TypeScript conventions (from iOS Best Practices, translated):**
- No magic numbers inline — all sizing must trace to a token
- `strict: true` in tsconfig, no `any` types
- Guard-style error handling: validate at the top of functions, return early
- `lowerCamelCase` for all JS identifiers; `PascalCase` for components and types

---

## Phase 4 — Mobile Compliance (runs if Mobile selected)

**Touch & Interaction**
- [ ] All interactive targets ≥ 44px (HIG minimum — check tab items, buttons, cards)
- [ ] `-webkit-tap-highlight-color: transparent` on all interactive elements
- [ ] Swipe gestures use `touch-action: pan-y`

**Layout & Safe Areas**
- [ ] Tab bar uses `--tab-bar-height` token + `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Body spacer: `calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 20px))`
- [ ] No fixed `height` + `padding-bottom: env(...)` on the same element (conflict — use `min-height`)

**Scroll**
- [ ] `overscroll-behavior: none` on `html` and `body`
- [ ] `-webkit-overflow-scrolling: touch` on scrollable containers

**Tab Bar**
- [ ] Label size `≥ 0.6875rem` (11px HIG minimum — use `--tab-bar-label-size` token)
- [ ] Active indicator parent has `position: relative`
- [ ] Max 4 primary tabs; overflow to More sheet

**PWA Manifest**
- [ ] Has `id`, `scope`, `display_override: ["standalone"]`
- [ ] `apple-mobile-web-app-capable` + `mobile-web-app-capable` meta tags in `<head>`
- [ ] `apple-mobile-web-app-status-bar-style: "black-translucent"` meta
- [ ] `apple-mobile-web-app-title` meta
- [ ] `theme-color` meta

**CSS Baseline (add to globals.css if missing):**

```css
html, body {
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}

@media (display-mode: standalone) {
  /* installed PWA styles */
}
```

---

## Phase 5 — iPad Compliance (runs if iPad or All selected)

- [ ] `lg` breakpoint (1024px) triggers sidebar — HIG sidebarAdaptable pattern
- [ ] Landscape ≥ 1024px: sidebar visible, bottom nav hidden
- [ ] Portrait < 1024px: bottom tab nav, mobile layout
- [ ] Touch targets still ≥ 44px (same requirement as iPhone)
- [ ] Stage Manager guard: no fixed full-screen assumptions, use `max-w-*` containers
- [ ] Single `lg` breakpoint handles the split — no custom iPad-specific media queries needed

---

## Phase 6 — Desktop Compliance (runs if All selected)

- [ ] Sidebar always visible, width driven by `--sidebar-width` token
- [ ] Hover states on all interactive elements (pointer device, not touch)
- [ ] Focus rings visible everywhere (`--ring` token applied, `outline` not removed without replacement)
- [ ] Keyboard navigation: logical Tab order, all actions reachable by keyboard
- [ ] Dense layout acceptable: padding can reduce vs mobile
- [ ] Window resize: no layout breaks at any width ≥ `lg`
- [ ] `@media (display-mode: standalone)` hides browser chrome on macOS PWA install

---

## Phase 7 — Web Standards Layer (runs if Vercel WIG selected)

**Note on contrast:** This skill uses APCA contrast, not just WCAG AA. APCA is more perceptually accurate and stricter. APCA compliance also satisfies WCAG AA — no conflict with HIG.

**Performance**
- [ ] Network latency budget: < 500ms for primary interactions
- [ ] Large lists use virtualization (> 100 items)
- [ ] Re-renders minimized: no unnecessary state causing full-page re-renders
- [ ] Images have explicit dimensions (prevent CLS)
- [ ] Font subsetting + `preconnect` for external fonts

**Forms**
- [ ] Enter key submits forms (not just button click)
- [ ] Labels activate inputs (not just placeholder text)
- [ ] Error messages inline below the relevant field (not top-of-form only)
- [ ] `autocomplete` attributes on all standard fields
- [ ] Password manager compatible (no disabling `autocomplete` on password fields)
- [ ] Correct `type` attribute on all inputs (`email`, `tel`, `number`, etc.)

**Interactions**
- [ ] Loading states for all async actions (no silent waits)
- [ ] Optimistic updates where appropriate (immediate feedback)
- [ ] Destructive actions require confirmation
- [ ] Keyboard shortcuts documented where applicable
- [ ] Tooltips on icon-only buttons

**Contrast**
- [ ] APCA contrast checked — more accurate than WCAG AA (and satisfies it)

**CSS**
- [ ] GPU-accelerated animations only: `transform`/`opacity` (not `top`/`left`/`width`)
- [ ] `prefers-reduced-motion` respected

---

## Phase 8 — PWA Asset Generation (runs if assets selected in Phase 0)

**Tool:** `npx pwa-asset-generator` (no global install required)

Confirm logo path from Phase 1, then run:

```bash
npx pwa-asset-generator <logo-path> public/icons \
  --background "<hex-value-of-background-token>" \
  --manifest public/manifest.json \
  --index src/app/layout.tsx \
  --splash-only false
```

**Outputs:**
- Icons: 192px, 512px, 180px apple-touch-icon, maskable 512px (`purpose: "any maskable"`)
- Splash screens: 4 iPhone + 4 iPad sizes
- Auto-updates `manifest.json` icon declarations
- Auto-injects `<link>` tags into `layout.tsx`

**Service worker caching pattern (from pwa-skeleton):**
- Network-first for fresh content; cache fallback for offline
- Pre-cache: `index.html` + core CSS/JS/fonts on SW install
- Cache versioning: `CACHE_VERSION = 'v1'` — increment to bust cache

---

## Phase 9 — Design Consistency Audit (runs if audit selected in Phase 0)

Uses `interface-design:audit` pattern — reads existing design system, checks for consistency. Does NOT redesign.

**Checks:**
- [ ] Color utilities use tokens (`bg-primary` not `bg-violet-500`)
- [ ] Spacing uses Tailwind scale (no arbitrary `[]` values unless mapping a token)
- [ ] Typography uses type scale (no arbitrary font sizes)
- [ ] Border radius uses token-derived classes
- [ ] Dark mode: all colors have `.dark` equivalents (no hardcoded `#hex` in JSX)
- [ ] Icon sizes consistent per context (sidebar icons same size, card icons same size)
- [ ] Logo/brand mark consistent: same asset in favicon, PWA icon, in-app header

**Key distinction:** Reports inconsistencies. Does NOT change design direction.

---

## Phase 10 — Update Context File

Update `.claude/apple-design-context.md`:
- Check off all resolved PWA compliance items
- Add logo file path if assets were generated in Phase 8
- Note any tokens added or changed in Phase 3

Commit the updated file with message: `chore: update apple-design-context after hig-ui-pass`

---

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Fixed `height` + `padding-bottom: env(...)` on same element | Remove fixed height, use `min-height` |
| Generic HIG advice not matching your token system | Always read context file first (Phase 1) |
| Fetching Sosumi without specificity | Use exact paths listed in Phase 2 |
| Skipping `/hig-project-context` when no context file exists | Context file = what makes it project-specific |
| Tab label at `10px` | HIG minimum is `11px` — use `0.6875rem` |
| Using WCAG AA only for contrast | Use APCA — stricter and APCA compliance satisfies WCAG AA |
| Hardcoded px values in components | All sizing must trace to a CSS token (Phase 3 audit) |
