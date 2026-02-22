---
name: hig-mobile-pass
status: deprecated
deprecated_by: hig-ui-pass
description: "DEPRECATED: Use /hig-ui-pass instead. hig-mobile-pass has been superseded by the full-platform hig-ui plugin which covers Mobile, iPad, Desktop, CSS token audit, PWA asset generation, and web standards."
---

> **Deprecated.** Use `/hig-ui-pass` instead — it supersedes this skill with full-platform coverage (Mobile, iPad, Desktop), CSS token master control, optional PWA asset generation, web standards (Vercel WIG), and design consistency audit.

# HIG Mobile Pass

Full Apple HIG mobile compliance pass for web PWAs. Produces native-feel results by anchoring Sosumi live docs to your project's specific token system and nav pattern.

## Prerequisites

If `.claude/apple-design-context.md` does not exist in the project root, run `/hig-project-context` first and commit the output before proceeding. This file is what makes the pass project-specific rather than generic.

## Step 1 — Load Context

```
Read .claude/apple-design-context.md
```

This establishes your platform targets, design tokens, nav architecture, and PWA compliance status before any HIG rules are applied.

## Step 2 — Fetch HIG Docs via Sosumi

Fetch these specific pages (not broad search — specific paths):

```
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/tab-bars
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/layout
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/touchscreen-gestures
mcp__sosumi__fetchAppleDocumentation path: design/human-interface-guidelines/launching
```

Fetch all four in parallel before making any changes.

## Step 3 — Compliance Checklist

Apply fixes in this order, cross-referencing the context file tokens:

**Touch & Interaction**
- [ ] All interactive targets ≥ 44px (HIG minimum — check tab items, buttons, cards)
- [ ] `-webkit-tap-highlight-color: transparent` on all interactive elements
- [ ] Swipe gestures use `touch-action: pan-y` where needed

**Layout & Safe Areas**
- [ ] Tab bar uses `--tab-bar-height` token + `padding-bottom: env(safe-area-inset-bottom)`
- [ ] Body has `padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 20px))`
- [ ] No fixed `height` on tab bar that also has `padding-bottom: env(...)` — they conflict

**Scroll & Overscroll**
- [ ] `overscroll-behavior: none` on `html` and `body` (prevents pull-to-refresh in standalone mode)
- [ ] Scrollable containers use `-webkit-overflow-scrolling: touch`

**Tab Bar**
- [ ] Label size ≥ 11px (HIG minimum — `0.6875rem`, use `--tab-bar-label-size` token)
- [ ] Active indicator uses `position: relative` on parent (not absolute without relative context)
- [ ] 4 primary tabs max; overflow to More if needed

**PWA Manifest**
- [ ] Has `id`, `scope`, `display_override: ["standalone"]`
- [ ] `apple-mobile-web-app-capable` + `mobile-web-app-capable` meta in `<head>`
- [ ] Maskable icons: 192px + 512px
- [ ] Splash screens: 4 iPhone + 4 iPad sizes minimum

**CSS Baseline (add to `globals.css` if missing)**
```css
@media (display-mode: standalone) {
  /* installed PWA specific styles */
}

html, body {
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}
```

## Step 4 — Update Context File

After the pass, update the PWA compliance checklist in `.claude/apple-design-context.md` to reflect resolved items. Commit the updated file.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Fixed `height` + `padding-bottom: env(...)` on same element | Remove fixed height, use `min-height` |
| Generic HIG advice not matching your token system | Always read context file first |
| Fetching Sosumi without specificity | Use exact paths listed in Step 2 |
| Skipping `/hig-project-context` when no context file exists | Context file = what makes it project-specific |
| Tab label at `10px` | HIG minimum is `11px` — use `0.6875rem` |
