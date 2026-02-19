# Better Auth v1.4 + Drizzle: "unable_to_create_user" from Missing Account Fields

**Extracted:** 2026-02-19
**Context:** Better Auth with Drizzle adapter and Google/social OAuth sign-up

## Problem

Google OAuth completes successfully but the user lands on an error page with `?error=unable_to_create_user`. No obvious error in logs.

The error is misleading — the user creation itself doesn't fail. The actual failure is in account creation.

## Root Cause

Better Auth v1.4 added three fields to the `account` model that didn't exist in earlier versions:
- `accessTokenExpiresAt`
- `refreshTokenExpiresAt`
- `scope`

The Drizzle adapter runs `checkMissingFields()` before every INSERT. If any field in the data doesn't exist as a property in your Drizzle table definition, it throws `BetterAuthError`.

`BetterAuthError` is NOT an `APIError`, so `handleOAuthUserInfo` catches it and returns the generic `"unable to create user"` string (not the real error message), which becomes `unable_to_create_user` in the redirect URL.

## Old Schema (broken with v1.4)

```ts
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),  // wrong field name
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
})
```

## Fix: Updated Schema

```ts
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
})
```

## DB Migration

If the DB already exists, add the columns directly:

```sql
ALTER TABLE account ADD COLUMN access_token_expires_at INTEGER;
ALTER TABLE account ADD COLUMN refresh_token_expires_at INTEGER;
ALTER TABLE account ADD COLUMN scope TEXT;
```

Via Turso HTTP API:
```bash
curl -X POST "${TURSO_HTTP_URL}/v2/pipeline" \
  -H "Authorization: Bearer ${TURSO_AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {"type": "execute", "stmt": {"sql": "ALTER TABLE account ADD COLUMN access_token_expires_at INTEGER"}},
      {"type": "execute", "stmt": {"sql": "ALTER TABLE account ADD COLUMN refresh_token_expires_at INTEGER"}},
      {"type": "execute", "stmt": {"sql": "ALTER TABLE account ADD COLUMN scope TEXT"}},
      {"type": "close"}
    ]
  }'
```

## How to Verify Schema Matches Better Auth

Run this to get Better Auth's expected schema (ignores DB adapter init error):

```bash
node -e "
const { getSchema } = require('./node_modules/better-auth/dist/db/get-schema.mjs');
const { betterAuth } = require('./node_modules/better-auth/dist/index.mjs');

const auth = betterAuth({
  baseURL: 'http://localhost:3000',
  database: { provider: 'sqlite' },
  emailAndPassword: { enabled: true },
  socialProviders: { google: { clientId: 'x', clientSecret: 'x' } }
});

const schema = getSchema(auth);
console.log(JSON.stringify(schema, null, 2));
" 2>&1 | grep -v 'BetterAuthError\|node:internal'
```

Compare the output's field names against your Drizzle schema's TypeScript property names. Every field Better Auth lists must exist as a property in your table definition.

## When to Use

- Any time you see `?error=unable_to_create_user` after OAuth
- After upgrading Better Auth (new versions may add fields)
- When setting up Better Auth with a hand-written Drizzle schema instead of using `npx better-auth generate`

## Key Insight

The Drizzle adapter uses TypeScript property names (camelCase) for field lookup, not DB column names (snake_case). Better Auth's `fieldName` in the schema output is the camelCase property name you need in your Drizzle table.
