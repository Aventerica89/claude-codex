# Learned: Git Branch and Worktree Cleanup

## Problem

After squash-merging PRs, branches become orphaned because:
1. GitHub creates a new commit with different SHA
2. Git doesn't recognize original commits as merged
3. Branches accumulate, causing confusion
4. Worktrees (from 1Code) keep branches alive even longer

## Solution

### Prevention
- Enable "Automatically delete head branches" in GitHub repo settings:
  ```bash
  gh repo edit owner/repo --delete-branch-on-merge=true
  ```
- Add this to `/new-project` command for all new repos

### Detection (in /start)
```bash
# Prune stale remote refs
git fetch --prune

# Find branches with deleted remotes
git branch -vv | grep ': gone]'

# Find merged branches
git branch --merged main | grep -v "^\*\|main"

# List worktrees
git worktree list
```

### Cleanup (in /end)
```bash
# Delete branches with gone remotes
git branch -D <branch>

# Remove worktree (also deletes branch if not checked out elsewhere)
git worktree remove <path> --force
```

### Safety Rules
Only auto-delete when ALL true:
1. Zero uncommitted changes
2. Zero open PRs from that branch
3. Last commit > 7 days ago (safety buffer)
4. Show what will be deleted before doing it

## Pattern: Worktree Safety Check

```bash
BRANCH=$(git -C "$worktree" branch --show-current)
UNCOMMITTED=$(git -C "$worktree" status --porcelain | wc -l)
OPEN_PRS=$(gh pr list --head "$BRANCH" --state open --json number | jq length)
LAST_COMMIT_DAYS=$(( ($(date +%s) - $(git -C "$worktree" log -1 --format="%ct")) / 86400 ))

if [ "$UNCOMMITTED" = "0" ] && [ "$OPEN_PRS" = "0" ] && [ "$LAST_COMMIT_DAYS" -gt 7 ]; then
  echo "SAFE TO REMOVE"
fi
```

## When to Use

- At session start (`/start`) - detect and warn
- At session end (`/end`) - cleanup with confirmation
- After merging PRs - if auto-delete not enabled
- Periodically for maintenance
