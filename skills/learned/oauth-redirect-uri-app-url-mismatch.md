# OAuth Redirect URI Mismatch from Wrong NEXT_PUBLIC_APP_URL

**Extracted:** 2026-02-23
**Context:** Setting up OAuth with any third-party provider (Todoist, GitHub, Stripe, etc.) on a Next.js app deployed to Vercel with a custom domain

## Problem

When `NEXT_PUBLIC_APP_URL` is set to the Vercel auto-generated domain (`project-team.vercel.app`) instead of the custom domain, the `redirect_uri` sent during OAuth authorization won't match what's registered in the provider's developer console:

```
{"error": "invalid_request", "description": "Invalid redirect URI"}
```

This happens because:
1. Vercel sets a default domain like `clarity-jb-cloud-apps.vercel.app`
2. Code builds redirect_uri from `process.env.NEXT_PUBLIC_APP_URL`
3. You register `https://myapp.com/api/auth/callback` in the provider console
4. But code sends `https://clarity-jb-cloud-apps.vercel.app/api/auth/callback`

## Solution

Verify `NEXT_PUBLIC_APP_URL` before registering any OAuth redirect URIs:

```bash
vercel env pull --environment production /tmp/env-check
grep NEXT_PUBLIC_APP_URL /tmp/env-check
```

If it shows the Vercel default domain instead of your custom domain, fix it:

```bash
vercel env rm NEXT_PUBLIC_APP_URL production --yes
printf 'https://yourcustomdomain.com' | vercel env add NEXT_PUBLIC_APP_URL production
# Retrigger deploy
git commit --allow-empty -m "chore: fix NEXT_PUBLIC_APP_URL" && git push
```

Then register the correct redirect URI in the provider console:
```
https://yourcustomdomain.com/api/auth/[provider]/callback
```

## When to Use

- Any OAuth "invalid redirect URI" or "redirect_uri mismatch" error
- Setting up a new OAuth provider on a Vercel-hosted app
- Any time you're registering OAuth redirect URIs — always verify NEXT_PUBLIC_APP_URL first
- Applies to: Todoist, GitHub, Stripe, Linear, Slack, or any OAuth 2.0 provider
