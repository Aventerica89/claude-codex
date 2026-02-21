---
description: Register a new command or skill convention in the Standards DB. Formats the Invoke field with colon notation and pipe separators, saves to Notion, and updates local skill files.
argument-hint: "[command-name] [optional: description]"
---

# Register Convention

Use this when you've created a new command, skill, or workflow pattern that should be documented in the Claude Code Standards database.

## What This Does

1. Formats the `Invoke` field using the canonical notation (see rules below)
2. Saves to the Notion Standards DB via `/save-to-notion:standards [subject]`
3. Optionally updates the local skill/command file to document the `:` notation

## Invoke Field Format Rules

### Subcommand notation

Subcommands (positional arguments that select behavior) use `:` between the base command and the subcommand:

```
/changelog:init
/changelog:feature "desc"
/save-to-notion:plan
/save-to-notion:standards [subject]
/sync-plans-index:new
/sync-plans-index:update
```

**Base command alone** always stays as-is — no colon needed:
```
/changelog
/save-to-notion
/help-hub
```

### Separators

Multiple invocations in one Invoke field use `|` (pipe) with spaces:
```
/changelog | /changelog:init | /changelog:feature desc | /changelog:dev | /changelog:sync | /changelog:standards
```

Do NOT use commas or backslash-escaped pipes.

### Flags stay as `--`

CLI flags are unchanged — they use `--` regardless:
```
/app-sync | /app-sync --dry-run | /app-sync --section=changelog
```

### MCP tools

MCP tool names are not slash commands — just list them with pipe separators:
```
mcp__1p__list_api_keys | mcp__1p__get_api_key | mcp__1p__store_api_key
```

### Optional arguments

Show optional arguments in brackets:
```
/save-to-notion:[type] | /save-to-notion:standards [subject]
```

## Steps

### 1. Determine the command name

If `$ARGUMENTS` provides a name, use it. Otherwise ask.

### 2. Build the Invoke field

List every invocation variant:
- Base command (if it does something on its own)
- Each subcommand with `:` notation
- Any important flags

Join with ` | ` (space-pipe-space).

**Example for a command with 3 subcommands:**
```
/my-command | /my-command:init | /my-command:run | /my-command:sync
```

### 3. Save to Notion Standards DB

Run `/save-to-notion:standards [command-name]` which will:
- Search for existing entries with the same subject
- Archive any `Group: Latest` entries (set to `Group: Archive`, increment Version)
- Create a new page with `Group: Latest, Version: N+1`

The content should include:
- What the command does (overview)
- When to use it
- All invocation variants with descriptions
- Any important notes or anti-patterns

### 4. Update the local file (if applicable)

If the command has a local skill file at `~/.claude/skills/*/SKILL.md` or `~/.claude/commands/*.md`:

- Find the Commands section
- Update any space-separated subcommand examples to `:` notation
- Ensure all variants are listed

### 5. Confirm

Report:
```
Convention registered!

Command: /[name]
Invoke: [formatted invoke field]
Notion: [page title] (Version N)
Local file: [path updated] (or "no local file found")
```

## Notation Quick Reference

| Pattern | Example | Notes |
|---------|---------|-------|
| Base command | `/changelog` | No colon |
| Subcommand | `/changelog:init` | Colon, no space |
| Subcommand + arg | `/changelog:feature "desc"` | Space after colon-subcommand |
| Optional arg | `/save-to-notion:[type]` | Brackets for optional |
| CLI flag | `--dry-run` | Double dash, unchanged |
| MCP tool | `mcp__1p__list_api_keys` | Double underscore, no slash |
| Separator | ` | ` | Space-pipe-space |

## Anti-Patterns

```
# WRONG: space-separated subcommand
/changelog init

# RIGHT: colon-separated
/changelog:init

# WRONG: comma separator
/changelog:init, /changelog:sync

# RIGHT: pipe separator
/changelog:init | /changelog:sync

# WRONG: escaped pipe
/changelog:init \| /changelog:sync

# RIGHT: plain pipe
/changelog:init | /changelog:sync
```
