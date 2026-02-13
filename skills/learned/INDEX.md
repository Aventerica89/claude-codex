
## 2026-02-12 Bricks-CC Basecamp Chat Integration

### llm-context-injection-anti-fetch.md
When pre-fetching data into an LLM's context, the LLM may still say "I'll fetch..." and emit query actions. Fix with explicit CRITICAL RULES in system prompt: "NEVER say I'll fetch", "ANSWER DIRECTLY from context data", and remove read-only actions from supported list.

**Use when:** Building chat interfaces with pre-fetched context (CRM, project management, RAG)

**Key insight:** LLMs follow path of least resistance; if a "query" action is listed as available, they'll use it even when data is already in context. The fix is prompt engineering, not architecture.

---

### auto-match-entities-by-name.md
Bidirectional case-insensitive substring matching to auto-link entities across systems (e.g., site name <-> Basecamp project name) without requiring manual foreign key IDs.

**Use when:** Linking entities across different systems where users name things consistently

**Key insight:** Check both directions (A contains B, B contains A) with fallback to explicit ID and then to first-available

---

### serverless-api-timeout-guard.md
Wrapping external API calls in Promise.race with timeout guards for serverless functions. Includes scope limiting (fetch list + 1 detail, not all details) and graceful degradation.

**Use when:** Calling external APIs from Vercel/Lambda/Workers functions, especially chaining sequential calls

**Key insight:** Vercel Hobby = 10s timeout; use 8s safety valve. Fetch details for ONE entity, not all.

---

## 2026-02-12 VaporForge Gemini MCP Integration

### zero-dep-mcp-server-pattern.md
Template for building zero-dependency MCP servers that run inside Cloudflare Sandbox containers. Covers JSON-RPC 2.0 protocol, stdio transport, tool definition, Dockerfile embedding via heredoc, and SDK spawning config.

**Use when:** Adding new AI providers or external APIs as MCP tools in sandboxed environments, building stdio MCP servers

**Key insight:** Use newline-delimited JSON transport (not content-length headers); tool errors use `isError: true` on the result, not JSON-RPC error objects

---

### vaporforge-provider-integration-pattern.md
Complete checklist and architecture for adding new AI providers to VaporForge. Covers the two-KV separation (secrets vs config), conditional MCP injection, settings tab pattern, and the 10-file checklist for a new provider.

**Use when:** Adding OpenAI, Mistral, or other AI providers to VaporForge; extending the AI Providers settings system

**Key insight:** Separate API keys (user-secrets) from provider preferences (user-ai-providers) — keys flow via existing collectUserSecrets() pipeline, config is metadata only

---

## 2026-02-05 Renvio Companion App Patterns

### shadcn-registry-sync.md
Maintaining synchronized copies of shadcn/ui components in registry directories. When updating component interfaces (adding props), registry copies under `registry/new-york/` must also be updated or build fails with type errors.

**Use when:** Modifying shadcn component props, build fails with registry type errors, updating component interfaces

**Key insight:** Registry copies are not auto-synced; must manually update all occurrences across components/, blocks/, and example/ directories

---

### dnd-kit-sortable-pattern.md
Complete pattern for implementing drag-and-drop list reordering using @dnd-kit/sortable. Covers DndContext setup, SortableContext wrapper, useSortable hook per item, arrayMove for immutable reordering, and how to separate drag handles from clickable content.

**Use when:** Building sortable lists, implementing DnD with @dnd-kit, reordering collections

**Key insight:** Use arrayMove for immutable state updates; separate drag handle listeners from clickable content to avoid interaction conflicts

---

### nextjs-route-groups-shell.md
Shell command quoting patterns for Next.js App Router route groups with parentheses. Route group paths like `src/app/(dashboard)/` require quoted strings in shell commands to prevent interpretation as subshells.

**Use when:** Working with route group files via CLI, git commands, npm scripts on paths with parentheses

**Key insight:** Always quote route group paths in shell: `'src/app/(dashboard)/'` not `src/app/(dashboard)/`

---

## 2026-02-05 Session Patterns

### shadcn-tabs-tabbed-pages.md
Installing and using shadcn/ui Tabs component for tabbed settings pages. Covers installation, Server Component integration, form organization, scroll behavior, and when to use vs alternatives.

**Use when:** Building settings/admin pages with 3+ logical sections, need tabbed interface without routing

**Key insight:** Tabs is a client component but works directly in Server Component pages

---

### radix-ui-package-unification.md
Understanding Radix UI's migration from individual `@radix-ui/*` packages to unified `radix-ui` package. Explains why code review tools incorrectly flag it as missing and how to verify/ignore false positives.

**Use when:** radix-ui flagged as missing by linter/Gemini, debugging "package not found" errors

**Key insight:** Verify with `npm list radix-ui` - linters are outdated, not the code

---

### session-2026-02-05-parallel-edits.md
Pattern for executing multiple independent file edits in parallel for ~66% time savings. Includes safety checklist, when parallel is safe vs when sequential is needed, and recommendation matrix.

**Use when:** Refactoring with multiple independent file changes, optimizing multi-file edits

**Key insight:** Parallel is safe when changes have no cross-file dependencies; identify dependencies first

---

### claude-plugin-marketplace-installation.md
Installing official Claude plugins from the Anthropic marketplace. Covers two-step setup (marketplace registration + bulk installation), full marketplace architecture, and bulk installation patterns.

**Use when:** Setting up official Claude plugins, bulk installation from marketplace, adding multiple plugins at once

**Key insight:** Must add marketplace once with `claude plugin marketplace add anthropics/claude-plugins-official` before installing - always use `@anthropics/claude-plugins-official` suffix when installing

