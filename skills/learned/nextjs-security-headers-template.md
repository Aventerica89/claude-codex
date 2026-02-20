# Next.js Security Headers Template

**Extracted:** 2026-02-19
**Context:** Clarity — Next.js 16 + Tailwind v4 + Turso + Better Auth + multiple API integrations

## Problem

Default Next.js config ships no security headers. Missing:
- CSP (XSS vector)
- X-Frame-Options (clickjacking)
- X-Content-Type-Options (MIME sniffing)
- Referrer-Policy (data leakage)
- Permissions-Policy (unnecessary browser APIs)

## Solution

Add to `next.config.ts`:

```typescript
import type { NextConfig } from "next"

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // unsafe-* required by Next.js
      "style-src 'self' 'unsafe-inline'",                 // unsafe-inline required by Tailwind
      "img-src 'self' data: https:",
      "font-src 'self'",
      // Customize connect-src per project integrations:
      "connect-src 'self' https://*.turso.io https://api.anthropic.com https://generativelanguage.googleapis.com https://api.todoist.com https://www.googleapis.com",
      "frame-ancestors 'none'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
```

## CSP connect-src by Integration

Add the relevant domains to `connect-src` for your stack:

| Integration | Domain |
|-------------|--------|
| Turso DB | `https://*.turso.io` |
| Anthropic API | `https://api.anthropic.com` |
| Gemini API | `https://generativelanguage.googleapis.com` |
| Google Calendar/Gmail | `https://www.googleapis.com` |
| Todoist | `https://api.todoist.com` |
| Supabase | `https://*.supabase.co` |
| Vercel Analytics | `https://vitals.vercel-insights.com` |
| Sentry | `https://*.sentry.io` |
| Stripe | `https://api.stripe.com` |

## Notes

- `unsafe-inline` and `unsafe-eval` in `script-src` are required by Next.js (inline scripts for hydration) — cannot remove without nonce-based CSP
- `unsafe-inline` in `style-src` required by Tailwind CSS v4
- `frame-ancestors 'none'` is CSP equivalent of `X-Frame-Options: DENY` — both included for older browser compat
- Add `Strict-Transport-Security` via Vercel dashboard or hosting platform (not effective in Next.js config since it applies before HTTPS termination)

## When to Use

- Any new Next.js project before first production deploy
- Security audit of existing Next.js apps
- After adding a new third-party API integration (update connect-src)
