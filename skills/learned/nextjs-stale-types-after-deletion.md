# Next.js Stale .next/types After Route File Deletion

**Extracted:** 2026-02-16
**Context:** Next.js App Router projects where route files are deleted during refactoring

## Problem
When you delete a route file (e.g., `src/app/(dashboard)/flowsheets/[id]/page.tsx`), Next.js leaves behind phantom type declarations in `.next/types/` and `.next/dev/types/`. These stale types cause TypeScript errors referencing files that no longer exist, and `npm run typecheck` fails even though the code is correct.

## Solution
After deleting route files, clear the generated type directories:

```bash
rm -rf .next/types .next/dev/types
```

Then re-run the dev server or typecheck. Next.js will regenerate only the types for existing routes.

## Example
```bash
# Delete old route
rm src/app/(dashboard)/flowsheets/[id]/page.tsx

# TypeScript fails with phantom type reference
npm run typecheck  # ERROR: Cannot find module for deleted route

# Fix: clear stale types
rm -rf .next/types .next/dev/types

# Now it works
npm run typecheck  # PASS
```

## When to Use
- After deleting any file under `src/app/` (pages, layouts, route handlers)
- When TypeScript errors reference paths to deleted files
- During major refactors that reorganize the route structure
