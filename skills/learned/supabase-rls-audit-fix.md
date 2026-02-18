# Supabase RLS Audit and Fix via Management API

**Extracted:** 2026-02-18
**Context:** Fixing Supabase Security Advisor warnings (RLS not enabled) across multiple projects without using the dashboard or psql

## Problem

Supabase Security Advisor flags tables without Row Level Security (RLS). Fixing requires SQL access, but:
- The Supabase CLI `db execute` doesn't exist in v2.72+
- `db dump` requires linking to a project directory
- The project's REST API may be down (e.g., during restore from pause)
- You may need to fix multiple projects at once

## Solution

Use the Supabase Management API directly. It works even when the project's PostgREST is down.

### 1. Get the access token from macOS Keychain

```bash
security find-generic-password -a supabase -w
# Returns: go-keyring-base64:<base64_encoded_token>
echo "<base64_part>" | base64 -d
# Returns: sbp_xxxxx (the actual token)
```

### 2. Find tables missing RLS

```bash
curl -s 'https://api.supabase.com/v1/projects/{ref}/database/query' \
  -H 'Authorization: Bearer sbp_xxxxx' \
  -H 'Content-Type: application/json' \
  -d '{"query": "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = '\''public'\'' AND rowsecurity = false;"}'
```

### 3. Enable RLS + add service role policy

```bash
curl -s 'https://api.supabase.com/v1/projects/{ref}/database/query' \
  -H 'Authorization: Bearer sbp_xxxxx' \
  -H 'Content-Type: application/json' \
  -d '{"query": "ALTER TABLE table_name ENABLE ROW LEVEL SECURITY; CREATE POLICY \"Allow service role full access\" ON table_name FOR ALL USING (true) WITH CHECK (true);"}'
```

### 4. Verify fix

Re-run the query from step 2. Should return `[]`.

## Key Details

- **Management API always works** — even during project restore/unpause when DNS is still NXDOMAIN
- **`USING (true)` policy** — service role key bypasses RLS anyway, but having a policy prevents accidentally locking yourself out
- **List all projects:** `supabase projects list` (CLI must be logged in)
- **Check project status:** `GET https://api.supabase.com/v1/projects/{ref}` — look for `status: "ACTIVE_HEALTHY"`

## Also: Supabase Free-Tier Auto-Pause

- Projects pause after ~1 week of inactivity
- DNS record is REMOVED (NXDOMAIN) — not just connection refused
- Un-pause from dashboard, then wait 5-10 min for DNS propagation
- Management API works immediately; REST API takes longer

## When to Use

- Supabase Security Advisor email arrives
- Setting up a new Supabase project (audit all tables)
- Debugging 502s from Supabase REST API (could be paused project)
- Need to run SQL on Supabase without psql or dashboard access
