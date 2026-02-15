# API Route Defense-in-Depth Error Handling

**Extracted:** 2026-02-14
**Context:** Next.js API routes that orchestrate multiple async operations

## Problem

API route returns raw 500 despite individual helpers having try/catch.
Each helper (Basecamp fetch, AI settings DB query) catches its own errors,
but the route handler has no top-level catch. One uncaught throw anywhere
in the pipeline crashes the entire request.

## Solution

### 1. Helpers return fallbacks, never throw to callers

```typescript
export async function getApiKey(): Promise<string | null> {
  try {
    const settings = await db.query.settings.findFirst();
    if (settings?.apiKey) return decrypt(settings.apiKey);
  } catch (error) {
    console.error("Failed to read settings:", error);
  }
  return process.env.API_KEY?.trim() || null; // Fallback
}
```

### 2. Top-level try/catch on route body

```typescript
export async function POST(request: Request) {
  // Validation + rate limiting OUTSIDE try (they return early)
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: ... }, { status: 400 });

  try {
    const result = await doWork(parsed.data);

    // Non-critical persistence — separate try/catch
    try {
      await db.insert(logs).values({ ... });
    } catch (dbError) {
      console.error("Persist failed:", sanitizeError(dbError));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Route error:", sanitizeError(error));
    return apiError("Failed to process request", 500);
  }
}
```

### 3. Always .trim() env var reads

```typescript
// 1Password deploy_env_vars injects trailing \n
const key = process.env.SECRET_KEY?.trim();
```

## Debugging Technique

1. Check Vercel runtime logs (MCP tool) filtered by status=500
2. Cross-reference console.error messages with HTTP status codes
3. Verify DB table exists: `drizzle-kit push` ("no changes" = exists)
4. Verify env vars: `npx vercel env ls production | grep KEY`
5. Systematic elimination: which step in the pipeline throws uncaught?

## When to Use

- Any API route with 2+ async operations in sequence
- After adding new DB queries to existing routes
- When migrating from env vars to DB-stored settings
- Anytime a route returns 500 but individual helpers "should" catch errors
