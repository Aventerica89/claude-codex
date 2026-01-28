---
description: Restore a previously saved session context. Resume exactly where you left off with full context.
---

# Context Restore

Restore a saved session context and resume work seamlessly.

## Usage

```
/context-restore auth-refactor   # Restore specific context
/context-restore --latest        # Restore most recent context
/context-restore --list          # List available contexts
```

## Arguments

Parse `$ARGUMENTS` for:
- Context name to restore
- `--latest` or `-l` - Restore most recent
- `--list` - Show available contexts (same as `/context-save --list`)

---

## Workflow

### Step 1: Load Context File

Read from `~/.claude/contexts/{name}.md`

### Step 2: Verify Environment

Check that current state matches saved context:

```bash
# Verify project directory
pwd

# Check git branch
git branch --show-current

# Check for conflicts
git status
```

If branch differs, ask:
```
Saved context was on branch 'feature/auth' but you're on 'main'.
Switch to 'feature/auth'? [Y/n]
```

### Step 3: Apply Uncommitted Changes (if any)

If patch file exists:
```bash
git apply ~/.claude/contexts/{name}.patch
```

If patch fails (conflicts):
```
Patch has conflicts. Options:
1. Apply manually: git apply --3way {patch}
2. Skip patch and continue
3. Abort restore
```

### Step 4: Restore Task State

If TaskList was used, recreate tasks from saved state.

### Step 5: Display Context Summary

```markdown
## Context Restored: {name}

**Project**: {project-name}
**Branch**: {branch}
**Last Saved**: {timestamp}

### Where We Left Off
{Current task description}

### Progress
- [x] {Completed item}
- [x] {Completed item}
- [ ] {Pending item} ← Resume here

### Key Context
- {Important decision 1}
- {Important decision 2}

### Files to Focus On
- `src/auth/login.ts` - Main work
- `src/lib/validation.ts` - Modified last session

### Next Action
{Specific next step to take}

---
Ready to continue!
```

---

## Example

```
User: /context-restore auth-refactor

Claude: Restoring context "auth-refactor"...

Checking environment...
✓ Project: my-saas-app
✓ Branch: feature/new-auth (switched from main)
✓ Applied 3 uncommitted changes

## Context Restored: auth-refactor

**Last Saved**: 2 hours ago

### Where We Left Off
Implementing JWT refresh token rotation

### Progress
- [x] Set up JWT signing with RS256
- [x] Created access token generation
- [ ] Implement refresh token rotation ← Resume here
- [ ] Add token revocation
- [ ] Write tests

### Key Decisions (from last session)
- Using httpOnly cookies for refresh tokens
- 15min access token, 7day refresh token
- Storing refresh token hash in database

### Files to Focus On
- `src/lib/auth/tokens.ts` - Add rotation logic
- `src/lib/auth/middleware.ts` - Update to handle refresh

### Next Action
Add `rotateRefreshToken()` function in tokens.ts

---
Ready to continue! Start with the refresh rotation?
```

---

## Smart Features

### Auto-Detect Context

If no argument provided and only one context exists for current project:
```
Found saved context "auth-refactor" for this project.
Restore it? [Y/n]
```

### Context Expiry Warning

If context is old:
```
Warning: This context was saved 15 days ago.
The codebase may have changed significantly.
Continue anyway? [Y/n]
```

### Branch Conflict Resolution

If saved branch was deleted:
```
Branch 'feature/old-auth' no longer exists.
Options:
1. Create branch from main
2. Restore context on current branch (main)
3. Abort
```

---

## Notes

- Pairs with `/context-save` for full workflow
- Context files are human-readable if manual inspection needed
- Patches may fail if base code changed significantly
- Consider using git stash for complex uncommitted changes
