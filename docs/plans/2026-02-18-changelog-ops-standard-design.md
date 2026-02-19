# Design: Three-Tier Changelog System + Claude Code Operations Standard

**Date:** 2026-02-18
**Status:** Approved, ready for implementation
**Scope:** claude-codex (global), all JB Cloud projects

---

## Problem

Without a defined standard, every Claude session generates changelogs differently. VaporForge sessions have no access to local `~/.claude` memory, so conventions drift. The goal is a single authoritative source of truth that any Claude session — CLI, VaporForge sandbox, or fresh context — can read and follow exactly.

---

## Decision

**Skills as source of truth, not Notion.** The `/changelog` skill *is* the format — it contains exact templates, not guidelines. Notion serves as human-readable reference only, never as the operational standard Claude reads from.

---

## Architecture

### Three-Tier Changelog Standard

Each project maintains three changelog layers:

**Tier 1 — Public Feature Log** (`CHANGELOG.md` + `changelog.json`)
- Audience: end users
- Trigger: explicit only — `--feature` flag on deploy, or `/changelog feature "..."`
- Updates on: minor and major version bumps only
- Displayed: Settings page "What's New" tab (Cloud Tracker style)

```markdown
## v1.3.0 — February 18, 2026

+ Added   GitHub repo browser in New Site modal
~ Changed  Deploy hook now fires on wrangler and vercel
- Removed  Legacy SSE streaming fallback
* Fixed    Session token not refreshing after 24h
```

Symbol set — fixed, no deviation:
- `+` Added
- `~` Changed
- `-` Removed
- `*` Fixed

**Tier 2 — Developer Log** (`CHANGELOG-DEV.md`)
- Audience: developer / admin
- Trigger: every deploy, automatic via hook
- Displayed: admin-only toggle panel, co-located with version badge in footer

```markdown
### 2026-02-18 19:42 · d9e121d · v0.26.1
FEAT  agency — GitHub repo browser in New Site modal
FIX   ws-agent — reconnect loop on session timeout
```

**Tier 3 — Action Log** (`changelog-action.json`)
- Audience: developer — version verification heartbeat
- Trigger: every deploy, automatic via hook, no exceptions
- Displayed: version badge in footer, always visible; click expands last 5 entries

```json
{ "v": "0.26.1", "ts": "2026-02-18T19:42:00Z", "msg": "Agency: GitHub repo browser", "hash": "d9e121d" }
```

---

### Display Placement (all projects)

| Tier | Location | Visibility |
|------|----------|------------|
| Tier 1 | Settings → "What's New" tab | All users |
| Tier 2 | Admin toggle panel near footer version badge | Admin/owner only |
| Tier 3 | Footer version badge, always present | All users |

Footer badge: `v0.26.1 · deployed 14m ago`
- Click → expands Tier 3 drawer (last 5 entries)
- Admin toggle button adjacent → reveals Tier 2 Dev Log panel

---

### Deploy Hook

PostToolUse hook in `~/.claude/settings.json`, fires after successful Bash deploy commands.

**Detected patterns:**
- `wrangler deploy`
- `vercel` / `vercel deploy`
- `npm run deploy`
- `npx wrangler deploy`

**On every deploy (automatic):**
1. Read current version from `package.json`
2. Bump patch version (`0.26.0` → `0.26.1`), write back
3. Get latest git hash + timestamp
4. Append one JSON line to `changelog-action.json` (Tier 3)
5. Append one block to `CHANGELOG-DEV.md` (Tier 2)

**On deploy with `--feature` flag:**
6. Prompt Claude: "Describe this feature for the public changelog"
7. Claude writes Tier 1 entry using exact template

**Rules:**
- Never auto-writes Tier 1 without explicit `--feature`
- Always append-only, never rewrites existing entries
- Never fires on failed deploys

---

### `/changelog` Skill — Commands

The skill contains all three templates verbatim. Claude fills in variables only — no format decisions.

| Command | Action |
|---------|--------|
| `/changelog` | Show tier status for current project — files initialized? Latest entry per tier? Current version? |
| `/changelog init` | Scaffold all three files with correct headers and one example entry |
| `/changelog feature "desc"` | Write Tier 1 entry — Claude categorizes (Added/Fixed/Changed/Removed), formats, appends, regenerates `changelog.json` |
| `/changelog dev` | Manually write Tier 2 entry (for mid-session changes outside a deploy) |
| `/changelog sync` | Regenerate `changelog.json` from `CHANGELOG.md` |
| `/changelog standards` | Print full format spec inline — designed for VaporForge sessions needing quick reference |

**Flags:**
- `--dry-run` — show what would be written, don't write
- `--version 1.3.0` — override auto-detected version
- `--project vaporforge` — override auto-detected project name
- `--feature` — trigger Tier 1 prompt (also usable on deploy command directly)

---

### Notion Operations Reference Page

**Not a database.** One static page under JB Cloud hub for human reference.

```
JB Cloud Hub
└── Claude Code Standards  (new page)
    ├── Changelog Standard    — three tiers, format spec, examples
    ├── 1Password Convention  — mirrors 1password-convention.md
    ├── Notion Commands       — all /save-to-notion flags documented
    ├── Active Setup          — agents/skills/routines currently active
    └── Hookify Rules         — active rules and what they prevent
```

Updated on demand via `/save-to-notion reference` — not automatic.

---

### VaporForge Integration

VaporForge sandboxes have no access to `~/.claude`. The standard reaches them via:

1. **`/changelog standards` command** — VaporForge user runs it, skill prints the full spec inline into the session context
2. **Raw GitHub URL** — `claude-codex` skill file is public; VaporForge system prompt can inject the raw URL for Claude to fetch on demand
3. **VF Rules** — the Command Center "VF Internal Rules" can include a pointer: "For changelog format, run /changelog standards"

---

## What Is NOT in Scope

- Maintenance Log → DevTools (`apps.jbcloud.app/applications/:id?tab=maintenance`), auto-wired via security command hooks
- VaporForge Issue Tracker → separate concern, style reference only
- Notion as changelog data source → rejected; sites read their own `changelog.json`

---

## Success Criteria

- Any Claude session on any project can run `/changelog init` and produce identical file structure
- `/changelog standards` output is the canonical reference — no ambiguity in format
- Every deploy auto-updates Tier 2 + Tier 3 without Claude being asked
- Footer version badge is present on all JB Cloud projects
- Notion "Claude Code Standards" page exists and is current
