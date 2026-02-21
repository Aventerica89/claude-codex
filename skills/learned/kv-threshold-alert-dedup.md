# KV Threshold Alert with Per-Session Deduplication

**Extracted:** 2026-02-21
**Context:** Billing/usage monitoring — alerts that should trigger exactly once
per user session when a cumulative spend threshold is crossed.

## Problem

Threshold alerts (e.g., "you've used 80% of your budget") need to fire
exactly once per session. If checked on every message, the same alert
re-triggers on every message after the threshold is crossed, spamming
the user.

## Solution

Two KV keys per session:
1. `session-spend:{sessionId}` — running accumulator (float, 7-day TTL)
2. `session-alert-fired:{sessionId}` — JSON array of alert IDs already fired

On each message's persist call:
1. Read + increment the accumulator
2. Read the fired-set
3. For each enabled alert not in fired-set: check if spendPct >= thresholdPct
4. For matches: update alert metadata, add to fired-set
5. Write back accumulator + fired-set atomically via Promise.all
6. Return only newly triggered alerts

## Example

```typescript
async function checkUsageAlerts(env, userId, sessionId, costUsd) {
  const maxBudgetUsd = parseFloat(await env.AUTH_KV.get(`user-config:${userId}:max-budget-usd`) ?? '0');
  if (!maxBudgetUsd) return [];

  // Accumulate spend
  const spendKey = `session-spend:${sessionId}`;
  const newSpend = (parseFloat(await env.SESSIONS_KV.get(spendKey) ?? '0')) + costUsd;
  await env.SESSIONS_KV.put(spendKey, String(newSpend), { expirationTtl: 604800 });

  // Load fired-set
  const firedKey = `session-alert-fired:${sessionId}`;
  const firedIds: string[] = JSON.parse(await env.SESSIONS_KV.get(firedKey) ?? '[]');

  const alerts = JSON.parse(await env.AUTH_KV.get(`billing-alerts:${userId}`) ?? '[]');
  const spendPct = (newSpend / maxBudgetUsd) * 100;
  const newlyTriggered = [];
  const newFiredIds = [...firedIds];

  for (const alert of alerts) {
    if (!alert.enabled || firedIds.includes(alert.id)) continue;
    if (spendPct < alert.thresholdPct) continue;
    alert.triggeredAt = new Date().toISOString();
    alert.triggeredCount += 1;
    newlyTriggered.push({ ...alert });
    newFiredIds.push(alert.id);
  }

  if (newlyTriggered.length === 0) return [];

  await Promise.all([
    env.AUTH_KV.put(`billing-alerts:${userId}`, JSON.stringify(alerts)),
    env.SESSIONS_KV.put(firedKey, JSON.stringify(newFiredIds), { expirationTtl: 604800 }),
  ]);

  return newlyTriggered;
}
```

Frontend wires into the persist call's `.then()`:
```typescript
sdkApi.persistMessage(sessionId, text, sdkSessionId, costUsd)
  .then(({ triggeredAlerts }) => {
    triggeredAlerts?.forEach(a =>
      toast.warning(`Budget alert: ${a.label} (${a.thresholdPct}% reached)`, 8000)
    );
  });
```

## When to Use

Any time you have:
- Threshold-based alerts tied to an accumulating metric (spend, tokens, API calls)
- A "session" or "context" boundary after which alerts reset
- Need to prevent spam (alert once, not on every event after crossing)

Generalizes to: rate limit warnings, quota alerts, SLA breach notifications.
