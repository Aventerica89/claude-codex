# Project: renvio-companion-app

## Context
- **Type**: Healthcare EMR Companion App
- **Stack**: Next.js 15, Turso (libSQL), Drizzle ORM, Better Auth, Tailwind CSS, shadcn/ui
- **Status**: Flowsheet dashboard revamp complete (v0.1.0)
- **Domain**: Hemodialysis clinic charting and workflow optimization

## Key Decisions

### Authentication: Better Auth over Clerk
- **Rationale**: HIPAA compliance requirements
- **Better Auth**: Self-hosted, keeps PHI within our control, free
- **Clerk**: Requires Enterprise plan ($999+/mo) for HIPAA BAA
- **Security**: Minimizes third-party risk for healthcare data

### RBAC Approach
- **Simple field-based**: `clinicRole` in users table
- **Roles**: RN Admin, RN, Tech, Manager
- **Rationale**: Straightforward, no complex external configuration needed

### Database: Turso (libSQL)
- **Edge SQLite**: Low latency, cost-effective
- **Drizzle ORM**: Type-safe, lightweight, Turso-optimized

### Routing Fix
- **Issue**: Vercel deployment showed dashboard at root instead of landing page
- **Solution**: Mark `/` as public route in middleware
- **Impact**: Both domains now correctly show landing page

## Progress

- [x] Project scaffolding with Next.js 15
- [x] Turso database setup
- [x] Drizzle ORM integration
- [x] Better Auth implementation
- [x] Database schema with Better Auth tables
- [x] Custom login/signup forms
- [x] Middleware with route protection
- [x] Vercel deployment
- [x] HD Companion merge (all 6 phases)
- [x] Flowsheet dashboard revamp (21 tasks, subagent-driven)
- [ ] RBAC role implementation
- [ ] Vitals capture
- [ ] Patient management

## Recent Session (2026-02-16)

### Accomplished
1. Completed 21-task flowsheet dashboard revamp
2. 3-tier tab hierarchy: Shift > Pod > Patient
3. 7 collapsible flowsheet sections (AtAGlance, TreatmentOrders, TimeTracking, Assignment, Vitals, Meds, Notes)
4. Excel import for treatment orders
5. State persistence via appData table (debounced save/load)
6. Floating actions: Quick Chart, Quick Tools (Snippets + Calculator), Import
7. Applied HIPAA-safe exact patient name matching
8. Zod v4 API validation on state persistence route

### Key Commits
- `0ff04b1` to `56837ef` (24 commits on main)

## Next Session

### Start With
1. Test state persistence end-to-end in production
2. Check for QuickToolsPanel overlap with FloatingActions on flowsheets page
3. Add tests for flowsheet reducer and API route

### Blockers
- None currently

## Learned Patterns

### Better Auth + Turso Setup
```typescript
// Server: src/lib/auth/index.ts
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
})

// Client: src/lib/auth/client.ts
import { createAuthClient } from 'better-auth/react'

export const { signIn, signUp, signOut, useSession } = createAuthClient()
```

### Middleware Pattern
```typescript
import { betterFetch } from '@better-fetch/fetch'

const publicRoutes = ['/', '/login', '/signup']

export default async function middleware(request: NextRequest) {
  const isPublic = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (isPublic) return NextResponse.next()

  // Validate session...
}
```

### HIPAA Auth Decision
- Healthcare apps → Self-hosted auth (Better Auth, Supabase)
- Minimizes third-party PHI exposure
- Avoids expensive Enterprise plans
