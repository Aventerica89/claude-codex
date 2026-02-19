# Clerk User Role Management via REST API

**Extracted:** 2026-02-19
**Context:** Setting Clerk `publicMetadata.role` programmatically (or when Dashboard UI is unreliable)

## Problem

You need to set a user's role (`owner`, `dev`, `viewer`) in Clerk `publicMetadata`, but:
- Clerk Dashboard UI is slow/unreliable in browser automation
- You want to do it from the CLI without opening a browser
- You're scripting user setup for a new environment

## Solution

Use Clerk's REST API directly with `PATCH /v1/users/{userId}/metadata`.

### Step 1: Get the Clerk Secret Key

Pull from Vercel if already deployed:
```bash
npx vercel env pull --environment production
# Now .env.local has CLERK_SECRET_KEY
CLERK_SECRET_KEY=$(grep CLERK_SECRET_KEY .env.local | cut -d'=' -f2)
```

Or retrieve from 1Password:
```bash
CLERK_SECRET_KEY=$(op read "op://Business/#devtools / CLERK_SECRET_KEY/credential")
```

### Step 2: Find the User ID

```bash
curl -s "https://api.clerk.com/v1/users?email_address=user@example.com" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  | jq '.[0].id'
```

### Step 3: Set the Role

```bash
curl -s -X PATCH \
  "https://api.clerk.com/v1/users/${USER_ID}/metadata" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"public_metadata": {"role": "owner"}}' \
  | jq '{id: .id, role: .public_metadata.role}'
```

### One-Liner (if you already know the user ID)

```bash
curl -s -X PATCH "https://api.clerk.com/v1/users/${USER_ID}/metadata" \
  -H "Authorization: Bearer $CLERK_SECRET_KEY" \
  -H "Content-Type: application/json" \
  -d '{"public_metadata": {"role": "owner"}}' | jq '.public_metadata'
```

## Notes

- `public_metadata` in the API = `publicMetadata` in the SDK
- Roles don't take effect until the user's next sign-in or token refresh
- The user can see `publicMetadata` client-side — don't store secrets there
- Use `private_metadata` for server-only data

## When to Use

- Setting up a new DevTools/app instance with an initial admin user
- Demoting/promoting users without touching the Dashboard
- Scripted environment setup (staging → production role migration)
- Browser automation is failing on the Clerk Dashboard UI
