---
description: End session cleanly - sync docs, commit to memory, shutdown. Run when finishing work on a project.
---

# End Session Command

Full session cleanup when done working for the day. Saves state, commits work, pushes to remote, and syncs documentation.

## What This Command Does

1. **Save Full State** (update pause-state.json for `/start` next time)
2. **Commit Work** (proper commit, not WIP)
3. **Push to Remote** (backup and enable collaboration)
4. **Sync to docs.jbcloud.app** (if project configured)
5. **Extract Learnings** (save patterns to learned skills)
6. **Sync Codex** (if changes in ~/.claude/)
7. **Clean Up** (stop dev servers, clear temp files)
8. **Create Summary** (what was accomplished, what's next)

## Arguments

Parse `$ARGUMENTS` for optional flags:
- No arguments - Full end session workflow
- `--no-push` - Skip pushing to remote
- `--no-docs` - Skip docs.jbcloud.app sync
- `--no-learn` - Skip extracting learnings
- `--quick` - Only save state and commit (skip sync/learn/cleanup)

---

## Step 0: Save Full State

Update `~/.claude/pause-state.json` so `/start` works next time:

```json
{
  "projects": {
    "/Users/jb/.21st/repos/Aventerica89/claude-codex": {
      "contextId": "claude-codex-2026-02-03-200000",
      "timestamp": "2026-02-03T20:00:00.000Z",
      "branch": "claude/create-landing-page-MbRCw",
      "summary": "Dashboard with agent detail views",
      "uncommittedFiles": 0,
      "lastCommand": "end",
      "nextSteps": [
        "Add Commands/Skills/Rules pages",
        "Connect real service APIs"
      ]
    }
  }
}
```

Also create context file at `~/.claude/contexts/{contextId}.md` with full session details.

---

## Step 0.5: Commit Work (Proper, Not WIP)

If uncommitted changes exist, create a **proper commit** (not WIP):

```bash
# Check for changes
git status --porcelain

# If changes exist
git add -A
git commit -m "$(cat <<'EOF'
feat: add agent detail views with click-through navigation

- Add agents.ts data model with full config
- Create AgentsList component with search/filter
- Create AgentDetail component with tabs
- Add dynamic [slug].astro route

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Commit message rules for /end:**
- Use conventional commit format (`feat:`, `fix:`, `refactor:`, etc.)
- Describe WHAT was accomplished, not "WIP"
- Include bullet points for major changes
- Add co-author attribution

---

## Step 0.75: Push to Remote

Push current branch to origin:

```bash
git push -u origin $(git branch --show-current)
```

**Why push on /end:**
- Backup work to remote
- Enable collaboration
- Required before PR
- Checkpoints progress

If push fails (no remote, permission issues), show warning but continue.

---

## Step 0.8: Clean Up Merged Branches

After pushing, clean up stale local branches that have been merged or deleted on remote:

```bash
# Prune stale remote-tracking refs
git fetch --prune

# Find local branches with deleted remotes (marked as "gone")
git branch -vv | grep ': gone]' | awk '{print $1}'

# Find local branches already merged into main
git branch --merged main | grep -v "^\*\|main"
```

**Auto-delete stale branches:**

```bash
# Delete branches whose remotes are gone
for branch in $(git branch -vv | grep ': gone]' | awk '{print $1}'); do
  git branch -D "$branch"
  echo "Deleted stale branch: $branch"
done

# Delete branches already merged to main (except current and main)
for branch in $(git branch --merged main | grep -v "^\*\|main"); do
  git branch -d "$branch"
  echo "Deleted merged branch: $branch"
done
```

**Why this matters:**
- Squash merges leave orphaned branches (different SHAs)
- Over time, stale branches accumulate and cause confusion
- GitHub's "Automatically delete head branches" only deletes remote
- Local branches need manual cleanup

**Report cleanup:**
```
Cleaned up branches:
  - fix/mobile-ux-improvements (merged)
  - claude/add-hero-section (remote deleted)
```

### Worktree Cleanup (Safe Mode)

Check for stale worktrees and offer to clean them up:

```bash
# List all worktrees except main
git worktree list --porcelain | grep "^worktree" | cut -d' ' -f2- | while read worktree; do
  # Skip main worktree
  if [ "$worktree" = "$(pwd)" ]; then continue; fi

  BRANCH=$(git -C "$worktree" branch --show-current 2>/dev/null)
  UNCOMMITTED=$(git -C "$worktree" status --porcelain 2>/dev/null | wc -l | tr -d ' ')
  OPEN_PRS=$(gh pr list --head "$BRANCH" --state open --json number 2>/dev/null | jq length)
  LAST_COMMIT_DAYS=$(( ($(date +%s) - $(git -C "$worktree" log -1 --format="%ct" 2>/dev/null || echo 0)) / 86400 ))

  # Only safe if: no uncommitted, no open PRs, older than 7 days
  if [ "$UNCOMMITTED" = "0" ] && [ "$OPEN_PRS" = "0" ] && [ "$LAST_COMMIT_DAYS" -gt 7 ]; then
    echo "SAFE: $worktree ($BRANCH)"
  fi
done
```

**Only auto-remove worktrees when ALL conditions met:**
1. Zero uncommitted changes
2. Zero open PRs from that branch
3. Last commit > 7 days ago
4. User confirms (unless `--auto-clean` flag)

**Cleanup command:**
```bash
git worktree remove "$worktree_path"
# Branch is auto-deleted when worktree is removed (if not checked out elsewhere)
```

**Report:**
```
Worktree Cleanup

  Removed (safe - all work merged):
    ~/.21st/worktrees/urlstogo/public-clearing (combative-crocodile-13f267)

  Kept (has active work):
    ~/.21st/worktrees/project/feature-x (uncommitted changes)
```

**Conservative approach:**
- NEVER delete worktrees with uncommitted changes
- NEVER delete worktrees with open PRs
- ALWAYS show what will be deleted before doing it
- Default to keeping things if uncertain

---

## Step 1: Check Documentation Sync

If the current project has `documentToDocs: true` in its CLAUDE.md or was created with docs.jbcloud.app enabled:

### Gather Documentation to Sync
- `docs/ARCHITECTURE.md` - System design
- `docs/PLAN.md` - Implementation plan
- `CLAUDE.md` - Project context
- `CHANGELOG.md` or git log summary - What was accomplished
- Any other `docs/*.md` files

### Sync Method

Use the **jbdocs** agent to sync documentation to the jb-cloud-docs repository:

**Automated Sync (Default)**

Run `/jbdocs progress` which will:

1. Update progress.md with session accomplishments
2. Update any changed documentation files
3. Commit and push to jb-cloud-docs repository

```bash
cd /Users/jb/jb-cloud-docs
git add src/content/docs/{project-slug}/
git commit -m "docs({project-slug}): update progress - {session summary}"
git push origin main
```

**Manual Sync (if automated fails)**

If the jbdocs agent fails, manually sync:
```bash
cd /Users/jb/jb-cloud-docs
git pull origin main
# Copy updated docs
cp {project}/docs/ARCHITECTURE.md src/content/docs/{project-slug}/architecture.md
cp {project}/docs/PLAN.md src/content/docs/{project-slug}/plan.md
git add src/content/docs/{project-slug}/
git commit -m "docs({project-slug}): manual sync"
git push origin main
```

**Docs Site Location:**
- Repository: `/Users/jb/jb-cloud-docs`
- Remote: `https://github.com/Aventerica89/jb-cloud-docs.git`
- Project docs: `/Users/jb/jb-cloud-docs/src/content/docs/{project-slug}/`
- Live URL: `https://docs.jbcloud.app/{project-slug}/`

---

## Step 2: Commit to Memory

Use the `/learn` skill or continuous-learning pattern to extract and save:

### What to Remember
1. **Project context** - Name, purpose, tech stack
2. **Key decisions made** - Architecture choices, platform selections
3. **Patterns discovered** - Reusable solutions, code patterns
4. **Current state** - What's done, what's next
5. **Blockers/risks** - Issues to address next session

### Memory Format
Create or update a learned pattern file:

```markdown
# Project: {project-name}

## Context
- Type: {app/tool/site}
- Stack: {Next.js, Supabase, etc.}
- Status: {in-progress/complete}

## Key Decisions
- {Decision 1}: {Rationale}
- {Decision 2}: {Rationale}

## Progress
- [x] Phase 1: Setup
- [x] Phase 2: Core features
- [ ] Phase 3: Polish

## Next Session
- Start with: {specific task}
- Blockers: {any issues}

## Learned Patterns
- {Pattern 1}: {How to reuse}
```

Save to: `~/.claude/skills/learned/{project-name}.md`

---

## Step 3: Create Session Summary

Generate a brief summary of the session:

```markdown
## Session Summary: {date}

### Worked On
- {project-name}

### Accomplished
- {Task 1}
- {Task 2}
- {Task 3}

### Files Changed
- {file1.ts} - {what changed}
- {file2.tsx} - {what changed}

### Next Steps
1. {Next task 1}
2. {Next task 2}

### Time Spent
- ~{X} hours
```

Display to user for review.

---

## Step 4: Shutdown Dev Server

Check for running dev servers and offer to stop them:

```bash
# Find running Node processes on common dev ports
lsof -i :3000 -i :3001 -i :5173 -i :4321 | grep LISTEN
```

If found, ask user:
```
Dev server running on port 3000 (PID: 12345)
Stop it? [Y/n]
```

If yes:
```bash
kill {PID}
```

---

## Step 4.5: Sync Codex

If there are changes in `~/.claude/` (rules, commands, skills, etc.):

```bash
# Run codex sync
/codex-sync
```

This ensures your codex configuration is backed up to GitHub.

---

## Step 4.75: Sync to Cloud Tracker

If the project is linked to Cloud App Tracker (apps.jbcloud.app), POST session data:

### Check if Project is Linked

Look for `cloudTracker.applicationId` in the project's CLAUDE.md or check if the repo exists in Cloud Tracker.

### Gather Session Data

```javascript
const sessionData = {
  application_id: '{uuid from Cloud Tracker}',
  started_at: sessionStartTime,
  ended_at: new Date().toISOString(),
  starting_branch: startingBranch,
  ending_branch: currentBranch,
  commits_count: getCommitsSinceStart(),
  context_id: contextId,
  session_source: hasClaudeAiHandoff ? 'mixed' : 'claude-code',
  summary: generateSessionSummary(),
  accomplishments: taskList.completed,
  next_steps: taskList.pending,
  files_changed: getChangedFiles(),
  maintenance_runs: maintenanceRunsDuringSession,
  security_findings: securityScanResults
}
```

### POST to API

```bash
curl -X POST https://apps.jbcloud.app/api/sessions \
  -H "Authorization: Bearer $(op read 'op://Business/Cloud Tracker API Token/credential')" \
  -H "Content-Type: application/json" \
  -d '{json session data}'
```

**Response:**
```json
{
  "success": true,
  "session_id": "uuid"
}
```

### On Failure

If Cloud Tracker API is unavailable:
1. Log warning but continue with other steps
2. Store session data locally in `~/.claude/pending-syncs/{contextId}.json`
3. Next `/start` will retry failed syncs

---

## Step 4.85: Save to 1Password (ClaudeSync)

Automatically create a 1Password item for claude.ai handoff:

```bash
REPO_NAME=$(basename $(pwd))
DATE=$(date +%Y-%m-%d)

op item create \
  --category="Secure Note" \
  --title="${REPO_NAME} - ClaudeSync (${DATE})" \
  --vault="Business" \
  --tags="claude-sync,${REPO_NAME}" \
  "context[text]=<generated context markdown>" \
  "claude_ai_response[text]=<Paste claude.ai response here when returning>" \
  "branch[text]=$(git branch --show-current)" \
  "project_path[text]=$(pwd)"
```

**What this enables:**
- Open 1Password in any browser
- Find "{repo} - ClaudeSync" item
- Copy `context` field → paste into claude.ai
- When done, paste claude.ai's response into `claude_ai_response` field
- `/start` will read this on next session

**Fields in the item:**
| Field | Purpose |
|-------|---------|
| `context` | Copy this into claude.ai |
| `claude_ai_response` | Paste claude.ai's summary here |
| `branch` | Git branch for verification |
| `project_path` | Full project path |

---

## Step 5: Final Output

Display comprehensive summary:

```
Session Ended

Branch: claude/create-landing-page-MbRCw
Committed: "feat: add agent detail views with click-through navigation"
Pushed: origin/claude/create-landing-page-MbRCw

Documentation:
  Synced to docs.jbcloud.app/claude-codex/

Learnings:
  Saved to ~/.claude/skills/learned/claude-codex.md

Session Summary:
  Duration: ~3 hours
  Commits: 4
  Files changed: 12

  Accomplished:
  - Dashboard with PIN authentication
  - Connection status strip
  - Agent list and detail views

  Next session:
  - Add same treatment to Commands/Skills/Rules
  - Connect real API for service status
  - Integrate with jb-cloud-app-tracker

Codex synced
Dev servers stopped

See you next time! Run /start when you return.
```

---

## Usage Examples

### Basic End
```
User: /end

Claude: Wrapping up session...

Session Summary:
- Project: timesheet-filler
- Accomplished: Created architecture, implementation plan
- Next: Start Phase 1 scaffolding

Documentation synced to docs.jbcloud.app
Memory committed
Dev server stopped

See you next time!
```

### End Without Docs Sync
```
User: /end

Claude: This project isn't configured for docs.jbcloud.app sync.
Skipping documentation sync.

[Continue with memory commit and shutdown...]
```

---

## Configuration

To enable docs.jbcloud.app sync for a project, add to project's CLAUDE.md:

```markdown
## Documentation
- Sync to docs.jbcloud.app: Yes
- Project slug: {project-slug}
- Docs URL: https://docs.jbcloud.app/{project-slug}/
```

Or set during `/new-project` Phase 1 when asked "Document to docs.jbcloud.app?"

### Manual Sync Anytime

Run `/jbdocs` command directly to sync documentation outside of `/end`:
- `/jbdocs init` - Initial setup for new project
- `/jbdocs update` - Update all docs
- `/jbdocs progress` - Update progress only

---

## Notes

- Always run `/end` before closing terminal to ensure clean state
- Memory files help resume context in future sessions
- Docs sync keeps documentation site up to date automatically
- Server shutdown prevents orphaned processes

---

## Session Lifecycle Integration

This command is part of the full session lifecycle:

```
/start -> work -> /pause -> /resume -> work -> /end
```

| Command | When | Saves State | Commits | Pushes |
|---------|------|-------------|---------|--------|
| `/start` | Beginning of session | No (reads) | No | No |
| `/pause` | Quick break | Yes (light) | WIP | No |
| `/resume` | After pause | No (reads) | No | No |
| `/end` | Done for day | Yes (full) | Proper | Yes |

**Use `/pause` when:**
- Taking a break, coming back soon
- Switching projects temporarily

**Use `/end` when:**
- Done for the day
- Want full backup and sync
- Ready to commit learnings

See `docs/SESSION-LIFECYCLE.md` for complete workflow documentation.
