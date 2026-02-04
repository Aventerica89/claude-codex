# Project: bricks-cc

## Context
- Type: Web app (Teaching System MVP)
- Stack: Next.js 16, Turso/LibSQL, Drizzle ORM, Vercel
- Status: In progress
- Repository: https://github.com/Aventerica89/bricks-cc
- Live URL: https://bricks-cc.vercel.app

## Purpose
Bricks Builder code generation training system. Teaches AI to generate Bricks Builder code through lessons and scenarios.

## Key Decisions
- **Database**: Turso/LibSQL (serverless SQLite) over traditional PostgreSQL for cost efficiency
- **Auth**: Simple PIN-based admin authentication (ADMIN_PIN env var)
- **Validation**: Custom teaching-validators.ts without DOMPurify to avoid jsdom issues in Vercel serverless
- **Styling**: Force light mode via `color-scheme: light` to prevent dark mode conflicts

## Database Schema
7 teaching tables:
- lessons - Main lesson content
- lesson_scenarios - Scenarios within lessons
- agents - AI agent configurations
- agent_instructions - Instructions for agents
- build_sessions - Code generation sessions
- visual_comparisons - Before/after screenshots
- content_assets - Media/asset storage

## Progress
- [x] Database setup (Turso tables created)
- [x] Teaching API routes (/api/teaching/lessons, /api/teaching/scenarios)
- [x] Lesson list page (/teaching)
- [x] Lesson creation (/teaching/lessons/new)
- [x] Lesson detail page with Add Scenario (/teaching/lessons/[id])
- [x] UI fixes (white text, dark mode)
- [x] Documentation synced to docs.jbcloud.app
- [ ] Scenario detail/edit pages
- [ ] Agent configuration UI
- [ ] Build session execution
- [ ] Visual comparison tool

## Next Session
- Start with: Scenario detail/edit pages
- Consider: Adding agent configuration UI
- Note: Test lesson exists at lesson_jRLsfxbO0CG_tS_M
- Docs: https://docs.jbcloud.app/bricks-cc/

## Session History

### February 3, 2026
- Synced documentation to jb-cloud-docs repository
- Fixed URLsToGo PR #64 security issues (XSS, debug overlay)
- Merged PR #64 to main

### February 2, 2026
- Fixed white text UI issue
- Rewrote lesson detail page with working Add Scenario
- Added toast notifications and improved styling
- Deployed to production

## Environment Variables
Required in Vercel:
- TURSO_DATABASE_URL
- TURSO_AUTH_TOKEN
- ADMIN_PIN
- ENCRYPTION_KEY
- INTERNAL_API_URL
- NEXT_PUBLIC_APP_URL

## Learned Patterns
- **Serverless validation**: Avoid isomorphic-dompurify in serverless - use simple HTML escaping
- **Dark mode fix**: Use `color-scheme: light` in CSS to force light mode
- **Vercel env vars**: Watch for trailing newlines when setting via CLI
- **Turso setup**: Run setup-db-direct.mjs script to create tables

## Key Files
- `src/utils/teaching-validators.ts` - Validation without DOMPurify
- `src/app/teaching/` - Teaching UI pages
- `src/app/api/teaching/` - Teaching API routes
- `scripts/setup-db-direct.mjs` - Database table creation
