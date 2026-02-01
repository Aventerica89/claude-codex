# Routine System Patterns

## Context
- Type: CLI automation framework
- Purpose: Streamline multi-step workflows (sync, merge, deploy)
- Stack: Bash, Git, GitHub CLI

## Key Decisions

### 1. Pre-Flight Sync Pattern
**Decision:** Always sync branch before major operations (merge, deploy)
**Rationale:**
- Prevents "branch behind" errors
- Catches conflicts early before CI runs
- Essential for multi-worktree workflows

**Implementation:**
```markdown
/routine-merge
    └─ Step 0: /routine-sync (automatic)
        ├─ Fetch latest
        ├─ Check divergence
        ├─ Auto-rebase if clean
        └─ Prompt on conflicts
```

### 2. Decision Tree Pattern
**Decision:** Use explicit scenario handling vs generic error catching
**Rationale:**
- Clearer user feedback
- Better error messages
- Predictable behavior

**Scenarios:**
- SYNCED: ahead=0, behind=0
- AHEAD_ONLY: ahead>0, behind=0
- BEHIND_ONLY: ahead=0, behind>0
- DIVERGED: ahead>0, behind>0

### 3. Multi-Worktree Support
**Decision:** Routines work from any directory
**Rationale:**
- User has 4+ worktrees open simultaneously
- Need to sync without cd-ing between directories

**Implementation:**
```bash
git -C ~/.claude status  # Work from any location
cd origin_dir at end     # Restore cwd
```

## Progress

- [x] Created `/routine-sync` with decision tree
- [x] Integrated sync as Step 0 in `/routine-merge`
- [x] Created `/codex-install` for new machine setup
- [x] Merged PR #13
- [ ] Test multi-worktree sync patterns
- [ ] Add `/routine-deploy` (future)

## Learned Patterns

### Pattern: Intelligent Git Conflict Detection
```bash
# Compare files changed in both branches
LOCAL=$(git diff --name-only origin/main...HEAD)
REMOTE=$(git diff --name-only HEAD...origin/main)
CONFLICTS=$(comm -12 <(echo "$LOCAL" | sort) <(echo "$REMOTE" | sort))
```

Use to predict conflicts before attempting rebase.

### Pattern: AskUserQuestion for Complex Scenarios
When rebase/merge has multiple valid paths:
- Show options with clear descriptions
- Recommend the safest option
- Allow preview before execution

### Pattern: Graceful Fallback
```
Attempt automatic → Detect issue → Pause → Ask user → Resume
```

Never fail silently. Always give user control on ambiguous situations.

## Next Session

Start with:
- Test `/routine-sync` on actively diverged branch
- Document multi-worktree best practices
- Consider `/routine-deploy` for env var + Vercel workflows

Blockers:
- Pre-existing lint failures in repo (not from our changes)
- Link-check failures (example URLs, auth dashboards)
