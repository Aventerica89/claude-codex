# Next.js Image Flex Stretch Fix

**Extracted:** 2026-02-22
**Context:** Next.js Image component stretching vertically inside flex containers

## Problem

Next.js `Image` with `width` and `height` props but no CSS size constraints stretches when placed inside a flex container. The `width`/`height` props set intrinsic size for layout shift prevention but don't constrain rendered dimensions in flex contexts.

## Solution

Always pair `width`/`height` props with explicit Tailwind size classes:

```tsx
// WRONG: stretches in flex layout
<Image src="/icon.png" width={28} height={28} className="shrink-0 rounded-full" />

// CORRECT: CSS classes lock the dimensions
<Image src="/icon.png" width={28} height={28} className="h-7 w-7 shrink-0 rounded-full" />
```

## When to Use

- Image used as an avatar or icon inside a flex row
- Image inside `items-start` or `items-stretch` flex containers
- Any Image that appears taller/wider than expected
