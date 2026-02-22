# shadcn Card Compact Override (py-0)

**Extracted:** 2026-02-22
**Context:** Using shadcn Card as a compact list item row instead of a full content card

## Problem

The shadcn `Card` component has `py-6` (24px) and `gap-6` (24px) in its base styles. When you skip `CardHeader` and use `CardContent` directly with its own padding (e.g., `py-3`), the Card's `py-6` stacks with CardContent's padding, producing 36px+ of vertical space per card. Cards look bloated for list-item patterns.

## Solution

Add `py-0` to the Card's className to zero out the base padding. Let CardContent control all padding.

```tsx
// WRONG: Card py-6 + CardContent py-3 = bloated
<Card>
  <CardContent className="py-3 px-4">...</CardContent>
</Card>

// CORRECT: Override Card padding, CardContent controls it
<Card className="py-0">
  <CardContent className="py-3 px-4">...</CardContent>
</Card>
```

## When to Use

- Card used as a clickable list row (e.g., Getting Started steps, nav items)
- Card wrapping only CardContent (no CardHeader/CardFooter)
- Any Card where the default 24px top/bottom feels too generous

## Notes

- Cards using CardHeader work fine with the default `py-6` because CardHeader has no vertical padding of its own
- This is specific to the shadcn Card component (check `ui/card.tsx` base styles if unsure)
- Keep CardContent padding on the 4px spacing grid (py-2 = 8px, py-3 = 12px, py-4 = 16px)
