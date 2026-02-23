---
name: save-to-obsidian
description: Save session context, plans, decisions, or patterns to the local Obsidian vault. Zero token overhead - writes pure markdown directly to the file system. Use instead of or alongside save-to-notion.
---

# Save to Obsidian Vault

Write context to the local Obsidian vault as clean markdown. No API calls, no token bloat — just files Claude can read back instantly.

## Step 1: Resolve vault path

Read `~/.claude/obsidian-config.json` and use `vault_path`. Expand `~` to the actual home directory (`/Users/jb`).

## Step 2: Determine type from $ARGUMENTS

| Argument | Folder | Filename pattern |
|---|---|---|
| `session` (default) | `sessions/` | `YYYY-MM-DD-{project}-{slug}.md` |
| `plan` | `plans/` | `YYYY-MM-DD-{project}-{slug}.md` |
| `decision` | `decisions/` | `YYYY-MM-DD-{slug}.md` |
| `pattern` | `patterns/` | `{slug}.md` (overwrite — patterns are evergreen) |
| `project` | `projects/` | `{project-name}.md` (overwrite — single file per project) |
| `memory` | `memory/` | `{slug}.md` (overwrite — persistent facts) |
| `reference` | `reference/` | `{slug}.md` |

If $ARGUMENTS is empty, auto-detect type from conversation context.

## Step 3: Build frontmatter

```yaml
---
date: YYYY-MM-DD
type: {type}
project: {project name or "general"}
tags: [{type}, {project}, claude-code]
---
```

## Step 4: Write content by type

### session
```markdown
# Session: {title}

**Date:** {date}
**Project:** {project}
**Branch:** {branch if known}

## What Was Done
{bullet list of completed work}

## Decisions Made
{decisions and reasoning}

## Files Changed
{list of created/modified/deleted files}

## Errors & Fixes
{problems encountered and how they were resolved}

## Current State
{exactly where things stand right now}

## Next Steps
{specific next actions — enough for a fresh session to continue}

## Key Context
{architecture notes, patterns, gotchas that matter}
```

### plan
```markdown
# Plan: {title}

**Date:** {date}
**Project:** {project}
**Status:** {active|complete|paused}

## Objective
{what this plan achieves}

## Architecture
{design decisions}

## Phases
{ALL phases — never truncate}

## Dependencies & Risks
{blockers and mitigations}

## Success Criteria
{how to know it's done}
```

### decision
```markdown
# Decision: {title}

**Date:** {date}
**Project:** {project}
**Status:** {active|superseded}

## Context
{why this decision was needed}

## Decision
{what was decided}

## Reasoning
{why this over alternatives}

## Consequences
{what this affects}

## Alternatives Rejected
{other options and why not}
```

### pattern
```markdown
# Pattern: {title}

**Last updated:** {date}
**Projects:** {where this has been used}

## When to Use
{conditions that trigger this pattern}

## Implementation
{code or steps}

## Gotchas
{things to watch out for}
```

### project
```markdown
# Project: {name}

**Last updated:** {date}
**Status:** {active|paused|complete}
**Repo:** {path or URL}
**Site:** {URL if deployed}

## Stack
{tech stack}

## Current State
{where things are right now}

## Key Files
{important file paths}

## Architecture Notes
{how it's structured}

## Known Issues
{open bugs or debt}

## Next Steps
{what comes next}
```

## Step 5: Write the file

Use the Write tool to write to `{vault_path}/{folder}/{filename}.md`.

Create the folder if it doesn't exist (use Bash `mkdir -p`).

## Step 6: Confirm

Output: `Saved to {relative path from vault root}` — nothing else. Keep it terse.

## Also backup locally

After writing to the vault, also write to `~/.claude/contexts/{filename}.md` as a local backup (same content, no frontmatter needed in backup).
