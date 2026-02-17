# CSS Grid Implicit Column Overflow on Mobile

**Extracted:** 2026-02-17
**Context:** Mobile-responsive grid layouts where items overflow viewport width despite parent constraints

## Problem

CSS Grid containers with responsive column classes like `grid gap-2 sm:grid-cols-2` have NO explicit columns on mobile (below the `sm` breakpoint). The implicit column track uses `auto` sizing, which resolves to `minmax(min-content, max-content)`. This lets grid items expand beyond their container if content (especially `font-mono` text or long strings) is wider than the viewport.

Symptoms:
- Cards/items extend past the right edge of the mobile viewport
- `overflow-x-hidden` on parent hides the scroll but cards are visually clipped
- Left padding appears correct, right side has no visible padding
- `truncate` class doesn't work because parent width is unconstrained

## Solution

1. **Add explicit `grid-cols-1`** to all responsive grids for the mobile (default) breakpoint:
   ```html
   <!-- BEFORE: implicit auto column on mobile -->
   <div class="grid gap-2 sm:grid-cols-2">

   <!-- AFTER: explicit minmax(0, 1fr) column on mobile -->
   <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
   ```

   Tailwind's `grid-cols-1` generates `grid-template-columns: repeat(1, minmax(0, 1fr))`. The `0` minimum is the key — it constrains items to the grid's width instead of letting them grow to content width.

2. **Add `min-w-0`** to grid items that contain text or flex children:
   ```html
   <div class="glass-card min-w-0 flex items-center">
   ```
   This overrides `min-width: auto` (the default on grid/flex items) which prevents shrinking below content size.

3. **Add `min-w-0`** to parent containers in the flex chain:
   ```html
   <div class="flex-1 w-full min-w-0 overflow-y-auto">
   ```

## Why overflow-x-hidden Is a Band-Aid

`overflow-x-hidden` clips the overflowing content but doesn't fix the underlying width issue. Cards are still wider than the viewport — they're just cut off on the right. The proper fix constrains content to actually fit within the viewport.

## Key Insight

| Sizing | CSS Generated | Min Width | Behavior |
|--------|--------------|-----------|----------|
| `grid` (implicit) | `auto` | `min-content` | Items can overflow container |
| `grid-cols-1` | `repeat(1, minmax(0, 1fr))` | `0` | Items constrained to grid width |

The difference is `auto` vs `0` as the minimum track size. `auto` = content determines width. `0` = container determines width.

## When to Use

- Any grid with responsive breakpoints (`sm:grid-cols-2`, `md:grid-cols-3`, etc.)
- Mobile layouts where content includes `font-mono`, long URLs, or any non-wrapping text
- When `truncate` class isn't truncating text on mobile
- When cards/items visually extend past the right viewport edge
- Anytime you see `overflow-x-hidden` as a "fix" for horizontal overflow in grids
