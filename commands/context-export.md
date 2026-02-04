---
description: Export context for claude.ai. Copy output and paste into claude.ai to continue your session there.
---

# Context Export Command

Export your current session context in a format ready to paste into claude.ai.

## Usage

```
/context-export           # Export current project context
/context-export --latest  # Export most recent pause context
```

## Behavior

### 1. Gather Context

Collect from multiple sources:
- `~/.claude/pause-state.json` - Last paused state for this project
- `~/.claude/contexts/{contextId}.md` - Full context if available
- Git state - Current branch, status, recent commits
- Project CLAUDE.md - Project-specific instructions

### 2. Generate Export

Output a formatted block ready to paste:

```markdown
---
## Session Context (paste this into claude.ai)

**Project:** claude-codex
**Path:** /Users/jb/.21st/repos/Aventerica89/claude-codex
**Branch:** claude/create-landing-page-MbRCw
**Last Activity:** 2026-02-03 20:00

### What I'm Working On
Dashboard with PIN authentication and agent detail views

### Recent Progress
- Added AgentDetail component with tabs
- Created agent data model
- Fixed header navigation

### Next Steps
1. Add Commands/Skills/Rules pages
2. Connect real service APIs

### Key Files
- landing/src/components/dashboard/AgentDetail.tsx
- landing/src/lib/agents.ts

### Important Context
- PIN code: 2389
- Using Astro + React Islands
- Mock data in lib/services.ts

---
When done, tell me: "Give me a context summary to save"
I'll format it so you can save it back to Claude Code.
---
```

### 3. Instructions

After outputting the context, remind user:

```
Context exported above. Next steps:

1. Copy everything between the --- lines
2. Open claude.ai
3. Paste as your first message
4. When done on claude.ai, say: "Give me a context summary to save"
5. Run /context-import to save it back
```

## Output Format

The export is designed to:
- Give claude.ai all necessary context
- Include the reminder about saving context back
- Be copy-paste friendly (markdown format)

## Integration

Pairs with:
- `/context-import` - Import context from claude.ai back to CLI
- `/pause` - Saves context before this export
- `/start` - Loads context when returning
