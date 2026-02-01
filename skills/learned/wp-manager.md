# Project: WP Manager

## Context
- Type: Web App (Dashboard)
- Stack: Next.js 16, Turso (SQLite), Drizzle ORM, Tailwind CSS, shadcn/ui
- Status: Phases 1-3 complete, Phase 4 planned
- Repo: https://github.com/Aventerica89/jb-cloud-wp-manager
- Live: https://jb-cloud-wp-manager.vercel.app
- Docs: https://docs.jbcloud.app/wp-manager/
- Last Session: 2026-01-31 (pause context: wp-manager-2026-01-30-234759)

## Key Decisions

### Authentication
- JWT sessions with `jose` library
- Optional password via `ADMIN_PASSWORD` env var
- Auth bypassed in dev if not set
- 7-day session duration

### Layout Architecture
- Route groups: `(auth)` for login, `(dashboard)` for main pages
- Root layout is minimal (html/body/toaster only)
- Sidebar lives in dashboard layout

### Security
- Rate limiting: 100 req/min general, 5 login attempts/min
- Security headers in middleware
- ID validation with `parseId()` helper
- LIKE escaping for search queries
- IP masking in exports by default

### Organization
- Projects with color coding (10 preset colors)
- Favorites sort to top
- Archive for inactive sites
- Global search via command palette (Cmd+K)

## Progress
- [x] Phase 1: MVP (site management, dashboard, plugin/theme listing, health checks, bulk sync)
- [x] Phase 2: Core Features (bulk updates, activity logging, credential editing, TDD utilities, shadcn migration)
- [x] Phase 3: Polish (charts, health scoring, toast notifications, responsive sidebar, validation, 63 tests @ 100% coverage)
- [ ] Phase 4: Advanced Features (user management, scheduled syncing, backup coordination, security scanning)

## Next Session
- Start with: Phase 4 feature selection
  - User management across sites
  - Scheduled syncing with cron jobs
  - Backup coordination
  - Security scanning
- Blockers: None
- Notes: User skipped app renaming discussion (can revisit later)

## Learned Patterns

### Next.js Route Groups
Use `(groupName)` folders to share layouts without affecting URLs:
```
app/
├── (auth)/
│   └── login/page.tsx      → /login
├── (dashboard)/
│   ├── layout.tsx          → has sidebar
│   └── sites/page.tsx      → /sites
└── layout.tsx              → minimal root
```

### Vercel CLI for Env Vars
```bash
vercel env add VARIABLE_NAME
vercel env ls
vercel --prod  # redeploy
```

### Security Utilities Pattern
Create `lib/api-utils.ts` with:
- `parseId()` - validate route params
- `escapeLikePattern()` - SQL injection prevention
- `sanitizeError()` - redact sensitive data in logs
- `apiError()` - consistent error responses
