---
description: Pause session with auto-save and cleanup, resume later with /resume
---

# Pause Command

Pause your work session with automatic context saving, cleanup, and easy resume.

## Arguments

Parse `$ARGUMENTS` for optional flags:
- No arguments - Full pause (save context, commit WIP, sync codex, stop servers)
- `--quick` or `-q` - Quick pause (just save context, no cleanup)
- `--no-commit` - Skip WIP commit
- `--no-sync` - Skip codex sync

## Behavior

### 1. Save Context

Create a context snapshot with auto-generated ID:
```
{project-name}-{timestamp}
```

Save to `~/.claude/contexts/{contextId}.md` including:
- Current working directory
- Git branch and status
- Current task/goal
- Recent decisions
- Files being worked on
- TaskList state

### 2. Update Pause State

Write to `~/.claude/pause-state.json`:
```json
{
  "projects": {
    "/full/path/to/project": {
      "contextId": "project-2026-01-31-155011",
      "timestamp": "2026-01-31T15:50:11.056Z",
      "branch": "main",
      "summary": "Brief summary of what was being worked on",
      "uncommittedFiles": 3,
      "lastCommand": "pause",
      "nextSteps": [
        "Complete agent detail views",
        "Add click-through navigation"
      ]
    }
  }
}
```

**Important fields:**
- `branch` - Critical for `/start` to detect mismatches
- `lastCommand` - `pause` vs `end` indicates session type
- `nextSteps` - Array of actionable next tasks

### 3. Commit WIP (unless --no-commit)

If there are uncommitted changes:
```bash
git add -A
git commit -m "WIP: {brief description of current work}

Paused at: {timestamp}
Context: {contextId}

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

### 4. Sync Codex (unless --no-sync)

If there are changes in `~/.claude/`:
- Run `/codex-sync` automatically
- Include in summary

### 5. Clean Up Processes (unless --quick)

Stop running development processes:
```bash
# Check for common dev servers
lsof -ti:3000,3001,4000,5173,5174,8080,8000 | xargs kill -9 2>/dev/null

# Or use fuser if available
fuser -k 3000/tcp 2>/dev/null
```

### 6. Show Summary

```
Session paused ✓

Context saved: project-2026-01-31-155011
WIP committed: "WIP: working on sync commands"
Codex synced: 3 files
Dev servers stopped

Session summary:
- Created /codex-sync and /codex-fetch commands
- Renamed for better discoverability
- Updated bidirectional sync logic

Resume with: /resume
(no need to remember the context ID - it's automatic)
```

## Example Flows

### Full pause

```
User: /pause

Claude: Pausing session...

        [Saves context]
        [Commits WIP changes]
        [Syncs codex]
        [Stops dev servers]

        Session paused ✓

        Context: crucial-prairie-2026-01-31-155011
        WIP commit: "WIP: refactoring auth system"
        Codex synced: No changes
        Servers stopped: :3000, :5173

        Session summary:
        - Refactored auth middleware
        - Added JWT validation
        - Updated tests (8 passing)

        Resume with: /resume
```

### Quick pause

```
User: /pause --quick

Claude: Quick pause...

        Context saved: my-app-2026-01-31-160022
        (Skipped WIP commit, codex sync, cleanup)

        Resume with: /resume
```

### No WIP commit

```
User: /pause --no-commit

Claude: Pausing session...

        Context saved: project-2026-01-31-161045
        Codex synced: No changes
        Servers stopped: :3000

        Note: Uncommitted changes NOT committed (--no-commit)
        You have 5 uncommitted files

        Resume with: /resume
```

## State File Location

`~/.claude/pause-state.json` - Global pause state for all projects

This file is:
- Auto-created on first `/pause`
- Updated on each `/pause`
- Read by `/resume`
- Tracks per-project pause state

## Integration with Existing Commands

**Differs from `/context-save`:**
- Automatic tracking (no need to remember ID)
- Optional WIP commit
- Optional codex sync
- Process cleanup
- Designed for pause/resume workflow

**Differs from `/end`:**
- Lighter weight (no docs sync to jbcloud)
- Assumes you're coming back soon
- Preserves exact state
- No memory commit to learned patterns

**Use `/pause` when:**
- Taking a break, coming back later today
- Switching to another project temporarily
- Need to preserve exact state
- Want automatic resume

**Use `/end` when:**
- Done with work session for the day
- Want full documentation sync
- Ready to commit learnings to memory
- Clean shutdown

## Error Handling

If git operations fail:
- Still save context
- Show warning
- Suggest manual commit

If codex sync fails:
- Show warning
- Continue with rest of pause

If server stop fails:
- Show which ports couldn't be stopped
- Continue anyway

## Safety

- Always saves context first (highest priority)
- WIP commits are clearly marked
- State file tracks per-project
- Never loses work
