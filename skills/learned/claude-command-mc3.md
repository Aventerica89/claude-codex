# Multi-Claude Command Center (MC3) - Learned Patterns

**Project:** claude-command (MC3)
**Date:** 2026-02-01
**Session:** Initial implementation + security hardening

## Summary

Implemented MC3 from specification documents - a Next.js dashboard for orchestrating parallel Claude AI workers with full tool execution capabilities and risk-based approval system.

## Key Accomplishments

### 1. Initial Implementation (PR #1 - First Commit)
- Created 39 TypeScript/TSX source files from specifications
- Full-stack Next.js 14 app with App Router
- tRPC API layer with type safety
- Drizzle ORM + PostgreSQL database
- Redis for session storage
- Docker Compose setup

### 2. Security Hardening (PR #1 - Security Fixes)
Fixed 6 critical/high priority security vulnerabilities:
- **Redis Session Storage** - Replaced in-memory Map with Redis for persistence
- **Command Injection Prevention** - Changed from `exec()` to `execFile()` in grep tool
- **Auth Endpoint Protection** - Added `/api/auth/check` to PUBLIC_PATHS
- **API Route Protection** - Protected `/api/trpc` and `/api/sessions` with 401 responses
- **Valid Model Names** - Updated to `claude-3-5-sonnet-20241022`
- **Ripgrep Installation** - Added to Dockerfile for grep tool functionality

### 3. TypeScript Fixes (PR #1 - Final Fixes)
- Fixed status config type consistency (pulse property)
- Updated Session interface for nullable progress
- Handled null progress values with nullish coalescing

## Technical Patterns Discovered

### Pattern: Command Injection Prevention
**Problem:** Using `exec()` with string concatenation allows shell injection.
```typescript
// WRONG
const { stdout } = await execAsync(args.join(' '), {...})

// CORRECT
const { stdout } = await execFileAsync('rg', args, {...})
```

### Pattern: Redis Session Management
**Problem:** In-memory session storage loses data on restart.
```typescript
// Store with expiry
await redis.setex(`${PREFIX}${token}`, MAX_AGE, JSON.stringify(data))

// Retrieve
const data = await redis.get(`${PREFIX}${token}`)

// Delete
await redis.del(`${PREFIX}${token}`)
```

### Pattern: Middleware Route Protection
**Problem:** Different route types need different unauthorized responses.
```typescript
// Dashboard routes → redirect to login
if (pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/login', request.url))
}

// API routes → return 401
if (pathname.startsWith('/api/')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Pattern: Type-Safe Status Configs
**Problem:** Union types with optional properties cause TypeScript errors.
```typescript
// WRONG - Some have pulse, some don't
const statusConfig = {
  idle: { color: 'bg-gray-500', label: 'Idle' },
  running: { color: 'bg-green-500', label: 'Running', pulse: true },
}

// CORRECT - All have consistent shape
const statusConfig = {
  idle: { color: 'bg-gray-500', label: 'Idle', pulse: false },
  running: { color: 'bg-green-500', label: 'Running', pulse: true },
}
```

## Architecture Highlights

### Risk Assessment System
- Pattern matching for dangerous commands (rm, sudo, curl with pipes)
- Three risk levels: low (safe reads), medium (writes), high (destructive)
- Approval queue for high-risk operations
- Manual approval required before execution

### Tool Execution Framework
- **Bash** - Shell command execution with timeout and working directory
- **Read** - File reading with line numbers and offset/limit
- **Write** - File creation/overwriting with safety checks
- **Edit** - String replacement with exact matching
- **Glob** - File pattern matching with glob library
- **Grep** - Ripgrep-based content search with filters

### Event-Driven Worker Architecture
- ClaudeManager orchestrates multiple workers
- Workers emit events: message, tool_use, approval_needed, completed, error
- EventEmitter pattern for real-time updates
- WebSocket-ready for future UI streaming

## Files Changed (Total: 41 files)

### Core Implementation
- `src/lib/claude/worker.ts` - Claude conversation loop with tool execution
- `src/lib/claude/manager.ts` - Multi-worker orchestration
- `src/lib/tools/*.ts` - Tool implementations (bash, files, search)
- `src/lib/db/schema.ts` - Database schema with Drizzle ORM
- `src/lib/auth/index.ts` - Redis-backed session management

### API Layer
- `src/app/api/trpc/[trpc]/route.ts` - tRPC endpoint
- `src/server/routers/*.ts` - Sessions, templates, approvals routers

### UI Components
- `src/app/dashboard/page.tsx` - Main dashboard
- `src/components/dashboard/*.tsx` - Session cards, grids, controls

### Infrastructure
- `docker-compose.yml` - Multi-container setup (app, postgres, redis)
- `docker/Dockerfile` - Production Next.js build with ripgrep
- `docker/init-db.sql` - PostgreSQL schema and seed data

## Next Steps

1. **Testing** - Add unit/integration/E2E tests (currently 148 test files, need implementation)
2. **CI/CD** - Set up GitHub Actions for automated checks
3. **WebSocket Streaming** - Real-time log streaming to dashboard
4. **Template System** - Pre-built task templates (WordPress migration, Vercel deploy, etc.)
5. **Multi-User Support** - User management and permissions (schema ready)
6. **API Usage Tracking** - Cost tracking and rate limiting

## Deployment Notes

- Requires: Node.js 20+, PostgreSQL 16+, Redis 7+
- Environment variables: `ANTHROPIC_API_KEY`, `MC3_PASSWORD`, `DATABASE_URL`, `REDIS_URL`
- Docker recommended for production deployment
- xCloud BYOS deployment target

## Code Review Lessons

- **Always use execFile for external commands** - Prevents shell injection
- **Validate all user inputs** - Even internal APIs need protection
- **Type consistency matters** - Optional properties should be explicit
- **Session storage must be persistent** - In-memory storage is development-only
- **Middleware must handle all route types** - Different routes need different responses

## Repository

- **Repo:** https://github.com/Aventerica89/claude-command
- **PR #1:** MC3 Implementation - Multi-Claude Command Center (Merged)
- **Commits:** 3 total (initial + security fixes + TypeScript fixes)
