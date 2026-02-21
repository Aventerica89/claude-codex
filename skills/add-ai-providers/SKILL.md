---
name: add-ai-providers
description: Add multi-provider AI settings panel to a JB Cloud Next.js app. Copies AIProvidersPanel component from ~/clarity, creates API routes per provider, adds integrations table to schema, and wires up the settings page. Use when an app needs user-managed AI API keys with encrypted storage and automatic fallback.
---

# Add AI Provider Settings Panel

## Commands

- `/add-ai-providers` — implement the full AI provider settings panel in the current project

## Overview

Copies the Clarity `AIProvidersPanel` component pattern into the current Next.js project. Providers are listed as expandable card rows; the first connected provider is the active model, the rest are automatic fallbacks. Keys are encrypted at rest.

Source of truth: `~/clarity/src/components/settings/ai-providers-panel.tsx`

---

## When to Use

- App needs user-managed AI API keys (Anthropic, Gemini, DeepSeek, Groq)
- Settings page needs a "Connect AI" section
- App uses multiple AI providers with fallback routing

---

## Execution Steps

### Step 1: Detect Project

Read `CLAUDE.md` and `package.json` to confirm:
- Stack is Next.js (App Router)
- Auth library (Better Auth or Clerk — affects session lookup)
- DB library (Drizzle/Turso or equivalent — affects schema and queries)
- Existing settings page location (usually `src/app/(dashboard)/settings/page.tsx`)

If the stack differs significantly from Clarity, adapt accordingly and note changes.

### Step 2: Copy the Panel Component

Read the source component from Clarity:

```
~/clarity/src/components/settings/ai-providers-panel.tsx
```

Write it to the current project:

```
src/components/settings/ai-providers-panel.tsx
```

Adapt the `PROVIDERS` array if needed:
- Remove providers the app won't support
- Update model names to current versions
- Adjust descriptions to match app context

Keep all component logic, state patterns, and CSS classes identical unless adapting for a non-shadcn/non-Tailwind project.

### Step 3: Add integrations Table to Schema

Check if the `integrations` table already exists in `src/lib/schema.ts` (or equivalent). If not, add:

```ts
export const integrations = sqliteTable("integrations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accessTokenEncrypted: text("access_token_encrypted"),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  tokenExpiresAt: integer("token_expires_at", { mode: "timestamp" }),
  providerAccountId: text("provider_account_id"),
  config: text("config").notNull().default("{}"),
  syncStatus: text("sync_status").notNull().default("idle"),
  lastSyncedAt: integer("last_synced_at", { mode: "timestamp" }),
  lastError: text("last_error"),
}, (t) => [
  uniqueIndex("integrations_user_provider_idx").on(t.userId, t.provider),
])
```

Then create the migration. For Turso/Drizzle:
```bash
npx drizzle-kit generate
```

Run migration via Turso HTTP API if `drizzle-kit push` has schema drift warnings.

### Step 4: Ensure encryptToken Helper Exists

Check `src/lib/crypto.ts` for `encryptToken()`. If it doesn't exist, copy from Clarity:

```
~/clarity/src/lib/crypto.ts
```

Verify the encryption key env var name (`ENCRYPTION_KEY` or similar) and add it to `.env.example`.

### Step 5: Create API Routes

For each provider in the `PROVIDERS` array, create a route file. Read the Anthropic route from Clarity as a template:

```
~/clarity/src/app/api/integrations/anthropic/route.ts
```

Create one file per provider, substituting the provider string:

```
src/app/api/integrations/anthropic/route.ts
src/app/api/integrations/gemini/route.ts
src/app/api/integrations/deepseek/route.ts
src/app/api/integrations/groq/route.ts
```

Each route is identical except for the `provider:` string in the DB insert/delete.

**Route pattern (POST + DELETE):**

```ts
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { integrations } from "@/lib/schema"
import { encryptToken } from "@/lib/crypto"

const saveSchema = z.object({ token: z.string().min(1) })

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = saveSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: "Token is required" }, { status: 400 })

  const encrypted = encryptToken(parsed.data.token)

  await db.insert(integrations)
    .values({ userId: session.user.id, provider: "PROVIDER_NAME", accessTokenEncrypted: encrypted, syncStatus: "idle" })
    .onConflictDoUpdate({
      target: [integrations.userId, integrations.provider],
      set: { accessTokenEncrypted: encrypted, syncStatus: "idle", lastError: null },
    })

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db.delete(integrations)
    .where(and(eq(integrations.userId, session.user.id), eq(integrations.provider, "PROVIDER_NAME")))

  return NextResponse.json({ ok: true })
}
```

### Step 6: Wire Up Settings Page

In the settings Server Component, add parallel queries for each provider and pass connected state to the panel:

```ts
import { AIProvidersPanel } from "@/components/settings/ai-providers-panel"

// Inside the Server Component, alongside existing queries:
const [anthropicRows, geminiRows, deepseekRows, groqRows] = await Promise.all([
  db.select().from(integrations).where(and(eq(integrations.userId, userId), eq(integrations.provider, "anthropic"))),
  db.select().from(integrations).where(and(eq(integrations.userId, userId), eq(integrations.provider, "gemini"))),
  db.select().from(integrations).where(and(eq(integrations.userId, userId), eq(integrations.provider, "deepseek"))),
  db.select().from(integrations).where(and(eq(integrations.userId, userId), eq(integrations.provider, "groq"))),
])

const aiConnected = {
  anthropic: anthropicRows.length > 0,
  gemini: geminiRows.length > 0,
  deepseek: deepseekRows.length > 0,
  groq: groqRows.length > 0,
}

// In JSX:
<AIProvidersPanel connected={aiConnected} />
```

Place the panel inside the existing settings layout, typically after the primary integration card.

### Step 7: Report

Summarize what was created:

```
AI provider settings added!

Component: src/components/settings/ai-providers-panel.tsx
API routes: src/app/api/integrations/{anthropic,gemini,deepseek,groq}/route.ts
Schema: integrations table added to src/lib/schema.ts
Migration: generated — run npx drizzle-kit push or use Turso HTTP API

Providers configured:
  - Claude (Anthropic)   bg-violet-500
  - Gemini               bg-blue-500
  - DeepSeek             bg-teal-500
  - Groq                 bg-orange-500

Next: add ENCRYPTION_KEY env var if not already present
```

---

## Security Invariants (Never Skip)

- Tokens encrypted before DB insert via `encryptToken()`
- Never return tokens in API responses
- Always check `session.user.id` before any DB operation
- Anthropic OAuth tokens (`sk-ant-oat...`) work only inside Claude CLI — apps calling Messages API directly need `sk-ant-api...`

---

## Reference

- Notion convention: https://www.notion.so/30ecc9ae33da819b87b9f44d50439686
- Source component: `~/clarity/src/components/settings/ai-providers-panel.tsx`
