# Notion Knowledge Base System Design

**Date:** 2026-02-16
**Status:** Approved
**Scope:** /save-to-notion command overhaul + new Knowledge Base database

## Problem

The current `/save-to-notion` command only saves session summaries with a fixed template. Valuable content like comparison tables, architecture decisions, implementation plans, and patterns get lost during context compaction. The Sessions database has a limited schema (6 properties) and missing projects.

## Solution

Replace the single-purpose session save with a **multi-type knowledge management system**. One command (`/save-to-notion`) supports 7 content types via argument parsing and auto-detection. A new "Knowledge Base" Notion database replaces the Sessions DB with an expanded schema.

## Database Schema

**Name:** Knowledge Base
**Parent:** Claude Sessions page (`301cc9ae-33da-8169-8542-e8379afabe4f`)
**Data source ID:** `2fabdc9f-eca4-4431-b16c-d6b03dae3667`

### Properties

| Property | Type | Values |
|----------|------|--------|
| Title | title | Auto-generated per naming convention |
| Type | select | session, plan, table, decision, memory, reference, verbatim |
| Project | select | VaporForge, WP Dispatch, DevTools, JB Cloud App Tracker, Renvio Companion, Claude Codex, Bricks CC, URLsToGo, ACSS MCP Server, Claude Code Setup, Other |
| Status | select | Complete, In Progress, Blocked, Draft |
| Branch | text | Git branch name |
| Version | text | Semver tag (e.g., v0.22.0) |
| Git Commit | text | Short SHA (e.g., bf9411d) |
| Deploy Status | select | Deployed, Pending, N/A |
| Context Level | select | ~10%, ~25%, ~50%, ~75%, ~90% |
| Tags | multi_select | Flexible (MCP, Streaming, Mobile, Docker, AI SDK, WebSocket, etc.) |
| Date | date | Session date |
| Created time | auto | System timestamp |

## Command Interface

```
/save-to-notion                    -> auto-detect type (default: session)
/save-to-notion session            -> explicit session save
/save-to-notion plan               -> save design/implementation plan
/save-to-notion table              -> save comparison table
/save-to-notion decision           -> save architecture decision
/save-to-notion memory             -> save pattern/gotcha/lesson
/save-to-notion reference          -> save code/API reference
/save-to-notion verbatim           -> curated transcript + local raw dump
/save-to-notion plan My Feature    -> type + custom title suffix
```

## Auto-Detection Logic

When no type argument is provided, scan conversation for signals:

| Signal | Detected Type |
|--------|---------------|
| Design doc, implementation phases, "Phase 1/2/3" | plan |
| Comparison table, "vs", matrix, feature grid | table |
| "We chose X over Y", trade-off analysis | decision |
| "Gotcha:", "lesson learned", pattern discovery | memory |
| API docs, code snippets, config reference | reference |
| "save everything", "full transcript" | verbatim |
| Default / general dev work | session |

## Content Templates

### session (default)

Title: `{Project} | Session: {description}`

```markdown
## Summary
{2-3 sentence overview}

## Work Completed
- {Action with commit SHAs}

## Decisions Made
| Decision | Reasoning | Impact |
|----------|-----------|--------|

## Files Changed
| File | Action | Description |
|------|--------|-------------|

## Current State
{Where things stand}

## Next Steps
1. {Immediate next}
2. {Following}
```

### plan

Title: `{Project} | Plan: {plan name}`

```markdown
## Objective
{What this plan achieves}

## Architecture
{System design, data flow}

## Implementation Phases
### Phase 1: {name}
- [ ] Task 1
- [ ] Task 2

## Dependencies and Risks
| Risk | Mitigation |

## Success Criteria
- {Measurable outcome}
```

### table

Title: `{Project} | Table: {subject}`

Table content saved **verbatim and complete** -- never truncated.

```markdown
## Context
{Why this comparison was done}

## {Table Title}
| ... full table ... |

## Conclusion
{Key takeaway}
```

### decision

Title: `{Project} | Decision: {what was decided}`

```markdown
## Decision
{One sentence}

## Context
{Why needed}

## Options Considered
| Option | Pros | Cons |
|--------|------|------|

## Chosen Approach
{Which and why}

## Consequences
{What this means}
```

### memory

Title: `{Project} | Memory: {pattern name}`

```markdown
## Pattern / Gotcha
{Description}

## Context
{When discovered}

## Example
{Code snippet}

## When to Apply
{Trigger conditions}
```

### reference

Title: `{Project} | Ref: {subject}`

Freeform -- code blocks, API signatures, configs. Preserved verbatim.

### verbatim

Title: `{Project} | Transcript: {date} {topic}`

```markdown
## Key Exchanges
{Curated important back-and-forth -- plans, tables, decisions at full fidelity}

## Raw Transcript
Saved to: ~/.claude/transcripts/{filename}
```

## Auto-Populated Fields

| Field | Source |
|-------|--------|
| Project | pwd -> directory mapping |
| Branch | git branch --show-current |
| Version | package.json version or latest git tag |
| Git Commit | git log --oneline -1 |
| Deploy Status | N/A (default) |
| Context Level | Estimate from session length |
| Tags | Auto-suggest from content |
| Date | Today |

## Project Directory Mapping

| Directory | Project |
|-----------|---------|
| ~/vaporforge | VaporForge |
| ~/wp-dispatch | WP Dispatch |
| ~/devtools | DevTools |
| ~/jb-cloud-app-tracker | JB Cloud App Tracker |
| ~/renvio-companion-app | Renvio Companion |
| ~/claude-codex | Claude Codex |
| ~/bricks-cc | Bricks CC |
| ~/URLsToGo | URLsToGo |
| ~/acss-mcp-server | ACSS MCP Server |
| ~ (home) | Claude Code Setup |
| Other | Other |

## Local Backup Strategy

Every save writes to:
- `~/.claude/contexts/{project}-{type}-{timestamp}.md` -- structured summary (always)
- `~/.claude/transcripts/{project}-{timestamp}.txt` -- raw transcript (verbatim type only)

## Workspace Structure (after implementation)

```
JB Cloud
  Claude Sessions
    Knowledge Base (NEW -- master DB, all 7 types)
    Sessions (OLD -- archived, read-only)
    Lessons Learned (existing, kept)
```

## Migration Plan

1. Create Knowledge Base database in Notion
2. Update /save-to-notion skill with new logic
3. Update all ID references in skill and memory files
4. Old Sessions DB stays as-is (historical archive)
5. Lessons Learned DB stays (may migrate content later)

## Key Database IDs (to update after creation)

| Database | data_source_id |
|----------|---------------|
| Knowledge Base | `2fabdc9f-eca4-4431-b16c-d6b03dae3667` |
| Sessions (old) | eda52d03-6a95-48f0-904e-3a57cc5e3719 |
| Lessons Learned | fcd9c1dd-b87c-4fa8-9a62-b7eb1f17d012 |
