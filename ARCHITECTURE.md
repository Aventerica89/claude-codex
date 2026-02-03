# Claude Codex Backend Architecture

## Overview

Backend system to power the Claude Codex dashboard with real-time connection status and visual GUI for managing agents, commands, skills, and rules.

---

## Reference Plugin Patterns (from Anthropic)

### Directory Structure (Standard)
```
plugins/claude-codex/
├── .claude-plugin/
│   └── manifest.json        # Plugin metadata
├── agents/                   # Agent definitions (code-explorer, code-architect, etc.)
├── commands/                 # Slash commands
├── skills/                   # Skills
├── rules/                    # Rule definitions
├── hooks/                    # Lifecycle hooks
└── README.md
```

### Key Patterns from Reference Plugins

| Plugin | Pattern | Apply To |
|--------|---------|----------|
| feature-dev | 7-phase workflow with parallel agents | Complex codex operations |
| claude-md-management | Session learning capture | Codex item updates |
| frontend-design | Context-aware aesthetics | Dashboard UI generation |
| typescript-lsp | Language server integration | Code intelligence |
| ux-researcher | Research agents | User workflow analysis |

---

## Core Features

### 1. Dashboard with Connection Status

Visual indicators for connected apps/services:

```
┌─────────────────────────────────────────────────┐
│  Connected Services                             │
├─────────────────────────────────────────────────┤
│  ● Vercel        Connected    2ms latency       │
│  ● Cloudflare    Connected    5ms latency       │
│  ● 1Password     Connected    12ms latency      │
│  ● GitHub        Warning      150ms latency     │
│  ● Turso DB      Offline      --                │
└─────────────────────────────────────────────────┘
```

**Status Colors:**
- Green (●): Connected, < 100ms latency
- Yellow (●): Warning, 100-500ms latency or degraded
- Red (●): Offline or > 500ms latency

### 2. Agent/Command Visual GUI Mapping

Each codex item (command, agent, skill, rule) maps to a visual card with configurable options:

```tsx
interface CodexItemGUI {
  id: string;
  type: 'command' | 'agent' | 'skill' | 'rule';
  name: string;
  description: string;

  // Visual config
  icon: string;
  color: string;

  // GUI fields (text boxes, selects, etc.)
  inputs: {
    name: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number';
    label: string;
    placeholder?: string;
    options?: string[];
    default?: any;
    required?: boolean;
  }[];

  // Actions
  primaryAction: string;
  secondaryActions?: string[];

  // State
  enabled: boolean;
  lastUsed?: Date;
  usageCount: number;
}
```

---

## Backend Tech Stack

### Option A: Serverless (Recommended for MVP)
```
├── Vercel Functions (API routes)
├── Turso (SQLite edge database)
├── Upstash Redis (caching, real-time)
└── 1Password (secrets via op inject)
```

### Option B: Full Backend
```
├── Hono / Elysia (TypeScript API)
├── Turso (database)
├── Drizzle ORM
└── Docker deployment
```

---

## Database Schema (Turso/SQLite)

```sql
-- Connected services status
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'platform', 'database', 'api', 'tool'
  endpoint TEXT,
  status TEXT DEFAULT 'unknown' CHECK(status IN ('connected', 'warning', 'offline', 'unknown')),
  latency_ms INTEGER,
  last_check DATETIME,
  config TEXT -- JSON
);

-- Agents/Commands mapping for GUI
CREATE TABLE codex_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL, -- 'command', 'agent', 'skill', 'rule'
  name TEXT NOT NULL,
  description TEXT,
  usage TEXT,
  category TEXT,
  tags TEXT, -- JSON
  icon TEXT,
  color TEXT,
  inputs TEXT, -- JSON array of input field configs
  enabled INTEGER DEFAULT 1, -- SQLite uses INTEGER for boolean (1=true, 0=false)
  last_used DATETIME,
  usage_count INTEGER DEFAULT 0
);

-- User preferences
CREATE TABLE preferences (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Routes

```
GET    /api/services          Get all service statuses
POST   /api/services/check    Trigger status check for all services
POST   /api/services/:id/ping Ping specific service
PUT    /api/services/:id      Update service config

GET    /api/codex             Get all codex items (agents, commands, etc.)
GET    /api/codex/:type       Get items by type
GET    /api/codex/:id         Get single item with full config
PUT    /api/codex/:id         Update codex item config
POST   /api/codex/:id/run     Execute a codex item

GET    /api/preferences       Get user preferences
PUT    /api/preferences       Update preferences
```

---

## Next Steps

1. **Phase 1**: Create dashboard layout with service status cards
2. **Phase 2**: Build codex item visual cards from brain-data.ts
3. **Phase 3**: Add Turso backend for persistence
4. **Phase 4**: Implement service health checking
5. **Phase 5**: Add input forms for each codex item type

---

## Future Integrations

- **jb-cloud-app-tracker** (https://github.com/Aventerica89/jb-cloud-app-tracker) - Connect for app tracking and status monitoring across cloud services
