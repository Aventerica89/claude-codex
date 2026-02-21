# Supabase RLS Infinite Recursion (Error 42P17)

**Extracted:** 2026-02-21
**Context:** Supabase projects using Row Level Security with role-based access checks

## Problem

Postgres error `42P17 — infinite recursion detected in policy for relation "profiles"`.

Any query that JOINs or embeds the `profiles` table (e.g. `states` with `profiles(email, full_name)`) silently returns `{ data: null, error: { code: '42P17', ... } }`. The entire parent query fails, not just the join.

Root cause: an RLS policy on `profiles` that queries `profiles` itself to check the user's role:

```sql
-- BROKEN: recursive
CREATE POLICY "admin all profiles" ON profiles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

When PostgREST evaluates this policy, it queries `profiles` → triggers policy evaluation → queries `profiles` → infinite loop.

## Solution

Replace the recursive policy with a `SECURITY DEFINER` function. The function runs with postgres-level privileges, bypassing RLS when it executes the role check:

```sql
CREATE OR REPLACE FUNCTION public.requesting_user_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "admin all profiles" ON profiles;

CREATE POLICY "admin all profiles" ON profiles FOR ALL
  USING (public.requesting_user_is_admin());
```

For other roles, create equivalent functions:
```sql
CREATE OR REPLACE FUNCTION public.requesting_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;
```

## Diagnosis Pattern

Symptom: page shows 0 rows despite data existing in DB. Admin seed/write API using service role works fine (service role bypasses RLS). Regular user queries return empty.

Debug step: surface the Supabase error in the rendered page:
```typescript
const { data: rows, error } = await supabase.from('table').select(...)
// Temporarily render error on page:
{error && <div>{error.code} — {error.message}</div>}
```

`42P17` = infinite recursion. Always caused by a policy on table X that queries table X.

## When to Use

- Any time you write a Supabase RLS policy that checks a role stored in the same table being protected
- When a query silently returns null/empty but you know the data exists
- When using patterns like `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` inside a profiles policy
