
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

