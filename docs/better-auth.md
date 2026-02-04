# Better Auth

The most comprehensive authentication framework for TypeScript.

- **Docs**: https://www.better-auth.com/docs
- **LLMs.txt**: https://www.better-auth.com/llms.txt
- **GitHub**: https://github.com/better-auth/better-auth

## Installation

```bash
npm install better-auth
# or
pnpm add better-auth
# or
bun add better-auth
```

Note: If using separate client/server setup, install in both.

## Environment Variables

```env
BETTER_AUTH_SECRET=[32+ character high-entropy key]
BETTER_AUTH_URL=http://localhost:3000
```

Generate secret: `openssl rand -base64 32`

## Quick Setup

### 1. Create Auth Instance

Create `lib/auth.ts`:

```ts
import { betterAuth } from "better-auth"

export const auth = betterAuth({
  database: {
    // See database section below
  },
  emailAndPassword: {
    enabled: true
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
})
```

### 2. Create Client Instance

Create `lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL // or "http://localhost:3000"
})

// Export hooks for convenience
export const { signIn, signUp, signOut, useSession } = authClient
```

### 3. Mount Route Handler

**Next.js App Router** (`app/api/auth/[...all]/route.ts`):

```ts
import { auth } from "@/lib/auth"
import { toNextJsHandler } from "better-auth/next-js"

export const { POST, GET } = toNextJsHandler(auth)
```

**Astro** (`src/pages/api/auth/[...all].ts`):

```ts
import { auth } from "@/lib/auth"
import type { APIRoute } from "astro"

export const ALL: APIRoute = async (ctx) => {
  return auth.handler(ctx.request)
}
```

**Express**:

```ts
import { toNodeHandler } from "better-auth/node"
import { auth } from "./auth"

app.all("/api/auth/*", toNodeHandler(auth))
```

**Hono**:

```ts
import { Hono } from "hono"
import { auth } from "./auth"

const app = new Hono()

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw)
})
```

### 4. Create Database Tables

```bash
# Generate migration files
npx @better-auth/cli generate

# Apply migrations (Kysely adapter only)
npx @better-auth/cli migrate
```

## Database Adapters

### PostgreSQL with Drizzle

```ts
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db" // your drizzle instance

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg"
  })
})
```

### PostgreSQL with Prisma

```ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  })
})
```

### SQLite

```ts
import { betterAuth } from "better-auth"
import Database from "better-sqlite3"

export const auth = betterAuth({
  database: new Database("./sqlite.db")
})
```

### MongoDB

```ts
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db()

export const auth = betterAuth({
  database: mongodbAdapter(db)
})
```

## Core Database Tables

Better Auth requires 4 tables:

1. **user** - id, name, email, emailVerified, image, createdAt, updatedAt
2. **session** - id, expiresAt, token, ipAddress, userAgent, userId
3. **account** - id, accountId, providerId, userId, accessToken, refreshToken, etc.
4. **verification** - id, identifier, value, expiresAt, createdAt, updatedAt

## Authentication Methods

### Email & Password

**Sign Up:**

```ts
const { data, error } = await authClient.signUp.email({
  email: "user@example.com",
  password: "securepassword",
  name: "John Doe",
  image: "https://example.com/avatar.jpg", // optional
  callbackURL: "/dashboard", // optional redirect
})
```

**Sign In:**

```ts
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "securepassword",
  callbackURL: "/dashboard",
  rememberMe: true, // persist session across browser close
})
```

**Server-side Sign In:**

```ts
const session = await auth.api.signInEmail({
  body: {
    email: "user@example.com",
    password: "securepassword",
  },
  headers: request.headers,
})
```

### Social OAuth

**Client-side:**

```ts
await authClient.signIn.social({
  provider: "github", // or "google", "discord", etc.
  callbackURL: "/dashboard",
})
```

**With callbacks:**

```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/dashboard",
  errorCallbackURL: "/error",
  newUserCallbackURL: "/onboarding",
})
```

### Sign Out

```ts
await authClient.signOut()

// With redirect
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/login")
    },
  },
})
```

## Session Management

### Client-side (React)

```tsx
import { useSession } from "@/lib/auth-client"

function Profile() {
  const { data: session, isPending, error } = useSession()

  if (isPending) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  if (!session) return <div>Not logged in</div>

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <img src={session.user.image} alt="Avatar" />
    </div>
  )
}
```

### Server-side (Next.js)

```ts
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  return session
}
```

### Server-side (Astro)

```astro
---
import { auth } from "@/lib/auth"

const session = await auth.api.getSession({
  headers: Astro.request.headers,
})

if (!session) {
  return Astro.redirect("/login")
}
---

<h1>Welcome, {session.user.name}</h1>
```

## Middleware (Next.js)

```ts
import { betterFetch } from "@better-fetch/fetch"
import { NextResponse, type NextRequest } from "next/server"
import type { Session } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    }
  )

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
}
```

## Popular Plugins

### Two-Factor Authentication

```ts
import { betterAuth } from "better-auth"
import { twoFactor } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    twoFactor({
      issuer: "MyApp",
      totpOptions: {
        digits: 6,
        period: 30,
      },
    }),
  ],
})
```

### Magic Link

```ts
import { magicLink } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, token, url }) => {
        await sendEmail({
          to: email,
          subject: "Sign in to MyApp",
          html: `<a href="${url}">Click here to sign in</a>`,
        })
      },
    }),
  ],
})
```

### Organizations

```ts
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
    }),
  ],
})
```

### Passkeys

```ts
import { passkey } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    passkey({
      rpID: "myapp.com",
      rpName: "MyApp",
      origin: "https://myapp.com",
    }),
  ],
})
```

## Supported Social Providers (40+)

- Google, GitHub, Discord, Apple, Microsoft
- Twitter/X, Facebook, LinkedIn, Spotify
- Twitch, Slack, Notion, Linear
- GitLab, Bitbucket, Atlassian
- Dropbox, Zoom, Figma
- And many more...

## CLI Commands

```bash
# Generate migration files
npx @better-auth/cli generate

# Apply migrations (Kysely only)
npx @better-auth/cli migrate

# Generate types
npx @better-auth/cli generate --output ./types/auth.d.ts
```

## TypeScript Support

Better Auth is fully typed. Export types for use:

```ts
import type { Session, User } from "better-auth/types"

// Or infer from your auth instance
type AuthSession = typeof auth.$Infer.Session
type AuthUser = typeof auth.$Infer.User
```

## Error Handling

```ts
const { data, error } = await authClient.signIn.email({
  email: "user@example.com",
  password: "wrongpassword",
})

if (error) {
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      // Handle invalid credentials
      break
    case "USER_NOT_FOUND":
      // Handle user not found
      break
    case "EMAIL_NOT_VERIFIED":
      // Handle unverified email
      break
    default:
      // Handle other errors
  }
}
```

## Framework Integrations

- Next.js (App Router & Pages Router)
- Astro
- Nuxt
- SvelteKit
- Remix
- Express
- Fastify
- Hono
- NestJS
- Elysia
- TanStack Start

## Resources

- **Documentation**: https://www.better-auth.com/docs
- **GitHub**: https://github.com/better-auth/better-auth
- **Discord**: https://discord.gg/better-auth
- **LLMs.txt**: https://www.better-auth.com/llms.txt
