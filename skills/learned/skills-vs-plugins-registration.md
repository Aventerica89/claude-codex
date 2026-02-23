# Skills vs Plugins — Where to Put Custom Commands

**Extracted:** 2026-02-22
**Context:** Debugging why `/hig-ui-pass` wasn't appearing in autocomplete despite plugin files existing on disk

## Problem
A custom skill was created as a **plugin** (`~/.claude/plugins/hig-ui/`) with hand-crafted entries in `installed_plugins.json` and `settings.json`. The plugin validated (`claude plugin validate` passed), but the skill never appeared in the autocomplete or available skills list.

## Root Cause
The plugin system loads plugins from the `cache/` directory, populated by `claude plugin install` from registered marketplaces. Manually creating a plugin directory and editing `installed_plugins.json` by hand does NOT register it with the plugin loader. All working plugins have `installPath` inside `~/.claude/plugins/cache/`.

## Solution
**Personal skills go in `~/.claude/skills/<name>/SKILL.md` — NOT as plugins.**

```
# For personal/custom skills:
~/.claude/skills/my-skill/SKILL.md     # Correct — auto-discovered

# For distributable plugins (shared with others):
claude plugin marketplace add <source>  # Register marketplace first
claude plugin install <name>@<market>   # Install from marketplace
```

## Decision Matrix

| Need | Use | Location |
|------|-----|----------|
| Personal skill for your own use | User-level skill | `~/.claude/skills/<name>/SKILL.md` |
| Skill shared across your projects | User-level skill | Same — user scope is global |
| Distributable to other users | Plugin in a marketplace | `claude plugin install` |
| Third-party plugin | Marketplace install | `claude plugin install <name>@<market>` |

## What Does NOT Work
- Manually creating `~/.claude/plugins/<name>/` with plugin structure
- Hand-editing `installed_plugins.json` to add entries
- Hand-editing `settings.json` to enable `"plugin@plugin": true`
- Having valid `plugin.json` without marketplace installation

## Cleanup After Mistake
If you accidentally created a manual plugin:
1. Remove the directory: `rm -r ~/.claude/plugins/<name>`
2. Remove cache if created: `rm -r ~/.claude/plugins/cache/<name>`
3. Remove entry from `installed_plugins.json`
4. Remove enable line from `settings.json`
5. Copy the SKILL.md to `~/.claude/skills/<name>/SKILL.md`

## When to Use
- Creating any new skill or command for personal use
- Debugging why a skill isn't showing in `/` autocomplete
- Deciding between skill vs plugin approach
- Migrating a broken plugin back to a working skill
