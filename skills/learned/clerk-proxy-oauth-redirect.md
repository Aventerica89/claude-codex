# Clerk Proxy OAuth Redirect Fix

**Extracted:** 2026-02-19
**Context:** Building a Next.js proxy for Clerk auth (custom domain / NEXT_PUBLIC_CLERK_PROXY_URL)

## Problem

When proxying Clerk's frontend API, OAuth sign-in fails with:
> "The External Account was not found"

The OAuth flow reaches GitHub, GitHub redirects back to `/clerk-proxy/v1/oauth_callback?code=...&state=...`, but Clerk never completes the session.

**Root cause:** Node.js `fetch()` defaults to `redirect: 'follow'`. Clerk's `/v1/oauth_callback` returns a `302` redirect to `/sign-in/sso-callback` — intended for the *browser* to follow. When the proxy follows it internally, the browser never receives the redirect, so Clerk JS never finalizes the session and cookies are never set.

## Solution

Add `redirect: 'manual'` to the proxy's fetch call so the 302 passes through to the browser:

```typescript
const response = await fetch(destination, {
  method: request.method,
  headers,
  body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
  // @ts-expect-error duplex required for streaming body
  duplex: 'half',
  // Don't follow redirects — Clerk's oauth_callback returns a 302 to the app.
  // If we follow it internally, the browser never receives the redirect and the
  // OAuth session cookies are not set correctly on the app domain.
  redirect: 'manual',
})
```

## Related Fix

Also strip decompression headers to avoid `ERR_CONTENT_DECODING_FAILED`:

```typescript
const responseHeaders = new Headers(response.headers)
responseHeaders.delete('content-encoding')
responseHeaders.delete('content-length')
responseHeaders.delete('transfer-encoding')
```

fetch() auto-decompresses the body, so forwarding these headers confuses the browser.

## When to Use

Any time you're building a proxy for Clerk (or any OAuth provider) where:
- You see "External Account was not found" errors
- The OAuth flow reaches the callback URL but never completes
- You're using `NEXT_PUBLIC_CLERK_PROXY_URL` with a custom domain

Also applies to any OAuth proxy — the pattern is universal: OAuth callbacks rely on the browser following the final redirect, so proxies must use `redirect: 'manual'`.
