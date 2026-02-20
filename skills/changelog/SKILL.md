---
name: changelog
description: Three-tier changelog standard for all JB Cloud projects. Contains verbatim templates — use this before writing any changelog entry.
---

# Changelog Standard

Three-tier system. Every project uses this exact format. No deviations.

## Commands

- `/changelog` — show status: files initialized? latest entry per tier? current version?
- `/changelog init` — scaffold all three files with headers + one example entry
- `/changelog feature "desc"` — write Tier 1 entry (Added/Fixed/Changed/Removed)
- `/changelog dev` — manually write Tier 2 entry outside a deploy
- `/changelog sync` — regenerate `changelog.json` from `CHANGELOG.md`
- `/changelog standards` — print this full spec inline (for VaporForge sessions)

**Flags:** `--dry-run` | `--version 1.3.0` | `--project vaporforge` | `--feature`

---

## Tier 1 — Public Feature Log

**File:** `CHANGELOG.md`
**Trigger:** Explicit only — `--feature` flag or `/changelog feature "desc"`
**When:** Minor and major version bumps only. User-visible changes only.
**Displayed:** Settings → "What's New" tab. All users.

### Entry template (copy exactly, fill variables):

```
## v{MAJOR}.{MINOR}.0 — {Month} {DD}, {YYYY}

+ Added   {user-facing description, present tense, no technical jargon}
~ Changed  {what changed and what it means for the user}
- Removed  {what was removed}
* Fixed    {what was broken, now fixed}
```

**Symbol set — fixed, no others allowed:**
- `+` Added
- `~` Changed
- `-` Removed
- `*` Fixed

**Rules:**
- One symbol per line. No multi-line entries.
- Plain language. No commit hashes, file names, or implementation details.
- Only include symbols that apply — skip if nothing was removed, omit the `-` line.
- Version header uses MAJOR.MINOR.0 — patch versions never appear in Tier 1.

**Example:**
```
## v0.27.0 — February 18, 2026

+ Added   GitHub repo browser when creating new sites
+ Added   Visual element selection in the Agency editor
* Fixed    Session token not refreshing after 24 hours
```

---

## Tier 2 — Developer Log

**File:** `CHANGELOG-DEV.md`
**Trigger:** Every commit, automatic via commit hook. Manual via `/changelog dev`.
**When:** Every commit without exception. Includes build notes — TYPE + scope + description.
**Displayed:** Admin-only toggle panel, co-located with footer version badge.

### Entry template (copy exactly, fill variables):

```
### {YYYY}-{MM}-{DD} {HH}:{MM} · {SHORT_HASH} · v{VERSION}
{TYPE}  {scope} — {what changed and why, one line per change}
```

**TYPE values — padded to 8 chars, uppercase:**
- `FEAT    ` — new feature or capability
- `FIX     ` — bug fix
- `REFACTOR` — code change, no behavior change
- `CHORE   ` — build, deps, config
- `PERF    ` — performance improvement
- `SECURITY` — security fix

**Example:**
```
### 2026-02-18 19:42 · d9e121d · v0.26.1
FEAT    agency — GitHub repo browser in New Site modal
FIX     ws-agent — reconnect loop on session timeout
```

**Rules:**
- One header block per deploy (not per file changed).
- Scope is the module/area affected, lowercase, no spaces.
- Description is present tense, under 80 chars.
- Multiple changes in one deploy = multiple TYPE lines under one header.

---

## Tier 3 — Action Log

**File:** `changelog-action.json`
**Trigger:** Every deploy, automatic via deploy hook. No exceptions.
**When:** Every deploy, including patch-only deploys.
**Displayed:** Footer version badge (always visible). Click expands last 5 entries.

### Entry format (append-only, one JSON object per line):

```json
{ "v": "{VERSION}", "ts": "{ISO8601}", "msg": "{one-liner}", "hash": "{SHORT_HASH}" }
```

**Example:**
```json
{ "v": "0.26.1", "ts": "2026-02-18T19:42:00Z", "msg": "Agency: GitHub repo browser", "hash": "d9e121d" }
```

**Rules:**
- Never rewrite. Always append.
- One line per deploy.
- `msg` is under 60 chars — just enough to identify the deploy.
- File is newline-delimited JSON (NDJSON), not a JSON array.

---

## changelog.json — Structured Output for Websites

**Trigger:** Auto-regenerated from `CHANGELOG.md` on every Tier 1 update.
**Purpose:** Project websites read this file to display the public changelog UI. No external API calls.

### Format:
```json
[
  {
    "version": "0.27.0",
    "date": "2026-02-18",
    "entries": [
      { "type": "added", "text": "GitHub repo browser when creating new sites" },
      { "type": "fixed", "text": "Session token not refreshing after 24 hours" }
    ]
  }
]
```

**Type values:** `added` | `changed` | `removed` | `fixed`

---

## Initialization (`/changelog init`)

Creates these files if they don't exist:

**CHANGELOG.md:**
```markdown
# Changelog

All notable user-facing changes. See CHANGELOG-DEV.md for technical log.

<!-- Entries added by /changelog feature or deploy --feature flag -->
```

**CHANGELOG-DEV.md:**
```markdown
# Developer Log

Technical log. Updated on every deploy.

<!-- Entries added automatically by deploy hook -->
```

**changelog-action.json:** empty file (NDJSON, entries appended by deploy hook)

**changelog.json:**
```json
[]
```

---

## Display Placement (all projects)

| Tier | Location | Who sees it |
|------|----------|-------------|
| Tier 1 | Settings → "What's New" tab | All users |
| Tier 2 | Admin toggle panel near footer version badge | Admin/owner only |
| Tier 3 | Footer version badge, click to expand last 5 | All users |

Footer badge format: `v0.26.1 · deployed 14m ago`

---

## Deploy Hook (what fires automatically)

The PostToolUse hook in `~/.claude/settings.json` fires after these Bash patterns:
`wrangler deploy`, `npx wrangler deploy`, `vercel`, `npm run deploy`

It runs `~/.claude/scripts/deploy-changelog-hook.sh` which:
1. Bumps patch version in `package.json`
2. Appends Tier 3 entry to `changelog-action.json`
3. Appends Tier 2 entry to `CHANGELOG-DEV.md`
4. If `--feature` was in the original command, prompts for Tier 1 entry

---

## VaporForge Integration

VaporForge sandboxes have no `~/.claude` access. Get the standard into context via:
1. Run `/changelog standards` at session start — prints this full spec inline
2. The VF Command Center rules can include: "For changelog format, run /changelog standards"
