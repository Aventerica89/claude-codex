---
description: Import context from claude.ai back to CLI. Paste the context summary claude.ai gave you.
---

# Context Import Command

Import a context summary from claude.ai back into Claude Code.

## Usage

```
/context-import
```

Then paste the context summary that claude.ai generated.

## Behavior

### 1. Prompt for Input

```
Paste the context summary from claude.ai:
(The text claude.ai generated when you said "Give me a context summary to save")
```

### 2. Parse Context

Extract from the pasted content:
- Project name/path
- Branch
- What was worked on
- Progress made
- Next steps
- Key decisions

### 3. Save Context

Create/update context file at `~/.claude/contexts/{project}-{timestamp}.md`

Update `~/.claude/pause-state.json`:
```json
{
  "projects": {
    "/path/to/project": {
      "contextId": "project-2026-02-03-210000",
      "timestamp": "2026-02-03T21:00:00.000Z",
      "branch": "current-branch",
      "summary": "Summary from claude.ai",
      "source": "claude.ai",
      "nextSteps": ["..."]
    }
  }
}
```

### 4. Confirm

```
Context imported successfully!

Saved to: ~/.claude/contexts/claude-codex-2026-02-03-210000.md
Updated: ~/.claude/pause-state.json

From claude.ai session:
- Worked on: [summary]
- Next steps: [list]

Run /start or /resume to continue where claude.ai left off.
```

## What to Tell claude.ai

When ending your claude.ai session, say:

```
Give me a context summary to save. Include:
- What we worked on
- Progress made
- Key decisions
- Next steps
- Important file paths
```

claude.ai will output something like:

```markdown
## Context Summary

**Project:** claude-codex
**Branch:** claude/create-landing-page-MbRCw

### Worked On
- Implemented session lifecycle commands
- Created /start, updated /pause, /resume, /end

### Progress
- All 4 commands now documented
- Added branch mismatch detection
- Synced to marketplace

### Key Decisions
- /start does branch verification
- /end does full cleanup with push
- /pause is lightweight, /end is comprehensive

### Next Steps
1. Add context sync to GitHub
2. Test full workflow
3. Create 1Password routine

### Files Changed
- commands/start.md (new)
- commands/pause.md (updated)
- commands/resume.md (updated)
- commands/end.md (updated)
```

Copy that and use `/context-import` to save it.

## Integration

Pairs with:
- `/context-export` - Export context TO claude.ai
- `/start` - Will load this imported context
- `/resume` - Full context restore
