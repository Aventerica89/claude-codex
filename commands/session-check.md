---
description: Check branch and context at session start. Run this first when resuming work to avoid branch confusion.
---

# Session Check

Verify you're on the correct branch before starting work. Prevents accidentally working on the wrong branch.

## Usage

```
/session-check              # Check current state
/session-check --fix        # Auto-switch to paused branch
```

## Arguments

- No args: Show current state vs paused state
- `--fix` or `-f`: Automatically checkout the paused branch

---

## Execution Steps

### 1. Gather Current State

```bash
# Current branch
CURRENT_BRANCH=$(git branch --show-current)

# Current directory
CURRENT_DIR=$(pwd)

# Uncommitted changes
UNCOMMITTED=$(git status --porcelain | wc -l)

# Recent commits
git log --oneline -3
```

### 2. Check Pause State

```bash
# Read pause state for this project
cat ~/.claude/pause-state.json | jq -r '.projects["'"$CURRENT_DIR"'"]'
```

### 3. Compare and Report

**If pause state exists:**
```
Session Check

Current State:
  Directory: /Users/jb/.21st/repos/Aventerica89/claude-codex
  Branch: main
  Uncommitted: 0 files

Paused State (from /pause):
  Branch: claude/create-landing-page-MbRCw
  Paused: 2 hours ago
  Was working on: Dashboard implementation

⚠️  BRANCH MISMATCH

You're on 'main' but paused on 'claude/create-landing-page-MbRCw'

Options:
1. Switch to paused branch: git checkout claude/create-landing-page-MbRCw
2. Stay on main (clear pause): Update pause-state.json
3. Run: /session-check --fix (auto-switch)
```

**If no pause state:**
```
Session Check

Current State:
  Directory: /Users/jb/.21st/repos/Aventerica89/claude-codex
  Branch: main
  Uncommitted: 0 files

No paused session found for this project.

Recent branches:
  * main
    claude/create-landing-page-MbRCw (3 days ago)
    feature/auth (1 week ago)

Confirm: Is 'main' the correct branch to work on?
```

### 4. Auto-Fix (if --fix)

```bash
# Stash any uncommitted changes
git stash

# Checkout paused branch
git checkout {paused-branch}

# Pop stash if needed
git stash pop
```

---

## Output Format

```
Session Check ✓

Branch: claude/create-landing-page-MbRCw
Status: Matches paused state
Last activity: Dashboard with PIN auth

Ready to continue.
```

Or with warning:

```
Session Check ⚠️

MISMATCH DETECTED

| | Current | Paused |
|---|---------|--------|
| Branch | main | claude/create-landing-page-MbRCw |
| Uncommitted | 0 | 3 |

Run `/session-check --fix` to switch branches.
```

---

## When to Use

- **Start of every session** - Run before any work
- **After switching machines** - Context may differ
- **After `cd` to project** - Verify state
- **Before making commits** - Ensure correct branch

---

## Best Practice Workflow

```
# Start session
cd ~/my-project
/session-check          # Verify branch

# If mismatch
/session-check --fix    # Auto-switch

# Now safe to work
/resume                 # Load full context
```

---

## Integration

This command pairs with:
- `/pause` - Save state when stopping
- `/resume` - Load full context
- `/context-save` - Manual checkpoints

## Notes

- Run at START of session, before any file changes
- If branch doesn't exist locally, will fetch from remote
- Stashes uncommitted work before switching
- Safe to run multiple times
