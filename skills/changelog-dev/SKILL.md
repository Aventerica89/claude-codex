---
name: changelog-dev
description: Toggle dev changelog tracking and show the two-changelog system status.
---

# Dev Changelog Toggle

**Command:** `/changelog-dev`
**Purpose:** Toggle dev changelog tracking on/off. Shows status of the two-changelog system.

## Two-Changelog System

VaporForge uses two separate changelogs in `ui/src/lib/version.ts`:

### DEV_CHANGELOG (every commit)
- Updated on **every single commit** — always growing
- Simple `{ date, summary }` entries
- Tracks granular dev progress
- Enforcement: **CLAUDE.md mandatory rule #4** (always in context)

### CHANGELOG (feature releases)
- Updated only when a **complete feature ships**
- Rich entries with version, tag, title, items
- May take 8+ dev commits per feature changelog bump
- Updated manually when bumping `APP_VERSION`

## Arguments

- No arguments: Toggle on/off
- `on`: Force enable
- `off`: Force disable
- `status`: Show current state

## State File

`~/.claude/changelog-dev-state.json`:
```json
{
  "enabled": true,
  "project": "/Users/jb/vaporforge",
  "changelogFile": "ui/src/lib/version.ts",
  "enabledAt": "2026-02-18T00:00:00Z"
}
```

## Toggle Behavior

### When toggling ON:
1. Detect current project directory
2. Write state file with `enabled: true`
3. Confirm:
```
Dev changelog tracking: ON
Project: vaporforge
File: ui/src/lib/version.ts

DEV_CHANGELOG will be updated on every commit.
CHANGELOG updates only on feature releases.
```

### When toggling OFF:
1. Set `enabled: false` in state file
2. Confirm:
```
Dev changelog tracking: OFF
(CLAUDE.md rule #4 still applies — this toggle is advisory)
```

## How DEV_CHANGELOG Works

Before every `git commit` in VaporForge:

1. Add a new entry at position [0] in `DEV_CHANGELOG`:
   ```typescript
   { date: '2026-02-18', summary: 'One-line description of what changed' }
   ```
2. Stage `ui/src/lib/version.ts`
3. Proceed with commit

Rules:
- One entry per commit (not per file changed)
- Summary should be concise (under 120 chars)
- Focus on what changed, not implementation details
- Include every commit — refactoring, fixes, features, all of it

## How CHANGELOG Works (Feature Releases)

Only update `CHANGELOG` when:
- A complete user-visible feature is ready
- `APP_VERSION` is being bumped
- A meaningful fix or security patch ships

Do NOT update `CHANGELOG` for:
- Intermediate development commits
- Internal refactoring
- Work-in-progress changes

## Enforcement

DEV_CHANGELOG enforcement lives in **CLAUDE.md mandatory rule #4** — it is always in context for every Claude session working on VaporForge. The `/changelog-dev` toggle is advisory and helps track whether the user wants this behavior.
