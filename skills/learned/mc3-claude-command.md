# Project: MC3 (Multi-Claude Command Center)

## Context
- **Type:** Dashboard application
- **Stack:** Next.js 14, React 18, TypeScript, PostgreSQL, Redis, Anthropic SDK
- **Status:** In progress - core implementation complete
- **Purpose:** Manage parallel Claude AI workers with tool execution and approval system

## Key Decisions

### Architecture
- **Next.js App Router** - Familiar stack, built-in API routes, SSR support
- **tRPC** - End-to-end type safety between frontend and backend
- **Drizzle ORM** - Type-safe database access with PostgreSQL
- **Server-Sent Events** - Real-time updates without WebSocket complexity

### Tool System
- **All terminal tools enabled** - Bash, Read, Write, Edit, Glob, Grep
- **Risk-based approval** - High risk requires approval, medium/low auto-approve
- **Read-only commands whitelisted** - `ls`, `git status`, etc. are low risk

### Authentication
- **Simple password-based** - Personal use, single user
- **Optional** - Disabled if MC3_PASSWORD not set in .env
- **Session cookies** - 7-day expiry, in-memory session store

### Deployment
- **xCloud + Hetzner** - User will set up themselves (~$20/month)
- **Docker Compose** - Simplified setup with MC3 + Postgres + Redis
- **No env-var-assistant initially** - Lower priority, can add later

## Progress

- [x] Phase 1: Project structure and config
- [x] Phase 2: Database schema (Drizzle ORM)
- [x] Phase 3: Claude Worker implementation
- [x] Phase 4: Tool execution system (6 tools)
- [x] Phase 5: Dashboard UI (sessions, approvals, stats)
- [x] Phase 6: Authentication system
- [x] Phase 7: Docker configuration
- [ ] Phase 8: User testing and deployment
- [ ] Phase 9: Production deployment to xCloud

## Implementation Details

### Files Created (39 source files)

**Core Services:**
- `src/lib/claude/worker.ts` - Claude worker with conversation loop, tool execution
- `src/lib/claude/manager.ts` - Session orchestration, event handling
- `src/lib/tools/*.ts` - Tool implementations (Bash, files, search)

**Database:**
- `src/lib/db/schema.ts` - Tables: sessions, logs, approvals, templates, api_usage
- Uses Drizzle ORM with PostgreSQL

**Authentication:**
- `src/lib/auth/index.ts` - Password hashing, session management
- `src/middleware.ts` - Route protection

**Dashboard:**
- `src/app/dashboard/page.tsx` - Main dashboard
- `src/components/dashboard/*.tsx` - SessionGrid, ApprovalQueue, StatsBar, etc.

**API:**
- `src/lib/trpc/routers/*.ts` - sessions, approvals, templates, stats

### Tool Risk Levels

**High Risk (requires approval):**
- `rm -rf`, `DROP TABLE`, `git push --force`, fork bombs, disk operations

**Medium Risk (auto-approve for now):**
- Most Bash commands, Write, Edit

**Low Risk:**
- Read-only commands: `ls`, `git status`, `cat`, etc.
- Read, Glob, Grep

## Next Session

### Start With
1. User testing locally (`npm install && npm run dev`)
2. Fix any bugs found during testing
3. Prepare for xCloud deployment

### Potential Issues
- Need to install `ripgrep` for Grep tool to work (`brew install ripgrep`)
- May need to adjust approval thresholds based on user preference
- Database migrations need to be run on first setup

## Learned Patterns

### Pattern: Multi-Worker Management System
**Use When:** Building a dashboard to orchestrate multiple AI agents/workers

**Key Components:**
1. Manager class - Orchestrates workers, handles events
2. Worker class - Individual agent with conversation loop
3. Event system - Real-time updates via EventEmitter
4. Tool registry - Centralized tool definitions and execution
5. Risk assessment - Pattern matching for dangerous operations

**Implementation:**
```typescript
// Manager orchestrates multiple workers
class Manager extends EventEmitter {
  private workers: Map<string, Worker>

  createWorker(config) {
    const worker = new Worker(config)
    this.setupListeners(worker)
    this.workers.set(worker.id, worker)
  }
}

// Worker handles individual sessions
class Worker extends EventEmitter {
  async runConversationLoop() {
    while (continueLoop) {
      const response = await anthropic.messages.create({
        tools: getToolDefinitions()
      })
      const results = await handleToolUses(response.toolUses)
    }
  }
}
```

### Pattern: Approval Queue for Risky Operations
**Use When:** AI agents execute commands that could be dangerous

**Implementation:**
- Pattern matching on command strings
- Risk levels: low, medium, high
- Pause worker, emit approval event, await user decision
- Resume or reject based on response

```typescript
assessRisk(toolUse): RiskLevel {
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(command)) return 'high'
  }
  return 'medium' // or 'low'
}

if (requiresApproval(toolUse)) {
  worker.pause()
  const approved = await requestApproval(toolUse)
  if (approved) worker.resume()
}
```

### Pattern: Tool Registry System
**Use When:** Multiple tools need to be exposed to AI with type safety

**Structure:**
```typescript
interface Tool {
  name: string
  description: string
  inputSchema: Anthropic.Tool['input_schema']
  execute(input): Promise<ToolResult>
}

const registry = new Map<string, Tool>()
export function getToolDefinitions() {
  return Array.from(registry.values()).map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.inputSchema
  }))
}
```

## Repository
- **GitHub:** https://github.com/Aventerica89/claude-command
- **Branch:** frozen-raccoon-72e0ab
- **PR:** https://github.com/Aventerica89/claude-command/pull/1
