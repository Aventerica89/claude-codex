# Better Auth + Next.js 16 Google OAuth: Complete Setup Checklist

**Extracted:** 2026-02-19
**Context:** Setting up Better Auth with Google OAuth on Next.js 16 (App Router)

## Problem

OAuth completes on Google's side but loops back to `/login` or shows errors. Multiple independent issues can cause this — and they stack silently.

## The Full Checklist (all required)

### 1. `baseURL` in `betterAuth()` config

Without this, Better Auth constructs the wrong callback URL:

```ts
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",  // REQUIRED
  // ...
})
```

Set `BETTER_AUTH_URL` in `.env.local` to match the current environment.

### 2. Use `proxy.ts`, not `middleware.ts`

Next.js 16 changed the middleware convention. The file must be `src/proxy.ts` (not `middleware.ts`) and export `proxy`:

```ts
// src/proxy.ts
import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)"],
}
```

**Never have both `middleware.ts` and `proxy.ts`** — Next.js 16 throws an unhandled rejection.

`getSessionCookie` is Edge-safe (reads cookie header, no DB call). Don't use `betterFetch` with a loopback URL in middleware.

### 3. `.env.local` must be at project root

Next.js only loads `.env.local` from the project root, not from `src/`. If your file is at `src/.env.local`, Google OAuth env vars won't be available and Better Auth will throw "missing clientId or clientSecret".

### 4. `trustedProviders` for account linking

```ts
account: {
  accountLinking: {
    enabled: true,
    trustedProviders: ["google"],  // REQUIRED for Google sign-up
  },
},
```

Without this, if a user already exists (e.g. from a previous email/password signup with the same address), OAuth returns `unable_to_link_account`.

### 5. Account schema has all Better Auth v1.4 fields

See `better-auth-drizzle-missing-fields.md` for the full account schema. Missing `accessTokenExpiresAt`, `refreshTokenExpiresAt`, or `scope` causes `unable_to_create_user`.

### 6. `trustedOrigins` includes your dev URL

```ts
trustedOrigins: [
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  "http://localhost:3000",
  // production URLs...
],
```

If the server starts on port 3001 (port conflict), the origin check fails.

## Complete Working `auth.ts`

```ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"
import * as schema from "./schema"

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      scope: ["openid", "profile", "email"],
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "http://localhost:3000",
  ],
})
```

## Debugging OAuth Loops

1. Check the redirect URL in the browser — the `?error=` param tells you which step failed
2. Clear browser cookies for `localhost` between test attempts
3. Clear the DB auth tables if you have stale/partial records from previous attempts
4. Check server logs for the underlying error (Better Auth logs more detail than the URL param)

## When to Use

- Setting up Better Auth on any Next.js 15/16 project
- Diagnosing Google OAuth loop or error redirects
- After upgrading Next.js to v15/16 from an older version
