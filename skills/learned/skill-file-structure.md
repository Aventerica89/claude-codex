# Claude Code Skill File Structure

**Extracted:** 2026-02-18
**Context:** Creating or fixing user-level skills in ~/.claude/skills/

## Problem
Skills created as standalone `.md` files directly in `~/.claude/skills/`
(e.g., `~/.claude/skills/my-skill.md`) are silently ignored by Claude Code's
skill discovery. No error is shown — the skill simply doesn't appear in the
available skills list or respond to `/my-skill`.

## Solution
Skills MUST use a directory structure with `SKILL.md` inside:

```
# WRONG — silently ignored
~/.claude/skills/my-skill.md

# CORRECT — discovered by Claude Code
~/.claude/skills/my-skill/SKILL.md
```

Fix for existing standalone skills:
```bash
mkdir -p ~/.claude/skills/my-skill
mv ~/.claude/skills/my-skill.md ~/.claude/skills/my-skill/SKILL.md
```

The skill appears in the available list immediately after the move
(no restart needed).

## When to Use
- Creating a new skill from scratch
- Debugging why a skill isn't being discovered
- User reports `/skill-name` returns "Unknown skill"
- Migrating skills between machines
