# Tailwind v4: Unlayered Custom CSS Overrides All Utilities

**Extracted:** 2026-02-22
**Context:** Tailwind v4 projects with custom CSS utilities in globals.css

## Problem

In Tailwind v4, utility classes live in `@layer utilities`. If you write a custom CSS class OUTSIDE any `@layer`, it has higher cascade priority than ALL Tailwind utilities — including responsive variants. This silently breaks responsive overrides.

```css
/* globals.css — OUTSIDE @layer */
.pb-safe-nav {
  padding-bottom: calc(3.5rem + env(safe-area-inset-bottom, 0px));
}
```

```tsx
{/* md:pb-6 is in @layer utilities — pb-safe-nav ALWAYS wins */}
<main className="pb-safe-nav md:pb-6">
```

On desktop, `md:pb-6` should override `pb-safe-nav` but doesn't — the unlayered class wins at every breakpoint.

## Solution

Scope custom utilities to the breakpoint where they should apply:

```css
/* Only applies on mobile — md:pb-6 works on desktop */
@media (max-width: 767px) {
  .pb-safe-nav {
    padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px));
  }
}
```

Or place the custom class inside `@layer utilities` so it has the same cascade priority:

```css
@layer utilities {
  .pb-safe-nav {
    padding-bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px));
  }
}
```

(Note: inside `@layer utilities`, source order and specificity determine the winner — responsive variants declared later will override correctly.)

## Key Difference from Tailwind v3

- **Tailwind v3**: All utilities are regular CSS rules. Custom classes compete on specificity + source order.
- **Tailwind v4**: Utilities are in `@layer utilities`. Unlayered CSS always beats layered CSS per the CSS cascade spec — regardless of specificity or source order.

## When to Use

- Adding custom utility classes in `globals.css` for a Tailwind v4 project
- Debugging responsive Tailwind classes that have no effect
- Any time a Tailwind utility seems "stuck" at one value across all breakpoints
- Safe area / PWA utilities that should only apply on mobile
