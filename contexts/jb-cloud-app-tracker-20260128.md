# Context: jb-cloud-app-tracker-20260128

**Saved**: 2026-01-28T12:45:00Z
**Project**: jb-cloud-app-tracker
**Branch**: main
**Directory**: /Users/jb/jb-cloud-app-tracker

## Current Task
Project is complete and deployed. Google OAuth working.

## Progress
- [x] Core CRUD (applications, providers, tags, deployments)
- [x] Vercel API integration
- [x] Cloudflare Pages integration
- [x] Auto-sync deployments on page view
- [x] Security hardening (SQL injection, open redirects, headers)
- [x] Password recovery flow
- [x] Custom domain setup (apps.jbcloud.app)
- [x] Google OAuth authentication (FIXED - uses route handler for PKCE)
- [x] Documentation synced to docs.jbcloud.app

## Key Files
- `src/app/(auth)/login/google/route.ts` - Google OAuth route handler (CRITICAL for PKCE)
- `src/app/(auth)/callback/route.ts` - OAuth callback with cookie handling
- `src/lib/supabase/middleware.ts` - Session management
- `next.config.ts` - Security headers

## Decisions Made
- Google OAuth must use Route Handler, not Server Action (PKCE cookies)
- Callback route must set cookies on Response object, not via cookies()
- Security headers configured in next.config.ts
- SQL injection prevention via input sanitization in search

## Configuration
- Supabase project: korejtgfvyegpmkvbngm
- Vercel team: team_W6zfVpiJ8QIRytp0OpvOX6D1
- Domain: apps.jbcloud.app (DNS via Cloudflare, proxy OFF)
- Google OAuth Client ID: 1021166552546-i14jutuo3eilrhm8ouuqtpirlnk79tlh.apps.googleusercontent.com

## Supabase Auth URLs (must be configured)
- Site URL: https://apps.jbcloud.app
- Redirect URLs:
  - https://apps.jbcloud.app/callback
  - https://apps.jbcloud.app/reset-password

## Important Lessons Learned
1. Server Actions CANNOT set PKCE cookies - use Route Handlers for OAuth
2. Vercel env vars must point to correct Supabase project (was pointing to wrong one)
3. Cloudflare DNS for Vercel: A record, proxy OFF (gray cloud)
4. Supabase CLI config push may not fully update auth providers - verify in dashboard

## Next Steps
1. Add more provider integrations (Railway, AWS, etc.)
2. Add deployment notifications/alerts
3. Test all auth flows thoroughly

## URLs
- Production: https://apps.jbcloud.app
- Docs: https://docs.jbcloud.app/jb-cloud-app-tracker/
- Supabase: https://supabase.com/dashboard/project/korejtgfvyegpmkvbngm
- Google OAuth: https://console.cloud.google.com/apis/credentials

## Notes
- Google OAuth credentials stored in 1Password (tagged: env-var, oauth, google)
- All commits pushed to main, auto-deploys to Vercel
- User deleted admin@jbmdcreations.com from Supabase to start fresh
