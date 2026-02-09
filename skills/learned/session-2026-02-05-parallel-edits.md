# Learned: Parallel File Edits for Independent Changes

**Extracted:** 2026-02-05
**Session:** jb-cloud-app-tracker - Settings page refactor
**Status:** Efficiency pattern for multi-file changes

## Problem

When restructuring a page with multiple independent changes (e.g., installing a new component, moving content, updating styles), you often need to:

1. Install new dependency (shadcn tabs)
2. Restructure main page file (extract TabsContent sections)
3. Update component file (remove old scroll constraints)
4. Add changelog entry

Sequential edits can be slow if you're waiting for each change to complete before starting the next.

## Solution: Parallel Execution

For independent changes with NO dependencies between them, make all edits in parallel:

### Example: Settings Page Refactor

**Setup:**
- File 1: `src/app/(dashboard)/settings/page.tsx` - Restructure with Tabs
- File 2: `src/components/settings/changelog.tsx` - Remove scroll constraints
- File 3: `src/lib/changelog.ts` - Add v1.4.0 entry

**Parallel Approach:**

```
Action 1: Read page.tsx to understand current structure
Action 2: Read changelog.tsx to find scroll constraints
Action 3: Read changelog.ts to find version format

[All 3 read operations happen simultaneously]

Then:

Action 4: Edit page.tsx with new Tabs layout
Action 5: Edit changelog.tsx to remove max-h and overflow classes
Action 6: Edit changelog.ts to add new version entry

[All 3 edits happen simultaneously]
```

## When to Use Parallel Edits

**Use parallel when:**
- Files have zero dependencies on each other
- Changes don't affect each other's structure
- You're making isolated updates (styling, structure, content)
- Multiple files are being modified for same feature

**Examples:**
- Removing a style class from multiple components
- Adding similar code changes to multiple files
- Updating multiple configuration files
- Adding entries to changelog + updating version numbers
- Restructuring layout components independently

## When NOT to Use Parallel Edits

**Use sequential when:**
- Later edits depend on earlier changes
- You need to verify first change before second
- Changes affect imports/exports between files
- You're creating new files that others depend on

**Examples:**
- Create new utility function, then update imports
- Add database column, then update validation schemas
- Create new component, then add to page
- Change API response format, then update consumers

## Implementation Pattern

### Using Claude Bash Tool

Make multiple Read calls without waiting:

```bash
# All reads happen in parallel
read file1
read file2
read file3

# Process locally to plan changes
# Then make all edits

edit file1
edit file2
edit file3
```

### Identifying Independence

Before parallel edits, ask:

1. **Does file A's change affect file B's structure?**
   - No → parallel is safe
   - Yes → sequential needed

2. **Do I need to verify file A before editing file B?**
   - No → parallel is safe
   - Yes → sequential needed

3. **Could a merge conflict occur?**
   - No → parallel is safe
   - Yes → sequential needed

## Real Session Example

**Settings page refactor:**

```
Parallel reads:
- settings/page.tsx (current structure)
- changelog.tsx (scroll-related classes)
- changelog.ts (version format)

Parallel edits:
1. settings/page.tsx → Restructure to Tabs + TabsContent
2. changelog.tsx → Remove `max-h-96 overflow-y-auto`
3. changelog.ts → Add v1.4.0 entry with PR link

Result: All changes applied atomically
```

**Why parallel was safe:**
- Changelog updates don't affect page structure
- Page structure changes don't affect changelog
- Changelog.ts updates are isolated
- Zero shared state/imports modified

## Performance Impact

### Sequential (Old Way)
```
Read A: 0.5s
Edit A: 0.3s
Verify A: 0s
Read B: 0.5s
Edit B: 0.3s
Read C: 0.5s
Edit C: 0.3s
Total: 2.4s
```

### Parallel (New Way)
```
Read A, B, C simultaneously: 0.5s (longest read)
Edit A, B, C simultaneously: 0.3s (longest edit)
Total: 0.8s
Savings: 66%
```

## Safety Checklist Before Parallel

- [ ] Read all files first (understand current state)
- [ ] Confirm no cross-file dependencies
- [ ] Plan all edits before making any changes
- [ ] Check for import/export impacts
- [ ] Verify no shared state modifications
- [ ] Have a rollback plan if needed

## Git Integration

After parallel edits:

```bash
git diff --stat  # Show all changed files
git add .        # Stage all changes
git commit -m "feat: refactor settings page with tabbed layout"
```

If parallel edit caused unexpected interaction:
```bash
git diff file1
git diff file2
git diff file3

# If one broke something:
git checkout file1  # Revert just that file
# Then edit sequentially
```

## Anti-Pattern: Parallel When You Shouldn't

**WRONG:**
```
Edit A: Create new utility function
[Parallel with...]
Edit B: Update imports in other files to use new function

PROBLEM: Import might not exist yet during B's execution
```

**CORRECT:**
```
Edit A: Create new utility function
[Wait for verification...]
Edit B: Update imports now that function exists
```

## Recommendation Matrix

| Change Type | Sequential | Parallel | Notes |
|------------|-----------|----------|-------|
| Multiple style changes | - | ✓ | All isolated |
| Add new feature | ✓ | - | Usually dependencies |
| Update documentation | - | ✓ | No code dependencies |
| Refactor structure | ✓ | - | May have side effects |
| Add config entries | - | ✓ | Isolated |
| API changes | ✓ | - | Affects multiple consumers |
| Component updates | ✓ | - | May affect parent usage |
| Test additions | - | ✓ | No production code impact |

## When to Refactor for Parallelization

If you find yourself with dependent changes:

```typescript
// SEQUENTIAL REQUIRED:
// 1. Create utility
export function newUtil() { /* ... */ }

// 2. Import in multiple files
import { newUtil } from './utils'

// Better approach - separate PR:
// PR 1: Add utility + export
// PR 2: Import and use in components (can run tests on both)
```

## Git Workflow Integration

Parallel edits work best with:
- Focused branches (one feature)
- Clear commit messages
- Related file changes in same commit
- Unrelated changes in separate commits

```bash
# Good: Related changes in same commit
git add settings/page.tsx settings/changelog.tsx changelog.ts
git commit -m "refactor: restructure settings page with tabs"

# Better: Separate commits if truly independent
git add settings/page.tsx
git commit -m "refactor: restructure settings page layout"

git add settings/changelog.tsx changelog.ts
git commit -m "docs: add v1.4.0 changelog entry"
```

## Tools to Support Parallel Edits

- **Bash parallel execution**: `Read` all files before any edits
- **Git staging**: Stage related changes together
- **GitHub diffs**: Review all changes atomically
- **Test coverage**: Run tests after all edits (not between)

## Summary

Parallel edits are safe and efficient for independent changes across multiple files. Identify dependencies first, then execute in parallel to save ~60% of edit time. Use for styling, documentation, configuration, and isolated feature additions.
