# Env Var to DB-Encrypted Secret Migration

**Extracted:** 2026-02-14
**Context:** Migrating API keys from server env vars to user-configurable DB storage with encryption

## Problem

App starts with `process.env.API_KEY` for simplicity. Later needs user-configurable keys stored encrypted in DB, while keeping env var as fallback for backward compatibility.

## Solution

### 1. Schema (single-row settings table)

```typescript
export const aiSettings = sqliteTable("ai_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  apiKey: text("api_key"), // Encrypted via crypto module
  model: text("model").default("default-model"),
  enabled: integer("enabled", { mode: "boolean" }).default(true),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});
```

### 2. Helper with fallback chain

```typescript
export async function getApiKey(): Promise<string | null> {
  const settings = await db.query.aiSettings.findFirst();
  if (settings?.apiKey) {
    return safeDecrypt(settings.apiKey);
  }
  return process.env.API_KEY || null; // Env var fallback
}
```

### 3. Consumer accepts optional key

```typescript
// Before: reads env directly
const client = new ApiClient(); // reads process.env internally

// After: accepts key param, falls back to env
export async function callApi(input: Input & { apiKey?: string }) {
  const key = input.apiKey || process.env.API_KEY;
  if (!key) return { error: "No key configured" };
  const client = new ApiClient({ apiKey: key });
  // ...
}
```

### 4. Route fetches stored key before calling

```typescript
const apiKey = await getApiKey();
const result = await callApi({ ...input, apiKey: apiKey || undefined });
```

## Key Constraints

- **OAuth tokens vs API keys**: For direct API calls (no proxy/container), only API keys work. OAuth tokens (`sk-ant-oat01-*`) fail on direct Anthropic Messages API. Validate format on save.
- **Backward compatibility**: Always fall back to env var so existing deployments keep working.
- **Never expose raw key**: GET endpoint returns `{ hasKey: boolean }`, never the actual key.
- **Test endpoint**: Small validation call (e.g., `max_tokens: 10`) to confirm key works.

## When to Use

- Moving from `process.env.SECRET` to user-configurable per-admin secrets
- Any app with a settings page for API keys/tokens
- Single-admin apps that don't need per-user key isolation (use single-row settings table)
