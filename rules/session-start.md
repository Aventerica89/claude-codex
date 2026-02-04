# Session Start Rule

## CRITICAL: Branch Check on Every Session Start

At the START of every session, BEFORE doing any work:

### 1. Check Current Branch

```bash
git branch --show-current
git status --short
```

### 2. Check for Paused Context

```bash
cat ~/.claude/pause-state.json 2>/dev/null | jq '.projects["'"$(pwd)"'"]' || echo "No pause state"
```

### 3. Warn if Mismatch

If pause-state shows a different branch than current:
```
WARNING: Branch mismatch detected!

Paused on: claude/create-landing-page-MbRCw
Currently on: main

You likely want to:
  git checkout claude/create-landing-page-MbRCw

Or if main is correct, clear the pause state.
```

### 4. Ask Before Proceeding

If there's any ambiguity about which branch to work on:
- ASK the user which branch is correct
- DO NOT make changes until confirmed
- Show recent commits on both branches to help them decide

## Why This Matters

- Work can be lost if changes are made to wrong branch
- Merges become complicated with parallel changes
- User expects continuity between sessions

## Integration

This rule should trigger automatically when:
- Session starts in a git repository
- User hasn't explicitly specified a branch
- There's an existing pause-state for this project

## Quick Reference

| Scenario | Action |
|----------|--------|
| Resume from /pause | Run `/resume` first |
| Fresh session, no pause | Check `git branch`, confirm with user |
| Switching projects | Use `/pause` on old, `/resume` on new |
| Multiple worktrees | Be explicit about which worktree |
