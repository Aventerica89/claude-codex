# Notion Auto-Save Rule (MANDATORY)

## Core Rule

**ALWAYS save session context to Notion before compacting.** Context lost during compaction is gone forever.

## When to Save

1. **When the hook tells you**: If you see `[AutoSave]` or `[StrategicCompact]` in hook output, run `/save-to-notion` IMMEDIATELY before continuing your work.

2. **Before any /compact**: NEVER run /compact without first running /save-to-notion.

3. **At logical boundaries**: After completing a feature, fixing a bug, or finishing a research phase — save to Notion even if the hook hasn't fired yet.

4. **When context feels heavy**: If you've done significant exploration, made multiple decisions, or changed many files — save proactively.

## How to Save

Run `/save-to-notion` which will:
1. Detect content type (session, plan, table, decision, memory, reference, verbatim)
2. Generate structured content using type-specific template
3. Create a Notion page in the **Knowledge Base** database (`2fabdc9f-eca4-4431-b16c-d6b03dae3667`)
4. Save a local backup to `~/.claude/contexts/`

Supports explicit types: `/save-to-notion plan`, `/save-to-notion decision`, etc.
Or auto-detects from conversation content when no type given.

## What to Include

The summary MUST include enough detail for a brand new Claude session to continue seamlessly:
- Original user request
- All decisions made and WHY
- Files created/modified/deleted
- Errors encountered and resolutions
- Current task state
- Exact next steps
- Key code patterns or architecture context

## What NOT to Include

- Secret values (API keys, tokens, passwords)
- Extremely long code dumps (keep snippets under 50 lines)
- Redundant information already in CLAUDE.md or memory files

## Emergency Save

If you suspect context is about to be lost (auto-compact approaching, very long session):
1. Write the summary directly to `~/.claude/contexts/{project}-emergency-{timestamp}.md`
2. THEN try Notion save
3. This ensures at least a local backup exists

## Counter Reset

The tool counter at `/tmp/claude-tool-count` auto-resets after 2 hours of inactivity.
To manually reset: `rm /tmp/claude-tool-count`
