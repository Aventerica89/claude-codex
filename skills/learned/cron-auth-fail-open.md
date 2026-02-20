# Cron/Webhook Auth Fail-Open Bug

**Extracted:** 2026-02-19
**Context:** Next.js cron endpoint in Clarity — auth bypassed when CRON_SECRET env var not set

## Problem

`if (secret) { check }` is **fail-open**: if the env var is missing, the entire auth block is skipped and the route is publicly accessible.

```typescript
// ❌ WRONG — fails open when CRON_SECRET is not set
const cronSecret = process.env.CRON_SECRET
if (cronSecret) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
}
// If CRON_SECRET is missing → this runs for anyone
```

**Impact:**
- Any unauthenticated request can trigger the operation
- DoS vector: exhaust third-party API rate limits (Google, Todoist)
- Confirms account/user existence
- Expensive compute triggered for free

## Solution

**Fail closed** — treat a missing secret as a misconfiguration, not permission to proceed.

```typescript
// ✅ CORRECT — fails closed
const cronSecret = process.env.CRON_SECRET
if (!cronSecret) {
  return NextResponse.json({ error: "Cron not configured" }, { status: 503 })
}
if (request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

## General Rule

For any secret-gated operation:
1. First check the secret **exists** — return 503 if missing
2. Then check the secret **matches** — return 401 if wrong
3. Never combine these into a single `if (secret && matches)` conditional

## Where This Appears

- Cron/scheduled job endpoints
- Webhook receivers (Stripe, GitHub, Vercel)
- Internal service-to-service auth
- Any endpoint that uses a bearer token from env var

## Detection

```bash
# Grep for the fail-open pattern
grep -rn "if (.*Secret\|if (.*Token\|if (.*Key" src/app/api/ | grep -v "!"
# Any `if (secret)` around auth logic is suspicious
```

## When to Use

- Auditing any API route that uses env-var secrets for auth
- Code review of webhook/cron endpoints
- Security audits of new integrations
