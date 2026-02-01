---
description: Resume last paused session automatically (no ID needed)
---

# Resume Command

Automatically resume the last paused session for the current project. No need to remember context IDs - it's all automatic.

## Arguments

Parse `$ARGUMENTS` for optional flags:
- No arguments - Resume last pause for current project
- `--list` or `-l` - List all paused sessions
- `--project <path>` - Resume specific project's pause
- `--context <id>` - Resume specific context by ID (advanced)

## Behavior

### 1. Read Pause State

Read `~/.claude/pause-state.json`:
```json
{
  "projects": {
    "/Users/jb/my-project": {
      "contextId": "my-project-2026-01-31-155011",
      "timestamp": "2026-01-31T15:50:11.056Z",
      "branch": "main",
      "summary": "Working on auth refactor",
      "uncommittedFiles": 3
    }
  }
}
```

### 2. Find Current Project Entry

Match current working directory against pause state:
- Exact match: use that entry
- No match: show error and list available paused sessions

### 3. Load Context

Read context file from `~/.claude/contexts/{contextId}.md`

### 4. Restore State

Display the saved context:
```
Resuming session ✓

Project: my-project
Paused: 2 hours ago (2026-01-31 15:50)
Branch: main
Uncommitted files: 3

Last working on:
- Refactoring auth middleware
- Added JWT validation
- Updated tests (8 passing)

Context restored. Continue where you left off.
```

### 5. Check for Changes Since Pause

Compare current state with paused state:
```bash
# Check if branch changed
current_branch=$(git branch --show-current)

# Check if new commits
git log --oneline {pause-timestamp}..HEAD

# Check if uncommitted files changed
git status --porcelain
```

Show warnings if state diverged:
```
⚠️  Warning: State has changed since pause
- Branch changed: main → feature/auth
- 2 new commits since pause
- Uncommitted files: 3 → 5
```

### 6. Optional: Start Dev Server

If project has dev server config (package.json scripts):
```
Start dev server? [Y/n]

(If yes)
Starting dev server...
npm run dev

Server running at http://localhost:3000
```

## Example Flows

### Simple resume

```
User: /resume

Claude: Resuming session ✓

        Project: crucial-prairie
        Paused: 2 hours ago
        Branch: supreme-marsupial-6367e8

        Last working on:
        - Creating /codex-sync and /codex-fetch commands
        - Implementing bidirectional sync
        - Testing rename for discoverability

        Context restored. Continue where you left off.
```

### Resume with changes detected

```
User: /resume

Claude: Resuming session ✓

        Project: my-app
        Paused: 1 day ago
        Branch: main

        ⚠️  State has changed since pause:
        - 3 new commits (git log to see)
        - Uncommitted files: 2 → 5

        Last working on:
        - Refactoring auth system
        - Added JWT validation

        Context restored, but be aware of changes.
```

### List paused sessions

```
User: /resume --list

Claude: Paused sessions:

        1. crucial-prairie
           Paused: 2 hours ago
           Branch: supreme-marsupial-6367e8
           Working on: codex sync commands

        2. jb-cloud-app-tracker
           Paused: 1 day ago
           Branch: main
           Working on: Vercel integration

        3. landing-page
           Paused: 3 days ago
           Branch: feature/hero
           Working on: Hero section redesign

        Resume specific project:
        /resume --project /Users/jb/jb-cloud-app-tracker

        Or cd to project and run: /resume
```

### No paused session

```
User: /resume

Claude: No paused session found for this project.

        Current directory: /Users/jb/new-project
        No entry in pause state.

        Available paused sessions:
        - crucial-prairie (2 hours ago)
        - jb-cloud-app-tracker (1 day ago)

        Use /resume --project <path> to resume another project
        Or use /pause to start tracking this project
```

### Resume specific project

```
User: /resume --project /Users/jb/other-project

Claude: Resuming session ✓

        Project: other-project
        Paused: 5 hours ago
        Branch: main

        Note: You're currently in /Users/jb/current-project
        Context is for: /Users/jb/other-project

        Last working on:
        - Database migration
        - User schema updates

        Switch to project directory:
        cd /Users/jb/other-project
```

## State File

Reads from: `~/.claude/pause-state.json`

## Integration with Context System

Uses the same context storage as `/context-save` and `/context-restore`:
- Contexts stored in `~/.claude/contexts/`
- `/resume` is just automatic `/context-restore` for last pause
- Can still use `/context-restore {id}` manually if needed

## Error Handling

### No pause state file
```
No paused sessions found.

The pause state file doesn't exist yet.
Use /pause to create your first paused session.
```

### Corrupted state file
```
Error: Pause state file is corrupted.

Location: ~/.claude/pause-state.json

Fix by:
1. Manually edit the file
2. Delete it (you'll lose pause tracking)
3. List contexts manually: /context-save --list
```

### Context file missing
```
Error: Context file not found.

Expected: ~/.claude/contexts/project-2026-01-31.md
The file may have been deleted.

Available contexts:
/context-save --list
```

## Comparison

| Command | Purpose | Remembering ID |
|---------|---------|----------------|
| `/pause` + `/resume` | Quick pause/resume workflow | Automatic |
| `/context-save` + `/context-restore` | Manual snapshots | Manual ID required |
| `/checkpoint` | Quick checkpoint | N/A |
| `/end` | Full session cleanup | N/A |

## Use Cases

- Paused work yesterday, resuming today
- Switching between multiple projects
- Coming back from lunch break
- Context switching during the day
- Want to see "what was I doing?"

## Advanced: Resume by Context ID

```
/resume --context my-project-2026-01-30-094512

Resuming specific context...
(Bypasses pause state, directly loads context)
```

This is equivalent to:
```
/context-restore my-project-2026-01-30-094512
```
