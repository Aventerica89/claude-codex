# Project: jb-cloud-app-tracker

## Context
- Type: Web application
- Stack: Next.js 15, Supabase, Tailwind CSS, TypeScript
- Status: Production (live at apps.jbcloud.app)
- Repo: https://github.com/Aventerica89/jb-cloud-app-tracker

## Purpose
Track and manage cloud applications across multiple providers (Vercel, Cloudflare, Railway, AWS, etc.) with a central dashboard.

## Key Decisions
- Server Actions for mutations (type-safe, less boilerplate)
- React Server Components for data fetching
- Row-Level Security on all tables
- User-owned providers seeded on signup
- Auto-sync deployments on page view

## Provider Integrations
- Vercel: API token in settings, project selection, deployment sync
- Cloudflare: API token + account ID, Pages project selection, deployment sync

## Security Implementations
- SQL injection prevention (sanitized search inputs)
- Open redirect protection (validated redirect URLs)
- Security headers in next.config.ts (CSP, HSTS, X-Frame-Options, etc.)
- Input validation with Zod

## Database
- Supabase project: korejtgfvyegpmkvbngm
- Tables: applications, cloud_providers, deployments, environments, tags, application_tags, user_settings

## URLs
- Production: https://apps.jbcloud.app
- Docs: https://docs.jbcloud.app/jb-cloud-app-tracker/
- Supabase: https://supabase.com/dashboard/project/korejtgfvyegpmkvbngm

## Supabase Auth Settings Required
- Site URL: https://apps.jbcloud.app
- Redirect URLs:
  - https://apps.jbcloud.app/callback
  - https://apps.jbcloud.app/reset-password

## Progress
- [x] Core CRUD (applications, providers, tags)
- [x] Deployments tracking
- [x] Dashboard with stats
- [x] Search and filtering
- [x] Dark mode
- [x] Vercel integration
- [x] Cloudflare integration
- [x] Auto-sync on page view
- [x] Custom domain setup
- [x] Security hardening
- [x] Password recovery flow

## Next Session
- Test password recovery flow after updating Supabase redirect URLs
- Consider adding more provider integrations (Railway, AWS, etc.)
- Add deployment notifications/alerts

## Patterns Learned
1. Cloudflare DNS for Vercel: Use A record with proxy OFF (gray cloud)
2. Vercel domain SSL: Can take several minutes to provision
3. Supabase auth: Must update redirect URLs when adding new auth flows
