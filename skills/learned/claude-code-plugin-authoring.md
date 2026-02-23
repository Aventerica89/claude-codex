# Claude Code Plugin Authoring Pattern

**Extracted:** 2026-02-23
**Context:** Building and publishing obsidian-bridge as a shareable Claude Code plugin

## Problem

How do you build a shareable Claude Code plugin with custom slash commands that
other users can install via `claude plugin install github:owner/repo`?

## Solution

A Claude Code plugin is a Git repo with this structure:

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json       (required: plugin manifest)
├── commands/
│   └── my-command.md     (each .md = one /command)
├── skills/               (optional)
├── agents/               (optional)
├── README.md
└── LICENSE
```

### plugin.json

```json
{
  "name": "plugin-name",
  "description": "One sentence description of what this does.",
  "author": {
    "name": "Your Name",
    "url": "https://github.com/your-handle"
  }
}
```

### Command files (commands/*.md)

Each markdown file becomes a `/command-name` slash command. The filename
(without `.md`) is the command name.

**Frontmatter fields:**
```yaml
---
description: Short description shown in /help listings
allowed-tools: [Bash, Read, Write, Glob]
argument-hint: "[optional argument description]"
---
```

**Body:** Plain English instructions telling Claude what to do at runtime.
No code is executed at install time — the markdown IS the prompt. Write it as
a step-by-step spec Claude will follow when the user runs the command.

**Key principles:**
- Commands must be self-contained — assume zero context
- Use `## Step N:` sections for multi-step flows
- Include exact bash commands with backticks
- Specify fallback/error behavior explicitly
- Make commands idempotent where possible (safe to re-run)

### Install

```bash
# From GitHub
claude plugin install github:owner/repo

# During development (local path)
claude plugin install ./path/to/plugin
```

### Publishing checklist

```bash
gh repo create owner/repo-name --public --push --source .
gh api repos/owner/repo-name/topics -X PUT \
  -f "names[]=claude-code" \
  -f "names[]=claude-code-plugin"
```

## Example

`commands/vault-open.md`:
```markdown
---
description: Open your Obsidian vault in Obsidian.
allowed-tools: [Bash, Read]
---

# Vault Open

## Step 1: Read vault path

Read ~/.claude/obsidian-config.json. Extract vault_path.
Default to ~/Obsidian-Claude if not set.

## Step 2: Open in Obsidian

\`\`\`bash
open -a Obsidian {vault_path}
\`\`\`

If Obsidian is not installed, tell the user to run /vault-init.
```

## When to Use

- Any time you want to distribute a set of slash commands as a reusable plugin
- Wrapping multi-step shell workflows into single commands
- Building tooling that works against user-specific config/paths discovered at runtime
- Sharing Claude Code automations with other Claude Code users

## Reference

See `~/obsidian-bridge/` for a complete working example.
Plugin format reference: `~/.claude/plugins/marketplaces/claude-plugins-official/plugins/example-plugin/`
