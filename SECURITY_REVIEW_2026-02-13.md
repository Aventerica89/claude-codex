# Security Review - February 13, 2026

## Branch: `claude/security-review-jXdW2`

### Context

After PR #29 (plugin detail pages) was merged to main, the codebase evolved significantly with a new simplified architecture. The old branch `claude/plugin-detail-pages-jXdW2` had bot review fixes that became incompatible with the new architecture, causing massive merge conflicts.

This security review branch was created from current main to apply relevant security fixes to the new architecture.

---

## Issues Found and Fixed

### 🔴 Critical: SQL Injection in `/api/plugins/toggle.ts`

**Issue:**
Line 36-40 used string interpolation in SQL query:
```typescript
const activatedAt = active ? "datetime('now')" : 'NULL'
await db.execute({
  sql: `UPDATE user_plugins
        SET active = ?, activated_at = ${activatedAt}
        WHERE plugin_id = ? AND installed = 1`,
  args: [active ? 1 : 0, pluginId],
})
```

**Risk:** String interpolation in SQL queries is a security anti-pattern that could lead to SQL injection if the code is modified later.

**Fix:** Use conditional SQL with proper parameterization:
```typescript
const sql = active
  ? `UPDATE user_plugins
     SET active = 1, activated_at = datetime('now')
     WHERE plugin_id = ? AND installed = 1`
  : `UPDATE user_plugins
     SET active = 0, activated_at = NULL
     WHERE plugin_id = ? AND installed = 1`

await db.execute({
  sql,
  args: [pluginId],
})
```

---

### 🟡 Medium: React Key Using Non-Unique Value

**Issue:**
`InstallModal.tsx` line 100 used `name` as React key:
```typescript
{selectedNames.map(name => (
  <span key={name}>
    {name}
  </span>
))}
```

**Risk:** Component names may not be unique, causing React reconciliation issues and potential UI bugs.

**Fix:** Use unique component ID:
```typescript
{selectedComps.map(comp => (
  <span key={comp.id}>
    {comp.name}
  </span>
))}
```

---

### 🟡 Medium: Accessibility Issues in InstallModal

**Issue:**
Modal lacked proper accessibility attributes and keyboard navigation.

**Fix:**
- Added `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Added ESC key handler: `onKeyDown={(e) => e.key === 'Escape' && onClose()}`
- Added `id="install-modal-title"` to modal title for ARIA labeling

---

## Issues Already Protected

### ✅ SQL Injection in `/api/plugins/install.ts`
- Uses parameterized queries correctly
- Validates `pluginId` against static catalog before DB operation
- No path traversal risk (simplified architecture removed `repository_path`)

### ✅ XSS Vulnerabilities
- All markdown rendering uses `DOMPurify` with strict allowlist
- `renderMarkdown()` function in `/lib/markdown.ts` sanitizes all HTML
- Safe to use `dangerouslySetInnerHTML` with sanitized content

### ✅ Weak Cryptography
- No usage of `Math.random()` found in codebase
- Installation endpoint no longer generates random IDs

---

## Comparison: Old vs New Architecture

### Old Architecture (Pre-Merge)
- Complex component selection system
- Database-driven plugin catalog
- `repository_path` parameter (required path traversal validation)
- `component_ids` array (required SQL injection validation)
- Installation recording in database

### New Architecture (Current Main)
- Simplified install/uninstall toggle
- Static plugin catalog from generated file
- No repository selection (simplified)
- Simple pluginId + action API
- Focus on plugin activation state

### Security Implications
The new architecture is **inherently more secure** due to:
- Fewer attack vectors (no path traversal, simpler validation)
- Static catalog (no dynamic plugin loading)
- Simpler code (less complexity = fewer bugs)

---

## Commit Details

**Branch:** `claude/security-review-jXdW2`
**Commit:** `42b1e71`
**Files Changed:** 2 files, 25 insertions, 12 deletions

**Changes:**
- `landing/src/pages/api/plugins/toggle.ts` - SQL injection fix
- `landing/src/components/dashboard/InstallModal.tsx` - React key + accessibility

---

## Next Steps

1. **Create Pull Request** - Merge security fixes to main via GitHub UI
2. **Delete Old Branch** - `claude/plugin-detail-pages-jXdW2` (incompatible with current architecture)
3. **Optional:** Review other modal components for similar accessibility issues

---

## Notes

- Build error with `@xyflow/react` is pre-existing on main branch, not related to these fixes
- Security fixes are minimal and focused only on actual vulnerabilities
- No over-engineering - kept changes simple and targeted

---

**Session:** https://claude.ai/code/session_01CTuJ8Co1dsqs6ji5DhY35x
**Date:** 2026-02-13
**Reviewed By:** Claude Code (Sonnet 4.5)
