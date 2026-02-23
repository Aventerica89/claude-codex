# Claude Code Vault

This vault is written by Claude Code. Do not edit files here manually — they will be overwritten.

## Structure

| Folder | Contents |
|---|---|
| `sessions/` | Per-session work summaries |
| `plans/` | Implementation plans |
| `decisions/` | Architecture decision records |
| `patterns/` | Reusable code/design patterns |
| `projects/` | Per-project status (one file per project, kept current) |
| `memory/` | Persistent facts Claude remembers across sessions |
| `reference/` | Reference material, research notes |

## Usage

From any Claude Code session:
- `/save-to-obsidian` — auto-detect and save current context
- `/save-to-obsidian session` — save session summary
- `/save-to-obsidian plan` — save implementation plan
- `/save-to-obsidian decision` — save an ADR
- `/save-to-obsidian pattern` — save a reusable pattern
- `/save-to-obsidian project` — update project status

## Vault Path

Configured in `~/.claude/obsidian-config.json`.
