# Mobile Button Visibility: hidden vs opacity-0

**Extracted:** 2026-02-21
**Context:** Removing action buttons from mobile layout in Tailwind+React

## Problem

Buttons with `md:opacity-0 md:group-hover:opacity-100` are visible AND in layout flow on
phones (<768px). `md:` only fires at ≥768px. Causes horizontal row overflow when combined
with `min-w-[44px]` HIG touch targets.

## Solution

Use `hidden sm:flex` (display:none) instead of opacity-only for mobile removal.

- `hidden sm:flex` → element removed from flow on mobile, rendered on sm+ (≥640px)
- Combine with `md:opacity-0 md:group-hover:opacity-100` for desktop hover reveal
- For drag handles: always `hidden sm:flex` — touch drag-and-drop is unsupported

## Example

```tsx
// WRONG: button is visible on mobile AND occupies min-w-[44px] of space
<button className="shrink-0 min-w-[44px] min-h-[44px] md:opacity-0 md:group-hover:opacity-100">

// CORRECT: removed from flow on mobile, subtle hover reveal on desktop
<button className="hidden sm:flex shrink-0 items-center justify-center rounded p-2 md:opacity-0 md:group-hover:opacity-100">
```

## When to Use

- Hiding mobile action buttons (copy, delete, drag handle) to prevent overflow
- After adding HIG 44px touch targets and noticing horizontal scroll on phones
- Drag handles specifically: always hide — touch drag-and-drop is unsupported in browsers
- Rule: if the button **shouldn't exist** on mobile → `hidden`. If subtle on desktop → add opacity.

## Breakpoint Reference

| Prefix | Fires at | Typical use |
|--------|----------|-------------|
| `sm:` | ≥640px | Show on tablet+ |
| `md:` | ≥768px | Show on desktop+ |
| `hidden sm:flex` | hide <640px, show ≥640px | Remove from mobile flow |

## Real-World Context (VaporForge)

In `IssueCard.tsx`, a flex row had: drag handle (44px) + copy (44px) + title + badge + delete (44px).
Total exceeded ~343px phone width. Fix freed 132px by hiding 3 buttons below `sm:`.
