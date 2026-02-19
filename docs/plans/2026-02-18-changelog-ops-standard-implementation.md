# Three-Tier Changelog System + Ops Standard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the authoritative `/changelog` skill, deploy hook automation, and Notion Operations Reference page so any Claude session produces identical changelogs across all projects.

**Architecture:** The `/changelog` skill contains verbatim templates — Claude fills variables only, no format decisions. A PostToolUse bash hook auto-fires on every deploy, bumping patch version and writing Tier 2+3 entries. Notion hosts one static reference page for human visibility.

**Tech Stack:** Bash hook script, claude-codex skill markdown, Notion MCP, `~/.claude/settings.json`

**Design doc:** `docs/plans/2026-02-18-changelog-ops-standard-design.md`

---

### Task 1: Retire `changelog-dev` skill (VaporForge-specific → absorbed by new standard)

**Files:**
- Modify: `skills/changelog-dev/SKILL.md`

**Step 1: Update changelog-dev to redirect to new standard**

Replace the VaporForge-specific content with a redirect. The new `/changelog` skill absorbs this responsibility. Keep the file so existing references don't break.

```markdown
---
name: changelog-dev
description: Toggle dev changelog tracking. Redirects to the three-tier /changelog standard.
---

# Dev Changelog

This skill is superseded by the three-tier changelog standard.

Use `/changelog` instead — it covers Tier 2 (Developer Log) plus Tier 1 (Public Feature Log) and Tier 3 (Action Log).

For the full standard: `/changelog standards`
```

**Step 2: Commit**

```bash
git add skills/changelog-dev/SKILL.md
git commit -m "refactor: redirect changelog-dev to new /changelog standard"
```

---

### Task 2: Create the `/changelog` skill

**Files:**
- Create: `skills/changelog/SKILL.md`

**Step 1: Create skill directory**

```bash
mkdir -p /Users/jb/.21st/repos/Aventerica89/claude-codex/skills/changelog
```

**Step 2: Write the skill file**

Create `skills/changelog/SKILL.md` with this exact content:

```markdown
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
**Trigger:** Every deploy, automatic via deploy hook. Manual via `/changelog dev`.
**When:** Every deploy without exception.
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

**changelog-action.json:**
```
(empty file — NDJSON, entries appended by deploy hook)
```

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
```

**Step 3: Verify the file was created**

```bash
cat /Users/jb/.21st/repos/Aventerica89/claude-codex/skills/changelog/SKILL.md | head -5
```

Expected: frontmatter with `name: changelog`

**Step 4: Commit**

```bash
git add skills/changelog/SKILL.md
git commit -m "feat: add three-tier /changelog skill with verbatim templates"
```

---

### Task 3: Write the deploy changelog hook script

**Files:**
- Create: `~/.claude/scripts/deploy-changelog-hook.sh`

**Step 1: Check the scripts directory exists**

```bash
ls ~/.claude/scripts/
```

If it doesn't exist: `mkdir -p ~/.claude/scripts/`

**Step 2: Write the hook script**

Create `~/.claude/scripts/deploy-changelog-hook.sh`:

```bash
#!/bin/bash
# deploy-changelog-hook.sh
# Fires after every deploy command. Bumps patch version, writes Tier 2+3 changelog entries.
# Called by PostToolUse hook in ~/.claude/settings.json

COMMAND="${1:-}"

# Only fire on deploy patterns
if ! echo "$COMMAND" | grep -qE '(wrangler deploy|vercel( deploy)?|npm run deploy|npx wrangler)'; then
  exit 0
fi

# Find package.json (walk up from current dir)
PKG_FILE=""
DIR="$(pwd)"
while [ "$DIR" != "/" ]; do
  if [ -f "$DIR/package.json" ]; then
    PKG_FILE="$DIR/package.json"
    break
  fi
  DIR="$(dirname "$DIR")"
done

if [ -z "$PKG_FILE" ]; then
  exit 0
fi

PROJECT_DIR="$(dirname "$PKG_FILE")"

# Read and bump patch version
CURRENT_VERSION=$(node -e "console.log(require('$PKG_FILE').version)" 2>/dev/null)
if [ -z "$CURRENT_VERSION" ]; then
  exit 0
fi

# Bump patch: 0.26.0 -> 0.26.1
NEW_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{print $1"."$2"."($3+1)}')
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('$PKG_FILE', 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync('$PKG_FILE', JSON.stringify(pkg, null, 2) + '\n');
"

# Get git info
HASH=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null | awk '{print $1}')
HASH="${HASH:-unknown}"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE=$(date -u +"%Y-%m-%d")
TIME=$(date -u +"%H:%M")

# Tier 3: append to changelog-action.json (NDJSON)
ACTION_FILE="$PROJECT_DIR/changelog-action.json"
MSG=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null | cut -c8- | cut -c1-60)
MSG="${MSG:-deploy}"
echo "{ \"v\": \"$NEW_VERSION\", \"ts\": \"$TS\", \"msg\": \"$MSG\", \"hash\": \"$HASH\" }" >> "$ACTION_FILE"

# Tier 2: append to CHANGELOG-DEV.md
DEV_FILE="$PROJECT_DIR/CHANGELOG-DEV.md"
COMMITS=$(git -C "$PROJECT_DIR" log --oneline -3 2>/dev/null | while read line; do
  HASH_SHORT=$(echo "$line" | awk '{print $1}')
  MSG_SHORT=$(echo "$line" | cut -c8-)
  # Detect type from conventional commit prefix
  TYPE="CHORE   "
  if echo "$MSG_SHORT" | grep -qi "^feat"; then TYPE="FEAT    "; fi
  if echo "$MSG_SHORT" | grep -qi "^fix"; then  TYPE="FIX     "; fi
  if echo "$MSG_SHORT" | grep -qi "^refactor"; then TYPE="REFACTOR"; fi
  if echo "$MSG_SHORT" | grep -qi "^perf"; then TYPE="PERF    "; fi
  if echo "$MSG_SHORT" | grep -qi "^security"; then TYPE="SECURITY"; fi
  SCOPE=$(echo "$MSG_SHORT" | sed 's/^[^:]*: *//' | awk '{print $1}' | tr '[:upper:]' '[:lower:]' | tr -d ',' | cut -c1-20)
  DESC=$(echo "$MSG_SHORT" | sed 's/^[^:]*: *//')
  echo "$TYPE$SCOPE — $DESC"
done)

printf "\n### %s %s · %s · v%s\n%s\n" "$DATE" "$TIME" "$HASH" "$NEW_VERSION" "$COMMITS" >> "$DEV_FILE"

echo "[changelog] v$CURRENT_VERSION → v$NEW_VERSION · Tier 2+3 updated"
```

**Step 3: Make it executable**

```bash
chmod +x ~/.claude/scripts/deploy-changelog-hook.sh
```

**Step 4: Smoke test the script manually**

```bash
# From a project directory with package.json
cd ~/vaporforge
~/.claude/scripts/deploy-changelog-hook.sh "wrangler deploy"
```

Expected output: `[changelog] v0.26.0 → v0.26.1 · Tier 2+3 updated`
Check: `tail -1 changelog-action.json` should show a JSON line with the new version.

---

### Task 4: Wire the deploy hook into settings.json

**Files:**
- Modify: `~/.claude/settings.json`

**Step 1: Read current settings.json**

```bash
cat ~/.claude/settings.json
```

**Step 2: Add PostToolUse hook for Bash**

Add to the `hooks` object. The hook passes the bash command as an argument to the script via the `CLAUDE_TOOL_INPUT` env var (set automatically by Claude Code for PostToolUse hooks).

The new PostToolUse entry:
```json
"PostToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "~/.claude/scripts/deploy-changelog-hook.sh \"$CLAUDE_TOOL_INPUT_COMMAND\""
      }
    ]
  }
]
```

Merge this into the existing hooks object alongside the existing `Stop` and `PreToolUse` entries.

**Step 3: Verify settings.json is valid JSON**

```bash
python3 -c "import json; json.load(open('/Users/jb/.claude/settings.json')); print('valid')"
```

Expected: `valid`

**Step 4: Test the hook fires**

In a project directory, run a deploy command. Watch for `[changelog]` output in the Claude response.

---

### Task 5: Create Notion "Claude Code Standards" page

**Files:** None (Notion MCP call)

**Step 1: Load the Notion MCP tool**

```
ToolSearch: select:mcp__claude_ai_Notion__notion-create-pages
```

**Step 2: Create the page under JB Cloud hub**

Use `mcp__claude_ai_Notion__notion-create-pages` with parent `302cc9ae-33da-81af-ad4b-c8137efe15f3` (JB Cloud hub).

Title: `Claude Code Standards`

Content structure:
```markdown
# Claude Code Standards

Single source of truth for Claude Code behavior across all JB Cloud projects.
Last updated: 2026-02-18

---

## Changelog Standard

[Full three-tier spec from /changelog standards output]

---

## 1Password Convention

Title format: `#project / ENV_VAR_NAME`
Vaults: App Dev (project env vars) | Business (Anthropic, OpenAI) | Personal (personal only)
Tags: always `env-var` + project + provider + category
Gotcha: `get_api_key` defaults to "Private" vault — always specify `vault: "App Dev"` or `"Business"`

Full detail: 1password-convention.md in claude-codex memory

---

## Notion Commands Reference

`/save-to-notion` — Save to Knowledge Base DB (2fabdc9f...)
Types: session | plan | table | decision | memory | reference | verbatim
Flags: `/save-to-notion plan` | `/save-to-notion decision "title"` | `/save-to-notion reference`

Knowledge Base DB: 2fabdc9f-eca4-4431-b16c-d6b03dae3667
Sessions DB (archived): eda52d03-6a95-48f0-904e-3a57cc5e3719

---

## Active Setup

Skills active globally: changelog, save-to-notion, hookify, security, routine-merge, tdd-workflow, continuous-learning, strategic-compact
Agents: planner, code-reviewer, security-reviewer, tdd-guide, build-error-resolver, e2e-runner
Hooks: strategic-compact (PreToolUse Edit/Write), deploy-changelog (PostToolUse Bash), continuous-learning + flight-recorder (Stop)

---

## Hookify Rules

Run `/hookify list` in Claude Code for current active rules.
Purpose: prevent recurring mistakes from re-occurring via pre/post tool hooks.
```

**Step 3: Save the page ID to memory**

After creation, note the new page ID and add it to MEMORY.md under the Notion Workspace section.

---

### Task 6: Update MEMORY.md with new Notion page ID and changelog status

**Files:**
- Modify: `~/.claude/projects/-Users-jb/memory/MEMORY.md`

**Step 1: Add Claude Code Standards page reference**

In the Notion Workspace section, add:
```
- **Claude Code Standards:** `{new page ID}` — changelog spec, 1Password, Notion commands, active setup, hookify rules
```

**Step 2: Update changelog section**

Add a new top-level section near the 1Password convention:
```markdown
## Changelog Standard (GLOBAL - ALL PROJECTS)
- **Three-tier system:** Tier 1 (Public/CHANGELOG.md) | Tier 2 (Dev/CHANGELOG-DEV.md) | Tier 3 (Action/changelog-action.json)
- **Skill:** `/changelog` — contains verbatim templates, run `/changelog standards` in any session
- **Auto-trigger:** PostToolUse hook on deploy commands bumps patch version + writes Tier 2+3
- **Tier 1 only:** explicit `--feature` flag or `/changelog feature "desc"`
- **Init new project:** `/changelog init`
```

---

## Execution Order

1 → 2 → 3 → 4 (sequential, each depends on previous)
5 → 6 (can run after 4, independent of 3-4)

Total estimated tasks: 6 tasks, ~25 steps
