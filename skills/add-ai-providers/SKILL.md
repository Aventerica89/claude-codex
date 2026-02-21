---
name: add-ai-providers
description: Add multi-provider AI settings panel to a JB Cloud Next.js app. Copies AIProvidersPanel component from ~/clarity, creates API routes per provider, adds integrations table to schema, and wires up the settings page. Use when an app needs user-managed AI API keys with encrypted storage and automatic fallback.
---

# Add AI Provider Settings Panel

## Commands

- `/add-ai-providers` — implement the full AI provider settings panel in the current project
- `/add-ai-providers:update` — bring an existing AI providers panel up to date with the latest Clarity pattern

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

Add `logoSrc?: string` to `ProviderConfig` and set it for providers that have logos:

```tsx
interface ProviderConfig {
  id: ProviderId
  label: string
  model: string
  description: string
  placeholder: string
  docsUrl: string
  avatarColor: string
  initial: string
  logoSrc?: string  // path to SVG in public/logos/; absent = colored initial
}

const PROVIDERS: ProviderConfig[] = [
  { id: "anthropic", label: "Claude", logoSrc: "/logos/claude-logo.svg",
    avatarColor: "bg-violet-500", initial: "A", ... },
  { id: "gemini",    label: "Gemini", logoSrc: "/logos/google-logo.svg",
    avatarColor: "bg-blue-500",   initial: "G", ... },
  { id: "deepseek",  label: "DeepSeek",
    avatarColor: "bg-teal-500",   initial: "D", ... },
  { id: "groq",      label: "Groq",  logoSrc: "/logos/groq-logo.svg",
    avatarColor: "bg-orange-500", initial: "Gr", ... },
]
```

Update the avatar render in the component to conditionally show the logo:

```tsx
{provider.logoSrc ? (
  <img
    src={provider.logoSrc}
    alt={provider.label}
    className="w-8 h-8 rounded-lg object-contain shrink-0"
  />
) : (
  <div className={cn(
    "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0",
    provider.avatarColor
  )}>
    {provider.initial}
  </div>
)}
```

Keep all component logic, state patterns, and CSS classes identical unless adapting for a non-shadcn/non-Tailwind project.

### Step 2.5: Copy Provider Logo Files

Logos are stored in the claude-codex assets directory (`~/.claude/assets/logos/`). Copy the three square-icon logos to the target project:

```bash
mkdir -p public/logos
cp ~/.claude/assets/logos/claude-logo.svg  public/logos/
cp ~/.claude/assets/logos/google-logo.svg  public/logos/
cp ~/.claude/assets/logos/groq-logo.svg    public/logos/
```

DeepSeek has a logo (`DeepSeek_idPu03Khfd_1.svg`) but it is a wide wordmark — not suitable for an 8×8 avatar. Use the teal "D" initial instead.

Logo notes:
- `claude-logo.svg` — coral swirl mark (#D97757), transparent background
- `google-logo.svg` — multicolor Google "G", transparent background
- `groq-logo.svg` — red square background (#F54F35) with white "Q" mark baked in
- `DeepSeek_idPu03Khfd_1.svg` — blue wordmark (icon + text), wide aspect ratio, use initial at small sizes

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
  - Claude (Anthropic)   logo: claude-logo.svg
  - Gemini               logo: google-logo.svg
  - DeepSeek             initial: D  bg-teal-500
  - Groq                 logo: groq-logo.svg

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

---

## Subcommand: update (`/add-ai-providers:update`)

Brings an **existing** AI providers panel up to date with the latest Clarity pattern. Run this in projects that already have the panel implemented but may be behind on:

- SVG logos (added 2026-02-21)
- Model name updates
- New providers

### Step 1: Read Existing Component

Read the current component:

```
src/components/settings/ai-providers-panel.tsx
```

Check for:
- Does `ProviderConfig` have `logoSrc?: string`?
- Are model names current? (see canonical list below)
- Is the avatar render using the conditional logo/initial pattern?
- Are logo files present in `public/logos/`?

### Step 2: Apply Updates

**Add `logoSrc` if missing:**

Add to `ProviderConfig` interface:
```ts
logoSrc?: string  // path to SVG in public/logos/; absent = colored initial
```

**Update PROVIDERS entries** with current models and logos:

| Provider | Current model | logoSrc |
|----------|--------------|---------|
| anthropic | `claude-sonnet-4-6` | `/logos/claude-logo.svg` |
| gemini | `gemini-2.0-flash` | `/logos/google-logo.svg` |
| deepseek | `deepseek-chat` | *(none)* |
| groq | `llama-3.3-70b-versatile` | `/logos/groq-logo.svg` |

**Update avatar render** if it uses the old colored-div-only pattern:

```tsx
{provider.logoSrc ? (
  <img
    src={provider.logoSrc}
    alt={provider.label}
    className="w-8 h-8 rounded-lg object-contain shrink-0"
  />
) : (
  <div className={cn(
    "w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0",
    provider.avatarColor
  )}>
    {provider.initial}
  </div>
)}
```

### Step 3: Copy Missing Logo Files

Check `public/logos/` for each logo. Copy any that are missing:

```bash
mkdir -p public/logos

# Copy only if not already present
[ -f public/logos/claude-logo.svg ] || cp ~/.claude/assets/logos/claude-logo.svg public/logos/
[ -f public/logos/google-logo.svg ] || cp ~/.claude/assets/logos/google-logo.svg public/logos/
[ -f public/logos/groq-logo.svg   ] || cp ~/.claude/assets/logos/groq-logo.svg   public/logos/
```

### Step 4: Report

```
AI providers panel updated!

Changes applied:
  - ProviderConfig: added logoSrc field         [or: already present]
  - Avatar render: updated to logo/initial       [or: already updated]
  - Model names: updated to current versions     [or: already current]
  - Logos copied to public/logos/:
      claude-logo.svg  [copied / already present]
      google-logo.svg  [copied / already present]
      groq-logo.svg    [copied / already present]

No schema or API route changes needed.
```
