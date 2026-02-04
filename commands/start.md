---
description: Begin session - check branch, load context, verify ready state. Run this first when starting work.
---

# Start Command

Begin a new work session with automatic branch verification and context loading.

## Arguments

Parse `$ARGUMENTS` for optional flags:
- No arguments - Full session start (verify branch, load context, show status)
- `--fix` or `-f` - Auto-switch to paused branch if mismatch
- `--skip-check` - Skip branch verification (use with caution)

## Behavior

### 1. Check Git State

```bash
# Current branch
CURRENT_BRANCH=$(git branch --show-current)

# Current directory
CURRENT_DIR=$(pwd)

# Working tree status
git status --short

# Stashed changes
git stash list

# Recent commits
git log --oneline -3
```

### 2. Read Pause State

Check local pause state:
```bash
cat ~/.claude/pause-state.json 2>/dev/null | jq -r '.projects["'"$CURRENT_DIR"'"]'
```

### 2.5. Check 1Password for ClaudeSync

Look for recent ClaudeSync items (from claude.ai sessions):

```bash
REPO_NAME=$(basename $(pwd))

# Find the most recent ClaudeSync item for this repo
op item list --tags="${REPO_NAME},claude-sync" --format=json | jq -r '.[0].id'

# If found, read it
op item get "{item-id}" --format=json | jq -r '.fields[] | select(.label=="claude_ai_response") | .value'
```

**If claude_ai_response is not empty:**
- Someone worked on this in claude.ai
- Load that context
- Show what was done in claude.ai
- Clear the field after importing (optional)

```
Found ClaudeSync from claude.ai session:

claude.ai worked on:
  - [summary from claude_ai_response]

Import this context? [Y/n]
```

### 3. Compare and Report

**If pause state exists and branch matches:**
```
Session Started

Project: claude-codex
Branch: claude/create-landing-page-MbRCw (matches pause)
Status: Clean working tree

Last session (2 hours ago):
  Working on: Dashboard with PIN authentication
  Progress: 6/8 tasks complete
  Next: Add agent detail views

Ready to continue. What would you like to work on?
```

**If pause state exists but branch mismatches:**
```
Branch Mismatch Detected

Current: main
Expected: claude/create-landing-page-MbRCw

Last session was on 'claude/create-landing-page-MbRCw'
  Working on: Dashboard implementation

Options:
1. Switch to expected branch (recommended)
2. Stay on current branch (update pause state)
3. Show diff between branches

Which would you like? [1/2/3]
```

**If no pause state exists:**
```
Session Started

Project: claude-codex
Branch: main
Status: Clean working tree

No paused session found for this project.

Recent branches:
  * main
    claude/create-landing-page-MbRCw (3 days ago)
    feature/auth (1 week ago)

Ready to start. What would you like to work on?
```

### 4. Handle Branch Mismatch (if --fix)

When `--fix` flag is provided:

```bash
# Stash any uncommitted changes
git stash push -m "Auto-stash before branch switch"

# Checkout paused branch
git checkout {paused-branch}

# Pop stash if it was created
git stash pop 2>/dev/null || true
```

### 5. Load Context (if available)

If pause state exists, read the context file:
```bash
cat ~/.claude/contexts/{contextId}.md
```

Display:
- What was being worked on
- Progress status
- Next steps from last session
- Files in progress

### 6. Check for Remote Changes

```bash
# Fetch latest
git fetch origin {current-branch} 2>/dev/null

# Check for new commits
git log --oneline HEAD..origin/{current-branch} 2>/dev/null
```

If new commits exist:
```
Note: Remote has 3 new commits
Run 'git pull' to update, or continue working on current state
```

### 7. Verify Ready State

Before allowing work:
- Confirm correct branch (or user accepted mismatch)
- Show any uncommitted files
- Show any stashed changes
- ASK if anything unclear

## Output Format

### Clean Start
```
Session Started

Project: claude-codex
Branch: claude/create-landing-page-MbRCw (matches pause)
Status: Clean working tree

Last session (2 hours ago):
  Working on: Dashboard with PIN authentication
  Next: Add agent detail views

Ready to continue. What would you like to work on?
```

### With Warnings
```
Session Started

Project: claude-codex
Branch: main

Uncommitted changes: 3 files
  M src/components/Header.tsx
  M src/lib/utils.ts
  ? src/components/NewFile.tsx

Stashed changes: 1 stash
  stash@{0}: WIP on feature: add auth

Recent paused session (2 hours ago):
  Branch: claude/create-landing-page-MbRCw
  Working on: Dashboard implementation

You're on 'main' but last session was on 'claude/create-landing-page-MbRCw'.
Run '/start --fix' to switch, or confirm you want to work on 'main'.
```

## Integration

This command:
- Reads from `~/.claude/pause-state.json` (created by `/pause` and `/end`)
- Reads from `~/.claude/contexts/{id}.md` (created by `/pause`)
- Replaces need for separate `/session-check` command
- Pairs with `/pause`, `/resume`, `/end` for full lifecycle

## When to Use

- **Start of every session** - Run before any work
- **After switching machines** - Context may differ
- **After `cd` to project** - Verify state
- **Returning from break** - Check what changed

## Comparison with /resume

| Command | Purpose |
|---------|---------|
| `/start` | Verify branch, show warnings, prepare for work |
| `/resume` | Full context restore, load task list, detailed state |

**Use `/start` when:**
- Beginning a new session
- Want to verify branch before working
- Need quick status check

**Use `/resume` when:**
- Continuing exactly where you left off
- Want full context loaded
- Need detailed progress state

## Quick Reference

```
Starting work:     /start
Branch mismatch:   /start --fix
Skip verification: /start --skip-check

Full workflow:
  /start → work → /pause → /resume → work → /end
```
