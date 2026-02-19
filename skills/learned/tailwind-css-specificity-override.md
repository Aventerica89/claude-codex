# Tailwind Utility Overridden by Explicit CSS Class Rule

**Extracted:** 2026-02-19
**Context:** Any React/Astro/web project using Tailwind where a utility class has no visible effect

## Problem

You add a Tailwind utility class to an element (e.g. `text-cyan-400`) and deploy, but the
visual style doesn't change. The element still shows the old color/style.

DevTools inspection reveals the Tailwind utility IS in the class list, but is crossed out in the
styles panel — overridden by a later `.class-name { color: ... }` rule in a stylesheet.

Root cause: CSS cascade — same specificity (both are single-class selectors), but the explicit
CSS declaration appears later in the stylesheet (higher source index = wins).

## Solution

### Option 1: Use Tailwind `!` prefix (generates `!important`)

```html
<!-- Was: text-cyan-400 (overridden by .section-label { color: #f97316 }) -->
<h2 class="section-label !text-cyan-500">...</h2>
```

Tailwind v3+ supports `!` prefix on any utility to add `!important`.
This beats any explicit class rule that doesn't also use `!important`.

### Option 2: Edit the CSS class directly

If the explicit CSS class is in a stylesheet you own (e.g. `src/styles/global.css`):

```css
/* Was: .section-label { color: #f97316; } */
.section-label { color: theme('colors.cyan.500'); }
```

Prefer this approach when the CSS class is in the same project — cleaner, no specificity battle.

### Option 3: Increase Tailwind specificity

Wrap with a custom selector in `tailwind.config.js`:

```js
// tailwind.config.js
module.exports = {
  important: '#app', // or true for all utilities
}
```

## Debugging Steps

1. Open DevTools > Elements > Computed styles
2. Look for the property value with a strikethrough — that's the overridden rule
3. Click on it to see which CSS rule is winning (file + line number)
4. Check if it's an explicit `.class-name { color: ... }` rule vs Tailwind

Grep to find conflicting CSS:
```bash
grep -rn "section-label\|the-class-name" src/styles/
```

## When to Use

- Tailwind color/background/font utility has no visible effect after applying
- DevTools shows the class is applied but the property is crossed out
- `text-{color}`, `bg-{color}`, `font-{weight}` utilities not working as expected
- AI agent adds Tailwind classes but visual doesn't update

## Notes

- This pattern is extremely common in projects that mix Tailwind utilities with custom CSS
- Astro component styles, CSS Modules, and global stylesheets are frequent sources of conflict
- The `!` prefix approach is quick but can become hard to maintain — prefer editing CSS directly when possible
- In Agency Mode: instruct the AI agent to grep CSS files for competing class declarations before
  adding Tailwind utilities, and use `!` prefix when needed
