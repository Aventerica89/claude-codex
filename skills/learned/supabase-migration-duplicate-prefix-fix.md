# Supabase CLI: Pushing Migrations with Duplicate Numeric Prefixes

## Problem

The `supabase db push` command fails when the local `supabase/migrations/` directory contains multiple files with the same numeric prefix (e.g., `005_create_tables.sql` and `005_app_todos.sql`). The CLI tries to apply both and fails if one is already on the remote.

This happens when migrations were applied manually to the remote DB but tracked locally with overlapping sequence numbers.

## Error

```
Applying migration 005_create_maintenance_tables.sql...
ERROR: relation "maintenance_command_types" already exists (SQLSTATE 42P07)
```

## Solution: Temporary Move + Repair

1. **Move the conflicting files out** of `supabase/migrations/` temporarily:
   ```bash
   mkdir -p /tmp/migration-hold
   mv supabase/migrations/005_*.sql supabase/migrations/006_*.sql /tmp/migration-hold/
   ```

2. **Revert** their remote history entries (so the CLI doesn't complain about missing local files):
   ```bash
   supabase migration repair --status reverted 005
   supabase migration repair --status reverted 006
   ```

3. **Push** only the new migration:
   ```bash
   echo "y" | supabase db push --include-all
   ```

4. **Restore** the files and re-mark them as applied:
   ```bash
   mv /tmp/migration-hold/* supabase/migrations/
   supabase migration repair --status applied 005
   supabase migration repair --status applied 006
   ```

## Key Details

- `supabase migration repair` takes the numeric prefix only (e.g., `005`, not the full filename)
- The prefix must be purely numeric (no letters like `005b`)
- `--include-all` is needed when local migrations exist before the last remote migration
- This doesn't affect the actual DB schema — only the migration history table

## Prevention

Avoid duplicate numeric prefixes in migration files. Use unique sequential numbers or timestamp-based naming (Supabase default for `supabase migration new`).

## Learned From

jb-cloud-app-tracker session (2026-02-13): Adding `009_cloudflare_worker_name.sql` when migrations 005 and 006 each had two local files.
