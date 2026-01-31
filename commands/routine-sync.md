---
description: Smart branch sync with automatic conflict detection and resolution
---

# Routine: Sync

Intelligent branch synchronization that analyzes your git state and takes the right action automatically.

## Usage

```bash
/routine-sync              # Auto-detect and sync current branch
/routine-sync --preview    # Show what would happen without doing it
/routine-sync --stash      # Force stash uncommitted changes first
/routine-sync develop      # Sync with different base branch
```

## Arguments

Parse `$ARGUMENTS` for:
- No arguments - Sync current branch with origin/main
- `--preview` or `-p` - Dry run, show plan without executing
- `--stash` or `-s` - Stash changes before sync, unstash after
- `--merge` - Use merge instead of rebase
- `--force` - Skip confirmations (use with caution)
- `<branch>` - Sync with specified branch instead of main

## Decision Tree

```
/routine-sync
    │
    ├─ 1. Analyze State
    │   ├─ git fetch origin
    │   ├─ Count commits ahead of base
    │   ├─ Count commits behind base
    │   ├─ Check for uncommitted changes
    │   └─ Predict conflicts (diff analysis)
    │
    ├─ 2. Determine Scenario
    │   │
    │   ├─ SYNCED: Ahead=0, Behind=0
    │   │   └─ "Already up to date"
    │   │
    │   ├─ AHEAD_ONLY: Ahead>0, Behind=0
    │   │   └─ "Your branch is ahead, no sync needed"
    │   │
    │   ├─ BEHIND_ONLY: Ahead=0, Behind>0
    │   │   ├─ Clean? → Fast-forward automatically
    │   │   └─ Dirty? → Stash, fast-forward, unstash
    │   │
    │   ├─ DIVERGED: Ahead>0, Behind>0
    │   │   ├─ Conflicts likely? → Show preview, ask user
    │   │   └─ No conflicts? → Rebase automatically
    │   │
    │   └─ DIRTY: Uncommitted changes
    │       ├─ --stash flag? → Stash and continue
    │       └─ No flag? → Ask: commit, stash, or abort
    │
    └─ 3. Execute & Report
        ├─ Show what changed
        ├─ Show new commits from base
        └─ Suggest next action
```

## Scenario Handling

### Scenario: Already Synced

```
User: /routine-sync

Claude: Analyzing branch state...

        Branch: feature-x
        Base: origin/main

        ✓ Already up to date

        Your branch is synced with main.
        No action needed.
```

### Scenario: Behind Only (Clean)

```
User: /routine-sync

Claude: Analyzing branch state...

        Branch: feature-x
        Base: origin/main
        Status: 4 commits behind, 0 ahead

        Fast-forwarding...

        ✓ Synced with main

        New commits from main:
        - d191390 feat(commands): add auto-update stats
        - fee2e24 docs(routines): add git tracking guide
        - 761fea1 feat(skills): add routine-merge pattern
        - b759294 feat(commands): add pause/resume

        Your branch is now up to date.
```

### Scenario: Behind Only (Dirty)

```
User: /routine-sync

Claude: Analyzing branch state...

        Branch: feature-x
        Base: origin/main
        Status: 3 commits behind, 0 ahead
        Uncommitted: 2 files modified

        You have uncommitted changes. Options:

        1. Stash and sync (Recommended)
           Temporarily save changes, sync, restore changes

        2. Commit first
           Create WIP commit, then sync

        3. Abort
           Cancel sync, keep current state

        [AskUserQuestion with options]

User: [Selects Stash and sync]

Claude: Stashing changes...
        Fast-forwarding...
        Restoring changes...

        ✓ Synced with main

        New commits from main:
        - abc123 feat: new feature

        Your uncommitted changes have been restored.
```

### Scenario: Diverged (No Conflicts)

```
User: /routine-sync

Claude: Analyzing branch state...

        Branch: feature-x
        Base: origin/main
        Status: 2 commits behind, 3 ahead

        Diverged state detected.
        Checking for potential conflicts...

        ✓ No conflicts detected

        Rebasing your 3 commits onto latest main...

        ✓ Synced with main

        Your commits (rebased):
        - abc123 feat: your first commit
        - def456 feat: your second commit
        - ghi789 fix: your third commit

        New commits from main:
        - 111aaa feat: someone else's work
        - 222bbb fix: another commit

        Branch is now up to date.
```

### Scenario: Diverged (Conflicts Likely)

```
User: /routine-sync

Claude: Analyzing branch state...

        Branch: feature-x
        Base: origin/main
        Status: 4 commits behind, 2 ahead

        ⚠️ Potential conflicts detected

        Files modified in both branches:
        - src/components/Header.tsx (you + main)
        - src/utils/auth.ts (you + main)

        Options:

        1. Attempt rebase (Recommended)
           Try to rebase, pause if conflicts occur

        2. Preview changes
           Show detailed diff of conflicting files

        3. Merge instead
           Use merge commit (preserves both histories)

        4. Abort
           Cancel sync, resolve manually

        [AskUserQuestion with options]

User: [Selects Attempt rebase]

Claude: Rebasing...

        ⚠️ Conflict in src/components/Header.tsx

        <<<<<<< HEAD (main)
        <header className="bg-blue-500">
        =======
        <header className="bg-primary">
        >>>>>>> your-commit

        Options:

        1. Keep yours (bg-primary)
        2. Keep theirs (bg-blue-500)
        3. Open in editor
        4. Abort rebase

        [AskUserQuestion with options]
```

### Scenario: Preview Mode

```
User: /routine-sync --preview

Claude: Preview: What /routine-sync would do

        Current state:
        - Branch: feature-x
        - Base: origin/main
        - Behind: 3 commits
        - Ahead: 2 commits
        - Uncommitted: 0 files

        Planned actions:
        1. git fetch origin
        2. git rebase origin/main
           - Replay commit abc123
           - Replay commit def456

        Potential conflicts: None detected

        New commits you'd receive:
        - 111aaa feat: new landing page
        - 222bbb fix: auth bug
        - 333ccc refactor: cleanup

        Run without --preview to execute.
```

## Implementation

### Step 1: Analyze State

```bash
# Fetch latest
git fetch origin

# Get current branch
BRANCH=$(git branch --show-current)

# Get base branch (default: main)
BASE=${1:-main}

# Count commits
AHEAD=$(git rev-list origin/$BASE..HEAD --count)
BEHIND=$(git rev-list HEAD..origin/$BASE --count)

# Check for uncommitted changes
DIRTY=$(git status --porcelain | wc -l)

# Get list of files changed in both
LOCAL_FILES=$(git diff --name-only origin/$BASE...HEAD)
REMOTE_FILES=$(git diff --name-only HEAD...origin/$BASE)
CONFLICTS=$(comm -12 <(echo "$LOCAL_FILES" | sort) <(echo "$REMOTE_FILES" | sort))
```

### Step 2: Decision Logic

```javascript
if (ahead === 0 && behind === 0) {
  return "SYNCED"
} else if (ahead > 0 && behind === 0) {
  return "AHEAD_ONLY"
} else if (ahead === 0 && behind > 0) {
  return dirty ? "BEHIND_DIRTY" : "BEHIND_CLEAN"
} else {
  return conflicts.length > 0 ? "DIVERGED_CONFLICTS" : "DIVERGED_CLEAN"
}
```

### Step 3: Execute Sync

Based on scenario, run appropriate git commands.

## Integration with /routine-merge

This routine is called automatically as Step 0 of `/routine-merge`:

```
/routine-merge
    │
    ├─ Step 0: /routine-sync (auto)
    │   └─ Ensures branch is synced before merge checks
    │
    ├─ Step 1: Build verification
    ...
```

If `/routine-sync` encounters conflicts during `/routine-merge`, the merge routine pauses and asks how to proceed.

## Configuration

Optional config at `~/.claude/routines/sync.json`:

```json
{
  "default_base": "main",
  "prefer_rebase": true,
  "auto_stash": false,
  "show_new_commits": true,
  "conflict_tool": "editor"
}
```

## Multi-Worktree Best Practices

When working with multiple worktrees:

```
# Sync all worktrees quickly
for dir in ~/.21st/worktrees/project/*; do
  (cd "$dir" && git fetch origin && git rebase origin/main)
done
```

Or run `/routine-sync` in each worktree at start of session.

**Recommended workflow:**
1. Start session → `/routine-sync`
2. Do work → commit frequently
3. Before PR → `/routine-sync` again
4. Create PR → `/routine-merge`

## Error Handling

**Rebase fails:**
```
Rebase failed. Options:
1. Resolve conflicts manually
2. Abort rebase (git rebase --abort)
3. Skip this commit (git rebase --skip)
```

**Stash conflicts:**
```
Stash couldn't be applied cleanly.
Your changes are in stash@{0}.
Run: git stash show -p
```

**Network error:**
```
Couldn't fetch from origin.
Check your internet connection.
Run: git remote -v
```

## Related Commands

- `/routine-merge` - Full merge routine (calls this automatically)
- `/codex-sync` - Sync ~/.claude config (different purpose)
- `/pause` - Save context and pause session
- `/resume` - Resume with automatic sync option
