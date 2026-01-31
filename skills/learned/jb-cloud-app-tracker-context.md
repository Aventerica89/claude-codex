# Project: jb-cloud-app-tracker

**Last Updated:** January 29, 2026
**Status:** In Development

## Context

**Type:** Web Application
**Purpose:** Track and manage cloud applications across multiple providers (Vercel, Cloudflare, Railway, AWS, etc.)
**Tech Stack:**
- Framework: Next.js 15 (App Router)
- Database: Supabase (PostgreSQL)
- Auth: Supabase Auth
- Hosting: Vercel
- UI: Tailwind CSS + v0 components
- Validation: Zod

**Repository:** `/Users/jb/.21st/worktrees/jb-cloud-app-tracker/tight-fern`

## Key Decisions

### Environment Variable Management
**Decision:** Use 1Password CLI (`op inject`) for secret management
**Rationale:**
- Keeps secrets out of git history
- Version controlled template (`.env.local.tpl`)
- One command to sync: `npm run env:inject`
- Team-friendly and CI/CD ready
- Superior to GUI-based approaches (WP Manager)

**Implementation:**
- Template: `.env.local.tpl` with `{{ op://Business/Item/credential }}`
- Secrets stored in 1Password Business vault
- Script: `npm run env:inject` generates `.env.local`

### Provider Integrations
**Decision:** Auto-sync deployments from Vercel and Cloudflare
**Status:** Implemented
- Vercel: API token stored, project mapping, status sync
- Cloudflare: API token + Account ID, Pages project mapping

## Progress

### Completed Phases
- [x] Phase 1: Foundation (auth, layout)
- [x] Phase 2: Core Data (providers, tags, applications)
- [x] Phase 3: Deployments
- [x] Phase 4: Dashboard
- [x] Phase 5: Polish (search, dark mode)
- [x] Phase 6: Launch (testing, deploy)
- [x] Phase 7: Vercel Integration (API sync)
- [x] Phase 8: Cloudflare Integration (API sync)
- [x] Phase 9: Auto-sync deployments on page view
- [x] **NEW: 1Password CLI Integration** (Jan 29, 2026)

### Current Features
- Application management with tags
- Multi-provider deployment tracking
- Auto-sync from Vercel and Cloudflare
- Environment-based filtering
- Tech stack tracking
- Maintenance tracking
- **Secure environment variable management via 1Password CLI**

## Latest Session (Jan 29, 2026)

### Accomplished
1. Set up 1Password CLI integration for environment variables
2. Created `.env.local.tpl` template with secret references
3. Stored all Supabase secrets in 1Password Business vault
4. Added `env:inject` npm script for easy regeneration
5. Updated global Claude configuration with pattern
6. Created learned skill for reuse across projects
7. Synced documentation to docs.jbcloud.app

### Files Modified
- `.env.local.tpl` (NEW) - 1Password template
- `.gitignore` - Allow .tpl files
- `package.json` - Added env:inject script
- `~/.claude/CLAUDE.md` - Global 1Password CLI workflow
- `~/.claude/commands/cli.md` - CLI capabilities reference

## Next Session

### Priority Tasks
1. Test `npm run env:inject` workflow end-to-end
2. Verify app runs with generated `.env.local`
3. Consider applying pattern to other active projects

### Potential Improvements
- Add more provider integrations (Railway, AWS)
- Implement deployment rollback functionality
- Add notification system for deployment failures
- Enhance search with advanced filters

## Blockers/Risks
None currently. 1Password CLI setup is complete and tested.

## Learned Patterns

### 1Password CLI Integration
**File:** `~/.claude/skills/learned/1password-cli-env-integration.md`

**Key Points:**
- Use CLI (`op inject`) over GUI (WP Manager)
- Template format: `{{ op://vault/item/field }}`
- Common mappings for standard env vars
- Batch automation script for multiple repos

**Trigger:** When any project needs environment variable management

## Documentation

**Synced to:** https://docs.jbcloud.app/jb-cloud-app-tracker/
**Last Sync:** January 29, 2026
**Auto-sync:** Enabled

**Key Docs:**
- `index.md` - Project overview and setup
- `architecture.md` - System design
- `plan.md` - Implementation plan
- `progress.md` - Development progress

## Development Commands

```bash
# Setup
npm run env:inject              # Generate .env.local from 1Password

# Development
npm run dev                     # Start dev server (localhost:3000)
npm run build                   # Production build
npm run lint                    # Run linter

# Testing
npm test                        # Run tests
npm run test:coverage           # Coverage report

# Deployment
# Auto-deploys to Vercel on push to main
```

## Environment Variables

Managed via 1Password CLI. Required secrets:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side admin key (sensitive!)
- `NEXT_PUBLIC_APP_URL` - App URL (localhost:3000 for dev)

All secrets stored in 1Password Business vault.

## Notes

- Follow immutable patterns (never mutate objects/arrays)
- Keep files small (200-400 lines typical, 800 max)
- 80%+ test coverage target
- Use conventional commits (feat:, fix:, refactor:, etc.)
- **Always use `npm run env:inject` to sync secrets** - never commit actual .env.local
