# Session Lifecycle

Complete workflow for `/start`, `/pause`, `/resume`, `/end` commands.

## Overview

| Command | When | Duration Away | Saves State |
|---------|------|---------------|-------------|
| `/start` | Beginning of session | N/A | No (reads) |
| `/pause` | Quick break | Minutes to hours | Yes (light) |
| `/resume` | After pause | N/A | No (reads) |
| `/end` | Done for day | Hours to days | Yes (full) |

---

## /start - Begin Session

**When:** Start of every new session (Claude Code or claude.ai)

### Checklist

1. **Check Git State**
   ```bash
   git branch --show-current
   git status --short
   git stash list
   ```

2. **Read Pause State**
   ```bash
   cat ~/.claude/pause-state.json | jq '.projects["'"$(pwd)"'"]'
   ```

3. **Compare & Warn**
   - If current branch != paused branch → WARN
   - If uncommitted files exist → SHOW
   - If stashed changes exist → REMIND

4. **Load Context**
   - Read context file from pause-state
   - Display: What was being worked on
   - Display: Next steps from last session

5. **Verify Ready State**
   - Confirm correct branch
   - Confirm understood context
   - ASK if anything unclear

### Output
```
Session Started ✓

Project: claude-codex
Branch: claude/create-landing-page-MbRCw ✓ (matches pause)
Status: Clean working tree

Last session (2 hours ago):
  Working on: Dashboard with PIN authentication
  Progress: 6/8 tasks complete
  Next: Add agent detail views

Ready to continue. What would you like to work on?
```

### If Branch Mismatch
```
⚠️  Branch Mismatch Detected

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

---

## /pause - Quick Stop

**When:** Stepping away briefly (lunch, meeting, switching projects)

### Checklist

1. **Save Context**
   - Current task/goal
   - Files being worked on
   - Recent decisions
   - TaskList state

2. **Update Pause State**
   ```json
   {
     "project": "/path/to/project",
     "branch": "feature/dashboard",
     "timestamp": "2026-02-03T20:00:00Z",
     "summary": "Working on agent detail views",
     "uncommittedFiles": 3,
     "contextId": "project-2026-02-03-200000"
   }
   ```

3. **Optional: WIP Commit**
   - If uncommitted changes exist
   - Commit with `WIP:` prefix
   - Don't push (local only)

4. **Optional: Stop Dev Server**
   - Kill processes on common ports
   - Note which were stopped

### Output
```
Session Paused ✓

Context saved: claude-codex-2026-02-03-200000
Branch: claude/create-landing-page-MbRCw
Uncommitted: 3 files (not committed)

Summary:
  - Added AgentDetail component
  - Created agent data model
  - Working on tab navigation

Resume with: /resume
```

### Flags
- `--commit` - Force WIP commit
- `--no-server` - Don't stop dev servers
- `--quick` - Just save context, nothing else

---

## /resume - Continue from Pause

**When:** Coming back from a `/pause`

### Checklist

1. **Read Pause State**
   - Find entry for current project
   - Load context file

2. **Verify State**
   - Check branch matches
   - Check for new commits since pause
   - Check uncommitted files

3. **Restore Context**
   - Display what was being worked on
   - Restore TaskList if used
   - Show next steps

4. **Warn on Changes**
   - If someone else pushed commits
   - If files changed outside session
   - If branch was modified

### Output
```
Session Resumed ✓

Paused: 2 hours ago
Branch: claude/create-landing-page-MbRCw ✓

Restoring context...

You were working on:
  - Agent detail views with tabs
  - Tab navigation (overview, config, tools, usage)
  - Need to wire up click-through from list

Files in progress:
  - landing/src/components/dashboard/AgentDetail.tsx
  - landing/src/lib/agents.ts
  - landing/src/pages/dashboard/agents/[slug].astro

Ready to continue.
```

---

## /end - Full Session End

**When:** Done working for the day, switching to different project long-term

### Checklist

1. **Save Full State** (like /pause but more)
   - Context with detailed notes
   - Update pause-state.json (so /start works next time)
   - Session summary

2. **Commit Work**
   - If uncommitted changes: create proper commit (not WIP)
   - Use conventional commit format
   - Include session context in commit body

3. **Push to Remote**
   - Push current branch to origin
   - Ensures work is backed up
   - Enables collaboration

4. **Sync Documentation**
   - If project has docs.jbcloud.app enabled
   - Run `/jbdocs progress`
   - Update progress.md

5. **Extract Learnings**
   - Run `/learn` to capture patterns
   - Update `~/.claude/skills/learned/{project}.md`
   - Note any reusable solutions

6. **Sync Codex** (if changes)
   - Push any codex changes
   - Run `/codex-sync`

7. **Clean Up**
   - Stop dev servers
   - Clear any temp files
   - Note any TODOs for next session

8. **Create Summary**
   - What was accomplished
   - What's next
   - Any blockers

### Output
```
Session Ended ✓

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

Codex synced ✓
Dev servers stopped ✓

See you next time! Run /start when you return.
```

---

## Git Best Practices

### Branch Strategy
```
main                    # Production, always deployable
├── feature/dashboard   # Feature work
├── fix/header-links    # Bug fixes
└── claude/*            # Claude-created branches
```

### Commit Timing

| Event | Commit? | Push? |
|-------|---------|-------|
| `/pause` (short) | Optional WIP | No |
| `/pause` (overnight) | Yes (WIP ok) | Yes |
| `/end` | Yes (proper) | Yes |
| Before switching branches | Yes | Recommended |
| Before PR review | Squash/clean | Yes |

### Commit Messages

**During work (WIP):**
```
WIP: dashboard agent views

Context: claude-codex-2026-02-03-200000
```

**At /end (proper):**
```
feat: add agent detail views with click-through navigation

- Add agents.ts data model with full config
- Create AgentsList component with search/filter
- Create AgentDetail component with tabs
- Add dynamic [slug].astro route

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Push Strategy

| Scenario | Push? | Why |
|----------|-------|-----|
| End of day | Yes | Backup, collaboration |
| Quick pause | No | Clutters history |
| Before PR | Yes | Required |
| After major feature | Yes | Checkpoint |

---

## State Files

### ~/.claude/pause-state.json
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

### ~/.claude/contexts/{contextId}.md
```markdown
# Context: claude-codex-2026-02-03-200000

**Project:** claude-codex
**Branch:** claude/create-landing-page-MbRCw
**Saved:** 2026-02-03 20:00

## Current Task
Building dashboard with agent detail views

## Progress
- [x] PIN authentication
- [x] Connection status strip
- [x] Agent list page
- [x] Agent detail with tabs
- [ ] Commands page
- [ ] Skills page
- [ ] Rules page

## Key Decisions
- Using Astro + React Islands
- PIN code: 2389 (simple auth for now)
- Mock data in lib/services.ts

## Files in Progress
- landing/src/components/dashboard/AgentDetail.tsx
- landing/src/lib/agents.ts

## Next Steps
1. Same treatment for Commands/Skills/Rules
2. Real API connections for service status
3. jb-cloud-app-tracker integration

## Notes
- Dashboard is at /dashboard
- Header links to /dashboard (fixed earlier)
```

---

## Quick Reference

```
Starting work:     /start
Taking a break:    /pause
Coming back:       /resume
Done for the day:  /end

Workflow:
  /start → work → /pause → /resume → work → /end
              ↑__________________|
```

## Error Recovery

### "I forgot to /pause or /end"
```
/start will detect:
- Uncommitted changes
- Last known state from pause-state.json
- Show what branch you should be on
```

### "I'm on the wrong branch"
```
/start will:
- Warn about mismatch
- Offer to switch
- Stash uncommitted changes if needed
```

### "I lost my context"
```
/context-restore --list    # Show all saved contexts
/context-restore <id>      # Restore specific one
```
