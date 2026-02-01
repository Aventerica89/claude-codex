# Project: renvio-companion-app

## Context
- **Type**: Healthcare EMR Companion App
- **Stack**: Next.js 15, Turso (libSQL), Drizzle ORM, Better Auth, Tailwind CSS, shadcn/ui
- **Status**: Foundation phase - authentication complete
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
- [ ] RBAC role implementation
- [ ] Flowsheet module
- [ ] Vitals capture
- [ ] Patient dashboard

## Recent Session (2026-01-30)

### Accomplished
1. Successfully reverted from Clerk to Better Auth
2. Fixed Vercel build with correct dependencies
3. Removed Clerk environment variables from production
4. Deployed working Better Auth setup to production
5. Both domains working correctly

### PRs Merged
- **PR #16**: Complete Better Auth reversion with schema fix
- **PR #17**: Dependency fix (Clerk → Better Auth packages)

### Files Changed
- `middleware.ts` - Better Auth session validation
- `src/lib/auth/` - Better Auth server and client
- `src/app/api/auth/[...all]/route.ts` - Auth API handler
- `src/app/(auth)/` - Login/signup pages
- `src/components/layout/header.tsx` - Auth hooks
- `src/lib/db/schema.ts` - Better Auth tables
- `package.json` - Dependencies

## Next Session

### Start With
1. Implement RBAC roles (clinicRole field)
2. Create role-based route guards
3. Build admin dashboard for role management
4. Begin flowsheet module design

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
