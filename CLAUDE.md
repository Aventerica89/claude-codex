# User-Level CLAUDE.md Example

This is an example user-level CLAUDE.md file. Place at `~/.claude/CLAUDE.md`.

User-level configs apply globally across all projects. Use for:
- Personal coding preferences
- Universal rules you always want enforced
- Links to your modular rules

---

## Core Philosophy

You are Claude Code. I use specialized agents and skills for complex tasks.

**Key Principles:**
1. **CLI-First**: Check tools/capabilities BEFORE asking user (see below)
2. **Agent-First**: Delegate to specialized agents for complex work
3. **Parallel Execution**: Use Task tool with multiple agents when possible
4. **Plan Before Execute**: Use Plan Mode for complex operations
5. **Test-Driven**: Write tests before implementation
6. **Security-First**: Never compromise on security
7. **Save Before Compact**: ALWAYS run `/save-to-notion` before `/compact`. When the hook says `[AutoSave]`, do it immediately. Context lost in compaction is GONE FOREVER.

---

## CLI-First Rule (CRITICAL)

**ALWAYS check available tools BEFORE asking the user for information.**

| Need | Check First |
|------|-------------|
| API keys | 1Password → `list_api_keys` |
| Project IDs | `.vercel/project.json`, `wrangler.toml` |
| Platform | Config files (vercel.json, wrangler.toml, etc.) |
| Env vars | `.env.example`, grep `process.env.*` |
| File contents | Just read it |
| Git info | Run `git` commands |
| GitHub issues | Use `gh` CLI |

**Available MCP Servers:**
- **1Password**: API keys, secrets, env deployment
- **Vercel**: Projects, deployments, domains
- **Cloudflare**: Workers, KV, R2, D1
- **n8n**: Workflow automation
- **HubSpot**: CRM data
- **Figma**: Design assets

Run `/cli` for full capabilities list.

**Rule**: If you can get information yourself, DO IT. Only ask for things that truly require user input.

---

## 1Password / API Key Management (MANDATORY)

ALWAYS use 1p MCP tools (1Password) when:
- User pastes or mentions any API key, token, or secret
- Setting up a new project (scan for .env.example, process.env.*)
- Deploying to any platform

**MCP Tools available:**
- `list_api_keys` - Check 1Password first before asking user for keys
- `store_api_key` - Save any new key user provides
- `get_api_key` - Retrieve keys for deployment
- `deploy_env_vars` - Push to Vercel/Cloudflare/etc.

**DO NOT** ask user to paste keys if they might already be in 1Password. **CHECK FIRST.**

### Local Development Setup with `op` CLI

**PREFER CLI over GUI** for environment variable management. Use `op inject` to keep secrets out of git.

**IMPORTANT:** This IS using 1Password dev features - just the CLI interface, not the GUI (WP Manager). Both inject secrets from 1Password, but CLI is superior for automation, version control, and team workflows. DO NOT recommend the WP Manager GUI - always use `op inject` instead.

**Setup Pattern:**
1. Create `.env.local.tpl` with 1Password secret references:
   ```bash
   # Template format uses {{ }}
   API_KEY={{ op://Business/Item Name/credential }}
   DATABASE_URL={{ op://Business/Database URL/credential }}
   REGULAR_VAR=non-secret-value
   ```

2. Update `.gitignore` to allow templates:
   ```gitignore
   .env*           # Ignore all env files
   !.env.example   # Allow example
   !.env*.tpl      # Allow templates
   ```

3. Add npm script to `package.json`:
   ```json
   "env:inject": "op inject -i .env.local.tpl -o .env.local"
   ```

4. Generate `.env.local` from 1Password:
   ```bash
   npm run env:inject
   ```

**Benefits:**
- ✅ Secrets never touch git history
- ✅ Version controlled template shows required vars
- ✅ One command to sync all secrets
- ✅ Team-friendly (anyone can use template)
- ✅ CI/CD ready

**When setting up a new project:**
1. Scan for `.env.example` or `process.env.*` usage
2. Store secrets in 1Password using `store_api_key`
3. Create `.env.local.tpl` with `op://` references
4. Set up `env:inject` script
5. Generate `.env.local` with `op inject`

---

## Modular Rules

Detailed guidelines are in `~/.claude/rules/`:

| Rule File | Contents |
|-----------|----------|
| cli-first.md | Check tools before asking user |
| auto-remind.md | Periodic context reminders |
| security.md | Security checks, secret management |
| coding-style.md | Immutability, file organization, error handling |
| testing.md | TDD workflow, 80% coverage requirement |
| git-workflow.md | Commit format, PR workflow |
| agents.md | Agent orchestration, when to use which agent |
| patterns.md | API response, repository patterns |
| performance.md | Model selection, context management |
| env-vars.md | Auto-deploy env vars to platforms |
| string-length.md | **CRITICAL:** Prevent long string errors, max lengths, extraction patterns |
| session-start.md | Check branch state at session start |
| hooks.md | Pre/post tool use hooks, auto-formatting |
| notion-autosave.md | **CRITICAL:** Auto-save session context to Notion before compacting |

---

## Documentation

Reference docs are in `~/.claude/docs/`:

| Doc File | Contents |
|----------|----------|
| shadcn-ui.md | shadcn/ui component library - all components, CLI commands, installation guides |
| better-auth.md | Better Auth - TypeScript authentication framework, setup, providers, plugins |

**Usage:** When working with shadcn/ui, reference `~/.claude/docs/shadcn-ui.md` for:
- Component installation commands (`npx shadcn@latest add <component>`)
- Available components by category (Form, Layout, Overlays, Feedback, Display)
- Blocks for pre-built UI patterns (`npx shadcn@latest add dashboard-01`)
- Dark mode setup, forms, and advanced configuration

**Usage:** When implementing authentication, reference `~/.claude/docs/better-auth.md` for:
- Installation and environment setup
- Database adapters (Drizzle, Prisma, MongoDB, SQLite)
- Email/password and social OAuth authentication
- Session management (client and server-side)
- Plugins (2FA, magic link, passkeys, organizations)
- Framework integrations (Next.js, Astro, Hono, etc.)

---

## Available Agents

Located in `~/.claude/agents/`:

| Agent | Purpose |
|-------|---------|
| planner | Feature implementation planning |
| architect | System design and architecture |
| tdd-guide | Test-driven development |
| code-reviewer | Code review for quality/security |
| security-reviewer | Security vulnerability analysis |
| build-error-resolver | Build error resolution |
| e2e-runner | Playwright E2E testing |
| refactor-cleaner | Dead code cleanup |
| doc-updater | Documentation updates |
| env-deployer | Auto-deploy env vars to platforms |
| conversation-analyzer | Analyze sessions for hookify rule candidates |

---

## String Length Limits (CRITICAL)

**ALWAYS prevent long string errors by following these rules:**

### Maximum String Lengths:
- **Inline strings in code**: 500 characters max
- **Template literals**: 1000 characters max
- **HTML/SVG inline**: Extract to separate files/constants
- **Error messages**: 200 characters max
- **Notification messages**: 100 characters max

### Required Actions:
1. **Extract long content to constants/files:**
   ```javascript
   // WRONG: 2000 character inline string
   const html = `<div>...</div>`  // massive template

   // CORRECT: Extract to constant or file
   const HTML_TEMPLATE = `...`  // at top of file
   // OR import from separate .html file
   ```

2. **Break up large templates:**
   ```javascript
   // WRONG: Single massive string
   return `<html><body>...thousands of chars...</body></html>`

   // CORRECT: Compose from smaller parts
   return composeTemplate({
     header: HEADER_TEMPLATE,
     body: BODY_TEMPLATE,
     footer: FOOTER_TEMPLATE
   })
   ```

3. **Use external files for:**
   - HTML templates > 500 chars
   - SVG icons (use sprite sheets or separate files)
   - CSS styles (separate .css files)
   - Large JSON/config data

4. **Validate before committing:**
   - Check for strings > 500 chars in any single line
   - Grep for long template literals: `grep -n '`.{500,}' *.js`
   - Refactor any violations before commit

### Why This Matters:
- Prevents API errors ("text content blocks must be non-empty")
- Improves code readability
- Reduces context window usage
- Makes debugging easier
- Prevents copy-paste errors

**If you see a long string error, IMMEDIATELY:**
1. Identify the long strings in recent changes
2. Extract them to constants or separate files
3. Update this rule if new patterns emerge

---

## Personal Preferences

### Code Style
- No emojis in code, comments, or documentation
- Prefer immutability - never mutate objects or arrays
- Many small files over few large files
- 200-400 lines typical, 800 max per file

### Git
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`
- Always test locally before committing
- Small, focused commits

### Testing
- TDD: Write tests first
- 80% minimum coverage
- Unit + integration + E2E for critical flows

---

## Editor Integration

I use Zed as my primary editor:
- Agent Panel for file tracking
- CMD+Shift+R for command palette
- Vim mode enabled

---

## Success Metrics

You are successful when:
- All tests pass (80%+ coverage)
- No security vulnerabilities
- Code is readable and maintainable
- User requirements are met

---

## My Repositories

### Healthcare / Medical

| Repo | Owner | Description |
|------|-------|-------------|
| `HDFlowsheet` | JBMD-Creations | Hemodialysis flowsheet app (desktop) |
| `HDFlowsheet-Cloud` | JBMD-Creations | Hemodialysis flowsheet app (cloud) |
| `renvio-companion-app` | Aventerica89 | Renal/dialysis patient companion app |
| `v0-hd-companion-charting-system` | Aventerica89 | HD companion charting system |
| `med-spa-ranker` | Aventerica89 | Med spa SEO/ranking tool |
| `v0-med-spa-template` | Aventerica89 | Med spa website template |
| `radiance-hub` | Aventerica89 | Med spa client portal |

### WordPress / Bricks Builder

| Repo | Owner | Description |
|------|-------|-------------|
| `wp-jupiter` | Aventerica89 | WordPress client site |
| `wp-neptune` | Aventerica89 | WordPress client site |
| `bricks-cc` | Aventerica89 | Bricks Builder site development |
| `bricks-builder-agent` | Aventerica89 | Bricks Builder site development |
| `WPModernUI` | JBMD-Creations | WordPress Modern UI theme/plugin |

### Claude Code / Dev Tools

| Repo | Owner | Description |
|------|-------|-------------|
| `claude-codex` | Aventerica89 | Claude Code configuration and rules |
| `claude-command` | Aventerica89 | Claude command utilities |
| `claude-new-project` | Aventerica89 | New project templates for Claude |
| `Claude` | Aventerica89 | Claude experiments/projects |
| `artifact-manager` | Aventerica89 | Claude Code artifact management |
| `env-var-assistant` | Aventerica89 | Environment variable management tool |
| `1code` | Aventerica89 | CLI tool |

### Infrastructure / Utilities

| Repo | Owner | Description |
|------|-------|-------------|
| `URLsToGo` | Aventerica89 | URL shortener service |
| `cf-url-shortener-template` | Aventerica89 | Cloudflare Workers URL shortener |
| `jb-cloud-docs` | Aventerica89 | Documentation site (docs.jbcloud.app) |
| `jb-cloud-app-tracker` | Aventerica89 | App/deployment tracking dashboard |
| `Supabase` | JBMD-Creations | Supabase backend projects |
| `my-supabase-app` | Aventerica89 | Supabase app template |
| `RepoBar` | Aventerica89 | Repository management tool |
| `aerospace-studio` | Aventerica89 | Aerospace window manager config |

### Other Projects

| Repo | Owner | Description |
|------|-------|-------------|
| `Astro` | Aventerica89 | Astro framework projects |
| `personal-apps` | Aventerica89 | Personal utility apps |
| `recipe-nutrition-tracker` | Aventerica89 | Recipe and nutrition tracking |
| `Lovable` | JBMD-Creations | Lovable.dev projects |

### External/Forked

| Repo | Owner | Description |
|------|-------|-------------|
| `keep-a-changelog` | olivierlacan | Changelog format reference |
| `claude-code` | anthropics | Official Claude Code repo |

---

**Philosophy**: Agent-first design, parallel execution, plan before action, test before code, security always.
