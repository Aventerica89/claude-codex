# Skills as Cross-Context Source of Truth

## Pattern

When you want Claude to behave consistently across different contexts — CLI sessions, VaporForge sandboxes, fresh sessions with no memory — put the standard in a **skill**, not a Notion database or MEMORY.md.

## The Insight

Notion requires: MCP loaded + correct DB ID + Claude knowing to check it. Three failure points.
MEMORY.md truncates at 200 lines — standards buried past that are invisible.
VaporForge sandboxes have no access to `~/.claude` at all.

A skill is **always available**. It's loaded automatically. It contains the exact spec, not a pointer to one.

## When to Apply

- You want Claude to generate something in a consistent format across projects (changelogs, commit messages, PR descriptions)
- A convention needs to survive context switches, compaction, and VaporForge sessions
- You're tempted to "just put it in Notion" for reference — challenge that: is this for humans or for Claude?

## How to Apply

1. Put the exact templates, rules, and examples verbatim in the skill file
2. Leave Claude no latitude to interpret — fill-in-the-blank only
3. Add a `standards` sub-command that prints the full spec inline (for VaporForge sessions)
4. Notion gets a human-readable copy — updated manually when the standard changes

## Example

The `/changelog` skill contains all three tier templates verbatim. Any session — CLI or VaporForge — runs `/changelog standards` and gets the full format spec inline. No Notion, no memory file, no external lookup needed.

## Contrast

| Approach | CLI | VaporForge | After /compact | Human readable |
|----------|-----|------------|----------------|----------------|
| Notion DB | Needs MCP | No | Needs MCP | Yes |
| MEMORY.md | If <200 lines | No | Lost | No |
| **Skill** | **Always** | **Yes (via /standards)** | **Always** | **Via skill file** |
