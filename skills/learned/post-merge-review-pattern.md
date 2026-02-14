# Post-Merge Review Pattern

**Extracted:** 2026-02-13
**Context:** After merging a large branch (especially from claude.ai or external PRs) without incremental review

## Problem

Large merges (40+ files, 3000+ lines) that go straight to main without review can introduce:
- Security vulnerabilities (shared production bindings, header injection)
- Missing input validation at API boundaries
- Debug code left in production (console.log, dev-only buttons)
- HMR resource leaks (polling intervals without dispose)

## Solution

Run a systematic post-merge review with this priority order:

1. **CRITICAL first** — Security issues that expose production data or allow injection
2. **Quick wins** — Console.log removal, dev-only gating, resource cleanup (5 min each)
3. **API hardening** — Add Zod validation at every API boundary with `.strict()` on patch schemas
4. **Disable risky features** — If a feature shares production resources unsafely, disable it with `if: false` rather than ripping it out. Preserve for future proper implementation.

## Key Techniques

### Zod `.strict()` on PATCH schemas
Prevents arbitrary field injection via partial updates:
```typescript
const PatchSchema = z.object({
  title: z.string().max(500).optional(),
  // ... allowed fields only
}).strict(); // Rejects unknown fields
```

### Content-Disposition sanitization
```typescript
const safeName = filename.replace(/["\r\n\\]/g, '_');
```

### HMR dispose for module-level side effects
```typescript
const meta = import.meta as unknown as { hot?: { dispose: (cb: () => void) => void } };
if (meta.hot) {
  meta.hot.dispose(() => { stopPolling(); });
}
```

### `if: false` disable pattern for GitHub Actions
```yaml
jobs:
  preview:
    # DISABLED: reason here
    if: false
```

## When to Use

- After merging any branch with 20+ files
- After accepting changes from claude.ai sessions
- After merging external contributor PRs
- Any merge that wasn't reviewed commit-by-commit
