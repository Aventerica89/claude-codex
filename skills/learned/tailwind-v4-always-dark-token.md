# Tailwind v4 Always-Dark Component Token Pattern

**Extracted:** 2026-02-21
**Context:** shadcn/ui + Tailwind v4 projects where a component (sidebar,
top bar, drawer) is intentionally dark regardless of the app's light/dark theme

## Problem
A component meant to always be dark (e.g. a sidebar) ends up with
hardcoded `slate-900`/`slate-800` colors because the CSS token it
should use (`--sidebar`) is defined as light in `:root`:

```css
--sidebar: oklch(0.985 0.005 285);  /* nearly white */
```

So developers fall back to:
```
bg-slate-900 dark:bg-sidebar   ← workaround that reveals the root cause
```

## Solution
Set the component's tokens to the same dark value in BOTH `:root` and `.dark`.
The component then uses `bg-sidebar` with no `dark:` prefix — it's always dark.

```css
:root {
  --sidebar: oklch(0.175 0.02 285);           /* dark — intentional */
  --sidebar-accent: oklch(0.235 0.022 285);
  --sidebar-muted-foreground: oklch(0.627 0.015 285);
}
.dark {
  --sidebar: oklch(0.175 0.02 285);           /* identical — never inverts */
  --sidebar-accent: oklch(0.235 0.022 285);
  --sidebar-muted-foreground: oklch(0.627 0.015 285);
}
```

Then in the component, remove ALL `dark:` prefixes:
```
bg-sidebar               (not: bg-slate-900 dark:bg-sidebar)
text-sidebar-foreground  (not: text-white)
border-sidebar-border    (not: border-slate-800)
```

Also register new tokens in `@theme inline` to get Tailwind utilities:
```css
@theme inline {
  --color-sidebar-muted-foreground: var(--sidebar-muted-foreground);
}
```

## Example
WP Dispatch sidebar before/after:

Before (broken):
```tsx
<aside className="bg-slate-900 dark:bg-sidebar text-slate-300">
  <Link className="text-slate-400 hover:bg-slate-800 dark:bg-sidebar-accent/50 hover:text-white">
```

After (token-driven):
```tsx
<aside className="bg-sidebar text-sidebar-foreground">
  <Link className="text-sidebar-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
```

## Side Effects Fixed
This also eliminated a subtle bug: inactive nav items had
`dark:bg-sidebar-accent/50` without a `hover:` prefix, meaning
the hover background was permanently applied in dark mode.

## Diagnostic Signal
Any time you see `bg-[hardcoded] dark:bg-[token]` in a component,
that pattern signals the token isn't correctly defined in `:root`.

## When to Use
- Always-dark sidebars, top bars, drawers, or nav rails
- Always-light components (invert the approach — set token light in both)
- Branded elements that should never change color with theme
- Any shadcn/ui project where sidebar.tsx has hardcoded slate-* colors
