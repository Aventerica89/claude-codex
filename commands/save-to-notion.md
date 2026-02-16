---
description: Save context to Notion Knowledge Base. Supports 7 types: session, plan, table, decision, memory, reference, verbatim.
argument-hint: "[type] [optional title]"
---

# Save to Notion Knowledge Base

Save structured context to the Knowledge Base database in Notion. Supports 7 content types with auto-detection, auto-populated git fields, and local backup.

## Arguments

Parse `$ARGUMENTS`:
- **First word** = type (session, plan, table, decision, memory, reference, verbatim)
- **Remaining words** = custom title suffix
- **No arguments** = auto-detect type (default: session)

Examples:
- `/save-to-notion` -> auto-detect, likely "session"
- `/save-to-notion plan` -> plan type, auto-generated title
- `/save-to-notion decision WebSocket vs SSE` -> decision type, title suffix "WebSocket vs SSE"

## Type Detection (when no type given)

Scan the current conversation for signals:

| Signal | Type |
|--------|------|
| Design doc, implementation phases, "Phase 1/2/3", task list | plan |
| Comparison table, "vs", matrix, feature grid, side-by-side | table |
| "We chose X over Y", trade-off analysis, ADR | decision |
| "Gotcha:", "lesson learned", pattern discovery, "always do X" | memory |
| API docs, code reference, config snippet, SDK usage | reference |
| "save everything", "full transcript", "dump it all" | verbatim |
| General dev work, bug fixes, feature implementation | session |

If unsure, default to **session**.

## Knowledge Base Database

**data_source_id:** `2fabdc9f-eca4-4431-b16c-d6b03dae3667`
**Parent:** Claude Sessions (`301cc9ae-33da-8169-8542-e8379afabe4f`)

This is the NEW Knowledge Base database. The old Sessions DB (`eda52d03-6a95-48f0-904e-3a57cc5e3719`) is archived.

## Workflow

### Step 1: Determine Type

1. Check if `$ARGUMENTS` starts with a valid type keyword
2. If not, run auto-detection on conversation content
3. Default to "session" if no clear signal

### Step 2: Gather Context

Run these commands to collect project state:

```bash
pwd                              # working directory
git branch --show-current        # current branch
git status --short               # working tree status
git log --oneline -5             # recent commits
git log --oneline -1             # latest commit SHA
```

Also check for version:
- `package.json` -> extract `version` field
- Or latest git tag: `git describe --tags --abbrev=0 2>/dev/null`

### Step 3: Generate Content

Use the type-specific template (see Content Templates below) to generate the page content from conversation context.

**Critical rules:**
- Plans: preserve ALL phases, tasks, and structure completely
- Tables: preserve ALL rows and columns -- NEVER truncate
- Decisions: include all options considered and full reasoning
- Memory: include concrete code examples
- Reference: preserve code blocks verbatim
- Verbatim: curate key exchanges for Notion, dump full raw text locally
- Session: comprehensive but focused on decisions and next steps

### Step 4: Create Notion Page

Use `mcp__claude_ai_Notion__notion-create-pages` with:

```json
{
  "parent": {"data_source_id": "2fabdc9f-eca4-4431-b16c-d6b03dae3667"},
  "pages": [{
    "properties": {
      "Title": "{generated title per naming convention}",
      "Type": "{detected or explicit type}",
      "Project": "{from directory mapping}",
      "Status": "{Complete, In Progress, Blocked, or Draft}",
      "Branch": "{git branch or N/A}",
      "Version": "{semver or N/A}",
      "Git Commit": "{short SHA or N/A}",
      "Deploy Status": "N/A",
      "Context Level": "{estimated from session work}",
      "Tags": "{auto-suggested from content}",
      "date:Date:start": "{YYYY-MM-DD}",
      "date:Date:is_datetime": 0
    },
    "content": "{generated markdown content}"
  }]
}
```

**Title naming convention:**
- session: `{Project} | Session: {description}`
- plan: `{Project} | Plan: {plan name}`
- table: `{Project} | Table: {subject}`
- decision: `{Project} | Decision: {what was decided}`
- memory: `{Project} | Memory: {pattern name}`
- reference: `{Project} | Ref: {subject}`
- verbatim: `{Project} | Transcript: {date} {topic}`

If user provided a title suffix in `$ARGUMENTS`, use it as the description/name part.

### Step 5: Save Local Backup

**Always** write to: `~/.claude/contexts/{project}-{type}-{timestamp}.md`

**For verbatim type only**, also write the raw transcript to:
`~/.claude/transcripts/{project}-{timestamp}.txt`

### Step 6: Confirm

Output:

```
Saved to Notion Knowledge Base!

Title: "{title}"
Type: {type} | Project: {project} | Status: {status}
Branch: {branch} | Version: {version} | Commit: {sha}
Context Level: {level}
Tags: {tags}

Local backup: ~/.claude/contexts/{filename}
{For verbatim: Raw transcript: ~/.claude/transcripts/{filename}}

Safe to /compact now.
```

## Content Templates

### session (default)

```markdown
## Summary
{2-3 sentence overview of what happened this session}

## Work Completed
- {Action 1 with commit SHAs where applicable}
- {Action 2 with details}

## Decisions Made
| Decision | Reasoning | Impact |
|----------|-----------|--------|
| {decision} | {why} | {what it affects} |

## Files Changed
| File | Action | Description |
|------|--------|-------------|
| {path} | created/modified/deleted | {what changed} |

## Errors Resolved
- **{Error}**: {How it was fixed}

## Current State
{Where things stand right now}

## Next Steps
1. {Immediate next action}
2. {Following action}
3. {Further actions}

## Notes for Future Sessions
{Anything a fresh Claude session needs to continue seamlessly}
```

### plan

```markdown
## Objective
{What this plan achieves}

## Architecture
{System design, data flow, key decisions}

## Implementation Phases
### Phase 1: {name}
- [ ] Task 1
- [ ] Task 2

### Phase 2: {name}
- [ ] Task 3
- [ ] Task 4

## Dependencies and Risks
| Risk | Mitigation |
|------|------------|
| {risk} | {how to handle} |

## Success Criteria
- {Measurable outcome 1}
- {Measurable outcome 2}
```

### table

Tables are saved **complete and verbatim** -- never truncated or summarized.

```markdown
## Context
{Why this comparison was done, what triggered it}

## {Table Title}
| ... complete table content ... |

## Conclusion
{Key takeaway from the comparison}
```

### decision

```markdown
## Decision
{One sentence: what was decided}

## Context
{Why this decision was needed}

## Options Considered
| Option | Pros | Cons |
|--------|------|------|
| {option A} | {pros} | {cons} |
| {option B} | {pros} | {cons} |

## Chosen Approach
{Which option and detailed reasoning}

## Consequences
{What this decision means going forward}
```

### memory

```markdown
## Pattern / Gotcha
{Clear description of the pattern or gotcha}

## Context
{When and how this was discovered}

## Example
{Code snippet or concrete example}

## When to Apply
{Trigger conditions -- when should future sessions use this knowledge}
```

### reference

Freeform format. Preserve code blocks, API signatures, configs, and snippets verbatim. No fixed template -- structure naturally based on content.

### verbatim

```markdown
## Key Exchanges
{Curated important back-and-forth: plans, tables, decisions at full fidelity}

## Raw Transcript
Full conversation saved to: ~/.claude/transcripts/{filename}
```

For verbatim: the Notion page gets the curated highlights. The full raw text goes to local file only (Notion has size limits).

## Project Directory Mapping

Determine Project from the current working directory:

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
| ~ (home) or setup work | Claude Code Setup |
| Anything else | Other |

## Auto-Populated Fields

| Field | Source |
|-------|--------|
| Project | pwd -> directory mapping above |
| Branch | `git branch --show-current` |
| Version | package.json version or `git describe --tags --abbrev=0` |
| Git Commit | `git log --oneline -1` (short SHA) |
| Deploy Status | N/A (default, update manually) |
| Context Level | Estimate from session length/work done |
| Tags | Auto-suggest from content (e.g., MCP, Docker, AI SDK) |
| Date | Today's date |

**Context Level estimation:**
- Just started, few tool calls -> "~10%"
- Some exploration done -> "~25%"
- Moderate work, mid-session -> "~50%"
- Heavy session, lots of edits/research -> "~75%"
- Very long session, approaching limits -> "~90%"

## Key Database IDs (Quick Reference)

| Database | data_source_id |
|----------|---------------|
| Knowledge Base (NEW) | `2fabdc9f-eca4-4431-b16c-d6b03dae3667` |
| Sessions (old, archived) | `eda52d03-6a95-48f0-904e-3a57cc5e3719` |
| Lessons Learned | `fcd9c1dd-b87c-4fa8-9a62-b7eb1f17d012` |
| VaporForge Roadmap | `25c04fab-d069-419e-81b6-80bd4158390c` |
| Revenue Tracker | `232caa92-cf37-4371-b41f-57c9c9976a7d` |
| Competitive Intel | `09d6d4ad-f616-4dda-a3f9-2236c4c3a2df` |
| Marketing Calendar | `c585a235-4d5f-4a06-9bd7-27be1778827f` |

## Important Notes

- NEVER include secret values (API keys, tokens, passwords) -- only variable names
- Include enough detail that a NEW Claude session can pick up where this one left off
- Focus on the WHY behind decisions, not just the WHAT
- Plans and tables are ALWAYS saved complete -- never truncate
- If the conversation is very long, prioritize recent context over early exploration
- This command should complete quickly -- don't over-format or over-research
- Tags should be meaningful keywords (technology names, feature areas, bug types)

## Integration

Pairs with:
- `/compact` -- Run this BEFORE compacting
- `/context-save` -- Similar but saves to local files only
- `/start` -- Can reference Notion pages for context restoration
- Strategic-compact hook -- Triggers this automatically
