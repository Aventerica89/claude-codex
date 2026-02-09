---
description: Save current session context to Notion before compacting. Auto-triggered by strategic-compact hook or run manually anytime.
argument-hint: "[optional page title]"
---

# Save Session Context to Notion

Save a comprehensive session summary to Notion so context survives compaction.

## When This Runs

- **Automatically**: When the strategic-compact hook detects a compact threshold
- **Manually**: User runs `/save-to-notion` at any time
- **Before /compact**: ALWAYS run this before manually compacting

## Arguments

Parse `$ARGUMENTS` for:
- Optional page title (defaults to `{project} | {date} | {branch}`)

## Notion Workspace Structure

All content lives under **JB Cloud** hub page (`302cc9ae-33da-81af-ad4b-c8137efe15f3`):

```
JB Cloud
├── Projects/
│   ├── VaporForge (302cc9ae-33da-8143-a60a-c2a1b8f5252a)
│   │   ├── Business Plan, Architecture, Roadmap DB
│   │   └── session saves, manifesto, plans
│   ├── Renvio Companion (302cc9ae-33da-8126-8ff9-eade98f50f13)
│   ├── Claude Codex (302cc9ae-33da-81fb-9e81-c5c60ddbfa49)
│   ├── Bricks CC (302cc9ae-33da-8169-8644-f892ba514817)
│   └── JB Cloud App Tracker (302cc9ae-33da-81d8-b0f1-cf482ad55dfb)
├── Claude Sessions (301cc9ae-33da-8169-8542-e8379afabe4f)
│   ├── Sessions DB (eda52d03-6a95-48f0-904e-3a57cc5e3719)
│   └── Lessons Learned DB (fcd9c1dd-b87c-4fa8-9a62-b7eb1f17d012)
└── Business Dashboard (302cc9ae-33da-81fa-86ff-f668553df520)
    ├── Revenue Tracker DB (232caa92-cf37-4371-b41f-57c9c9976a7d)
    ├── Competitive Intel DB (09d6d4ad-f616-4dda-a3f9-2236c4c3a2df)
    └── Marketing Calendar DB (c585a235-4d5f-4a06-9bd7-27be1778827f)
```

## Workflow

### Step 1: Generate Session Summary

Create a comprehensive summary of EVERYTHING in the current conversation:

**Project State:**
- Current working directory (`pwd`)
- Git branch (`git branch --show-current`)
- Git status (`git status --short`)
- Recent commits (`git log --oneline -5`)

**Session Content (extract from conversation):**
- What the user asked for (original request)
- All decisions made and WHY
- Files created, modified, or deleted (with brief description of changes)
- Errors encountered and how they were resolved
- Code patterns discovered or established
- Architecture decisions and trade-offs discussed
- Any research findings (URLs, docs referenced)
- Current state of the task (complete, in-progress, blocked)
- Exact next steps remaining

**Technical Context:**
- Key code snippets that are critical to understanding (keep under 50 lines each)
- API endpoints or integrations discussed
- Dependencies added or modified
- Environment variables or secrets discussed (names only, never values)

### Step 2: Create Notion Database Row

Create a row in the Sessions database using the `claude.ai Notion` MCP.

**Database data_source_id:** `eda52d03-6a95-48f0-904e-3a57cc5e3719`

Use `mcp__claude_ai_Notion__notion-create-pages` with:
```json
{
  "parent": {"data_source_id": "eda52d03-6a95-48f0-904e-3a57cc5e3719"},
  "pages": [{
    "properties": {
      "Session": "{title from args or auto-generated}",
      "Project": "{project name from mapping below}",
      "Status": "{one of: Complete, In Progress, Blocked}",
      "Branch": "{git branch or N/A}",
      "date:Date:start": "{YYYY-MM-DD}",
      "date:Date:is_datetime": 0,
      "Context Level": "{one of: ~10%, ~25%, ~50%, ~75%, ~90%}"
    },
    "content": "{session summary markdown — see structure below}"
  }]
}
```

**Determine the Project value** from the current working directory:

| Directory | Project Value | Notion Page ID | Icon |
|-----------|--------------|----------------|------|
| `~/vaporforge` | VaporForge | `302cc9ae-33da-8143-a60a-c2a1b8f5252a` | `https://vaporforge.jbcloud.app/icon-192.png` |
| `~/jb-cloud-app-tracker` | JB Cloud App Tracker | `302cc9ae-33da-81d8-b0f1-cf482ad55dfb` | `https://apps.jbcloud.app/icon.svg` |
| `~/renvio-companion-app` | Renvio Companion | `302cc9ae-33da-8126-8ff9-eade98f50f13` | `https://renvio.jbcloud.app/favicon.ico` |
| `~/claude-codex` | Claude Codex | `302cc9ae-33da-81fb-9e81-c5c60ddbfa49` | `https://codex.jbcloud.app/favicon.svg` |
| `~/bricks-cc` | Bricks CC | `302cc9ae-33da-8169-8644-f892ba514817` | (none yet) |
| `~` (home) or setup work | Claude Code Setup | (no dedicated page) | (none) |
| Anything else | Other | (no dedicated page) | (none) |

**Other page icons (for manual setup):**

| Page | Icon |
|------|------|
| JB Cloud (hub) | `https://vaporforge.jbcloud.app/icon-192.png` or cloud emoji |
| Business Dashboard | chart emoji or `https://apps.jbcloud.app/icon.svg` |
| Claude Sessions | robot emoji |

> **NOTE:** Page icons CAN be set programmatically via the external URL approach.
> Pass `"icon": {"type": "external", "external": {"url": "..."}}` alongside
> `page_id` and `command` in `notion-update-page`. It works despite not being
> in the documented schema (additionalProperties: true allows it).

**Determine Context Level** from how much work has been done:
- Just started, few tool calls → "~10%"
- Some exploration done → "~25%"
- Moderate work, mid-session → "~50%"
- Heavy session, lots of edits/research → "~75%"
- Very long session, approaching limits → "~90%"

**Page content structure:**

```markdown
## Summary
{2-3 sentence overview of what happened this session}

## What Was Done
- {Action 1 with details}
- {Action 2 with details}

## Decisions Made
| Decision | Reasoning |
|----------|----------|
| {decision} | {why} |

## Files Changed
| File | Action | Description |
|------|--------|-------------|
| {path} | created/modified/deleted | {what changed} |

## Errors Resolved
- **{Error}**: {How it was fixed}

## Key Code Context
{Critical snippets needed to understand the work — keep minimal}

## Current State
{Exact state of the project right now}

## Next Steps
1. {Immediate next action}
2. {Following action}
3. {Further actions}

## Notes for Future Sessions
{Anything a fresh Claude session would need to know to continue seamlessly}
```

### Step 3: Also Save Locally

Write the same summary to `~/.claude/contexts/{project}-notion-{timestamp}.md` as backup.

### Step 4: Confirm

```
Session context saved to Notion!

Row: "{title}"
Database: Sessions (under Claude Sessions → JB Cloud)
Status: {status} | Project: {project} | Context: {level}
Also saved: ~/.claude/contexts/{filename}

Safe to /compact now.
```

## Important Notes

- NEVER include secret values (API keys, tokens, passwords) — only variable names
- Include enough detail that a NEW Claude session can pick up where this one left off
- Focus on the WHY behind decisions, not just the WHAT
- If the conversation is very long, prioritize recent context over early exploration
- This command should complete quickly — don't over-format or over-research

## Key Database IDs (Quick Reference)

| Database | data_source_id |
|----------|---------------|
| Sessions | `eda52d03-6a95-48f0-904e-3a57cc5e3719` |
| Lessons Learned | `fcd9c1dd-b87c-4fa8-9a62-b7eb1f17d012` |
| VaporForge Roadmap | `25c04fab-d069-419e-81b6-80bd4158390c` |
| Revenue Tracker | `232caa92-cf37-4371-b41f-57c9c9976a7d` |
| Competitive Intel | `09d6d4ad-f616-4dda-a3f9-2236c4c3a2df` |
| Marketing Calendar | `c585a235-4d5f-4a06-9bd7-27be1778827f` |

## Integration

Pairs with:
- `/compact` — Run this BEFORE compacting
- `/context-save` — Similar but saves to local files only
- `/start` — Can reference Notion pages for context restoration
- Strategic-compact hook — Triggers this automatically
