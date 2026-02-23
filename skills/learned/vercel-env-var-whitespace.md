# Vercel Env Var Trailing Whitespace Breaks Module-Level Clients

**Extracted:** 2026-02-23
**Context:** Vercel builds failing on newly added routes that use Redis, DB, or any client initialized at module level via env vars

## Problem

When env vars are added to Vercel via `echo "value" | vercel env add`, the shell appends a trailing `\n`. Clients like Upstash Redis that call `Redis.fromEnv()` at module evaluation time will throw:

```
Error [UrlError]: Upstash Redis client was passed an invalid URL. Received: "https://..."
Error: Failed to collect page data for /api/some-new-route
```

Build cache masks the issue — previously compiled routes are cached and not re-evaluated. Only newly added routes compile fresh and hit the bad env var. This makes it look like your new route caused the build failure when it's actually a pre-existing env var issue.

## Solution

Always use `printf` (not `echo`) when piping values into `vercel env add`:

```bash
# WRONG — adds trailing newline
echo "https://my-redis.upstash.io" | vercel env add UPSTASH_REDIS_REST_URL production

# CORRECT — no trailing newline
printf 'https://my-redis.upstash.io' | vercel env add UPSTASH_REDIS_REST_URL production
```

To fix existing bad env vars:
```bash
vercel env rm UPSTASH_REDIS_REST_URL production --yes
printf 'https://my-redis.upstash.io' | vercel env add UPSTASH_REDIS_REST_URL production
# Then retrigger deploy:
git commit --allow-empty -m "chore: retrigger deploy" && git push
```

## When to Use

- Any Vercel build failure on a new route with "Failed to collect page data"
- Error mentions URL/token validation on a client that initializes at module level
- Failure only affects newly added routes (not existing ones)
- Grep for `Redis.fromEnv()`, `new PrismaClient()`, or similar module-level client inits
