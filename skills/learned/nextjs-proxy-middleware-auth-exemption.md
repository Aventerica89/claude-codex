# Next.js Proxy Middleware Must Exempt Auth Routes

**Extracted:** 2026-02-22
**Context:** Any Next.js app using middleware/proxy that checks session cookies alongside Better Auth (or similar OAuth flows)

## Problem

OAuth login silently "does nothing" — clicking "Sign in with Google" has no visible effect. No JS errors, no console errors, no network errors visible in the browser. The button fires correctly but the OAuth redirect never happens.

Root cause: Next.js middleware (or Turbopack proxy) matches `/api/auth/:path*` and checks for a session cookie. Since the user is trying to *create* a session, no cookie exists, so the middleware redirects to `/login` before Better Auth can redirect to Google. This creates an invisible redirect loop: login page -> auth endpoint -> middleware redirects back to login.

## Debugging Trail

1. Login page code looks correct (button wired, signIn.social called)
2. Env vars correct (BETTER_AUTH_URL, GOOGLE_CLIENT_ID)
3. **curl to auth endpoint returns 307 to /login** — this is the smoking gun
4. Non-auth API routes return proper 401s (no redirect)
5. Build logs show `f Proxy (Middleware)` confirming proxy.ts is treated as middleware

## Solution

Exempt auth routes from session cookie checks in the middleware. Keep them in the matcher for rate limiting, but add an early return before the session check:

```typescript
export async function proxy(request: NextRequest) {
  // Rate limiting still applies to auth routes
  const rateLimitResponse = await applyRateLimit(request.nextUrl.pathname, request)
  if (rateLimitResponse) return rateLimitResponse

  // Auth routes must be accessible without a session (OAuth flow)
  if (request.nextUrl.pathname.startsWith("/api/auth/")) {
    return NextResponse.next()
  }

  // All other matched routes require a session
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}
```

## Turbopack Gotcha

In Next.js 16, Turbopack picks up `proxy.ts` as middleware even though it's not named `middleware.ts`. The build log `f Proxy (Middleware)` confirms this. Don't assume renaming from `middleware.ts` to `proxy.ts` disables middleware behavior.

## When to Use

- OAuth login "does nothing" with no visible errors
- `curl` to `/api/auth/*` returns a redirect to `/login` instead of to the OAuth provider
- Any middleware/proxy that matches auth routes and checks session cookies
- After adding session-guarding middleware to a project that uses OAuth
