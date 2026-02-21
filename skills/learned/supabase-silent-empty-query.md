# Supabase Query Returns Empty — Silent Error Debugging

**Extracted:** 2026-02-21
**Context:** Supabase queries in Next.js Server Components that return null/empty without visible errors

## Problem

A page shows 0 data rows. Seed/write routes confirm data exists in the DB. The Supabase query uses destructuring like:

```typescript
const { data: rows } = await supabase.from('states').select(...)
const items = rows ?? []  // always [], error ignored
```

The error is swallowed — `data` is null when there's a DB error, but the code falls back to `[]` silently.

## Diagnosis Steps

1. **Add error to destructure and render it on the page:**
```typescript
const { data: rows, error } = await supabase.from('states').select(...)
// Temporary debug banner:
{error && (
  <div style={{ background: 'red', color: '#fff', padding: 8, fontFamily: 'monospace' }}>
    DB ERROR: {(error as any).code} — {(error as any).message}
  </div>
)}
{!error && <div style={{ background: 'green', color: '#fff', padding: 8 }}>
  DB OK — {(rows ?? []).length} rows
</div>}
```

2. **Check if service-role writes succeed but user reads fail** → RLS issue
3. **Common error codes:**
   - `42P17` → infinite recursion in RLS policy
   - `42501` → insufficient privilege (missing RLS policy for SELECT)
   - `PGRST116` → PostgREST schema cache issue
   - `42703` → column does not exist (schema mismatch)

## Root Causes by Symptom

| Symptom | Likely Cause |
|---------|-------------|
| 0 rows, admin writes work | RLS blocking SELECT for user |
| 0 rows, error 42P17 | Recursive RLS policy (policy queries same table) |
| 0 rows, error 42501 | RLS enabled but no SELECT policy |
| 0 rows, no error, query clean | Data genuinely absent; check seed applied correctly |
| Correct data in seed route but 0 on page | Supabase .update() with no matching WHERE = silent 0 rows |

## Prevention

Always check row count in mutation routes:
```typescript
const { data, error } = await supabase
  .from('states')
  .update(updates)
  .eq('code', code)
  .select('code')  // returns updated rows
if (error) errors.push(...)
else updatedCount += data?.length ?? 0
// Return 500 if updatedCount === 0 — no rows matched the WHERE clause
```

## When to Use

Any time a Supabase-powered page shows empty data that you believe should exist.
