# Project: WP Manager

## Context
- Type: Web App (Dashboard)
- Stack: Next.js 16, Turso (SQLite), Drizzle ORM, Tailwind CSS, shadcn/ui
- Status: Phase 5 complete, active development
- Repo: https://github.com/Aventerica89/jb-cloud-wp-manager
- Live: https://cloud-manager.jbcloud.app
- Docs: https://docs.jbcloud.app/wp-manager/

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
- [x] Phase 1: Foundation (CRUD, health checks, bulk sync)
- [x] Phase 2: Core (bulk updates, activity log, TDD utilities)
- [x] Phase 3: Polish (charts, health scores, mobile sidebar)
- [x] Phase 4: Server/Provider management
- [x] Phase 5: Organization & Security
- [ ] Phase 6: User management, scheduled sync, backups

## Next Session
- Consider adding logout button to UI
- User management across WordPress sites
- Scheduled syncing with cron jobs

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
