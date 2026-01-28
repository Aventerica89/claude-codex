---
description: Save current session context for later restoration. Better than /end when you need to pause and resume exactly where you left off.
---

# Context Save

Save the current session state to resume later without losing context.

## Usage

```
/context-save                    # Save with auto-generated name
/context-save auth-refactor      # Save with custom name
/context-save --list             # List saved contexts
/context-save --delete <name>    # Delete a saved context
```

## Arguments

Parse `$ARGUMENTS` for:
- Context name (optional, defaults to `{project}-{timestamp}`)
- `--list` or `-l` - List all saved contexts
- `--delete <name>` or `-d <name>` - Delete a context

---

## What Gets Saved

### 1. Project State
- Current working directory
- Git branch and status
- Uncommitted changes (as patch)

### 2. Session Context
- Current task/goal
- Recent decisions made
- Blockers identified
- Files being worked on

### 3. Task Progress
- TaskList state (if used)
- Completed vs pending items

### 4. Mental Model
- Architecture understanding
- Key patterns discovered
- Important file locations

---

## Storage Location

```
~/.claude/contexts/
├── {project}-{timestamp}.md     # Context file
├── {project}-{timestamp}.patch  # Uncommitted changes (if any)
└── index.json                   # Context index
```

---

## Workflow

### Save Context

1. **Gather State**
   ```bash
   # Project info
   pwd
   git branch --show-current
   git status --short

   # Create patch of uncommitted changes
   git diff > ~/.claude/contexts/{name}.patch
   ```

2. **Extract Session Context**
   - Summarize current conversation
   - Identify active task
   - Note key decisions

3. **Write Context File**
   ```markdown
   # Context: {name}

   **Saved**: {timestamp}
   **Project**: {project-name}
   **Branch**: {branch}
   **Directory**: {path}

   ## Current Task
   {What we're working on}

   ## Progress
   - [x] {Completed item}
   - [ ] {Pending item}

   ## Key Files
   - `src/auth/login.ts` - Main focus
   - `src/lib/validation.ts` - Modified

   ## Decisions Made
   - Using JWT instead of sessions because {reason}
   - Chose Zod for validation

   ## Next Steps
   1. {Immediate next action}
   2. {Following action}

   ## Blockers
   - {Any blockers}

   ## Notes
   {Any important context}
   ```

4. **Update Index**
   ```json
   {
     "contexts": [
       {
         "name": "auth-refactor",
         "project": "my-app",
         "branch": "feature/auth",
         "saved": "2025-01-27T18:30:00Z",
         "file": "auth-refactor.md"
       }
     ]
   }
   ```

### List Contexts (`--list`)

```
Saved Contexts:

| Name | Project | Branch | Saved |
|------|---------|--------|-------|
| auth-refactor | my-app | feature/auth | 2 hours ago |
| api-redesign | my-api | main | yesterday |
| bug-fix-123 | my-app | fix/issue-123 | 3 days ago |

Restore with: /context-restore <name>
```

### Delete Context (`--delete`)

```bash
rm ~/.claude/contexts/{name}.md
rm ~/.claude/contexts/{name}.patch  # if exists
# Update index.json
```

---

## Example

```
User: /context-save auth-refactor

Claude: Saving context "auth-refactor"...

## Context Saved

**Name**: auth-refactor
**Project**: my-saas-app
**Branch**: feature/new-auth
**Time**: 2025-01-27 18:30

### Captured
- Current task: Implementing JWT refresh tokens
- 3 uncommitted files (patch saved)
- 2 pending tasks
- Key decision: Using httpOnly cookies

### Restore Later
```
/context-restore auth-refactor
```

Safe to close this session!
```

---

## Notes

- Uncommitted changes are saved as a git patch
- Context files are human-readable markdown
- Can save multiple contexts per project
- Old contexts (>30 days) can be auto-cleaned
- Pairs with `/context-restore` for full workflow
