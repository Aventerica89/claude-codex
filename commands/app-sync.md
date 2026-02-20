# /app-sync — Full Project Synchronization

Comprehensive sync command for any JB Cloud project. Audits and updates every spec, document, UI description, changelog, landing page, and plan file so the entire system reflects the current state of the codebase.

Run after major milestones, version bumps, or extended development periods.

## Arguments

Parse `$ARGUMENTS` for optional flags:
- `--dry-run` — Report what needs updating without making changes
- `--section=<name>` — Run only a specific section (e.g., `--section=changelog`)
- No arguments = full sync (all sections)

## Execution Strategy

Use **parallel subagents** for independent audit tasks, then sequential updates for files that depend on audit results. Create a worktree branch `sync/app-sync-YYYY-MM-DD` for all changes so they can be reviewed before merging.

---

## Phase 0: Project Detection

Before auditing, detect the project type by reading:

```bash
pwd                            # project root
cat CLAUDE.md 2>/dev/null      # project overview, architecture, key files
cat package.json 2>/dev/null   # version, scripts, stack
git log --oneline -5           # recent activity
ls -la                         # top-level structure
```

Extract:
- `PROJECT_NAME` — from CLAUDE.md or directory name
- `CURRENT_VERSION` — from package.json or CLAUDE.md
- `HAS_LANDING` — does `landing/` directory exist?
- `HAS_SETTINGS_UI` — does `ui/src/components/settings/` exist?
- `HAS_DOCS` — does `docs/` directory exist?
- `HAS_PLANS` — does `docs/plans/` or `docs/PLAN.md` exist?
- `STACK` — infer from package.json (Next.js / CF Workers / Astro / etc.)

---

## Phase 1: Audit (Parallel Subagents)

Launch parallel subagents to gather current state:

**Subagent A: Codebase State Snapshot**
- Read `package.json` for current version and scripts
- Run `git log --oneline` since last tag/release to get all changes
- Run `git diff --stat HEAD~20` to see recently touched files
- Find the in-app version constant (grep for `APP_VERSION`, `version`, `appVersion`)
- Find and read changelog/version files (`version.ts`, `CHANGELOG.md`, `changelog-action.json`)
- Catalog all API routes (grep `router.get\|router.post\|app.get\|app.post`)
- Count features: settings tabs, API endpoints, key UI components

**Subagent B: Documentation Audit**
- Read `CLAUDE.md` — check Architecture, Key Files, Gotchas against actual codebase
- Read `~/.claude/projects/-Users-jb/memory/MEMORY.md` — check version/status accuracy
- If `docs/` exists: read all `docs/*.md` — flag outdated or contradicting content
- If `docs/plans/` exists: read plan files — check completion vs git history
- If `docs/PLAN.md` exists: flag completed items still listed as pending
- If `docs/plans/BACKLOG.md` exists: flag completed items

**Subagent C: Landing Page Audit** _(skip if no `landing/` directory)_
- Read `landing/src/components/Features.astro` — compare cards against actual features
- Read `landing/src/components/Pricing.astro` — check tier features match reality
- Read `landing/src/components/FAQ.astro` — flag outdated answers
- Read any other landing page components for stale copy

**Subagent D: Settings / Guide UI Audit** _(skip if no `ui/src/components/settings/`)_
- Read `GuideTab.tsx` — check all sections reflect current features
- Read `CommandCenterTab.tsx` — check defaults and system prompts
- Read `AboutTab.tsx` — check version display and feature chips
- Scan ALL settings tabs for outdated references or missing features

---

## Phase 2: Updates (Sequential)

Inform by Phase 1 audit results. Only update what the audit flagged as outdated or missing.

### Section 1: Version and Changelog Sync

**Files:** `package.json`, version constant file, `CHANGELOG.md`, `CHANGELOG-DEV.md`, `changelog-action.json`

1. Align `package.json` version with in-app version constant (fix if mismatched)
2. Check git log for commits since last `CHANGELOG.md` entry — add missing entries in three-tier format
3. Verify `changelog-action.json` has entries for recent deploys
4. Regenerate `changelog.json` from `CHANGELOG.md` if it exists

### Section 2: Project CLAUDE.md Update

**File:** `CLAUDE.md` (project root)

1. Update version number in header
2. Update Architecture section if new routes/bindings/services added
3. Update Key Files tables if new files created or renamed
4. Update Critical Gotchas with any new patterns learned this session
5. Update Development commands if build/deploy scripts changed
6. Keep it concise — CLAUDE.md is a quick reference, not a novel

### Section 3: Memory Files Update

**Files:** `~/.claude/projects/-Users-jb/memory/MEMORY.md` and topic files

1. Update version number and deployment status for this project
2. Move completed roadmap items to "done" with version tags
3. Update "NEXT UP" section with actual next priorities
4. Remove resolved known issues, add new ones
5. Trim MEMORY.md if over 200 lines — move detail to topic files

### Section 4: Landing Page Feature Sync _(skip if no `landing/`)_

**Files:** `landing/src/components/Features.astro`, `Pricing.astro`, others

1. Add feature cards for capabilities shipped but not yet on landing page
2. Remove or update stale feature cards
3. Update pricing tier features to reflect current capabilities
4. Set `badge: 'New'` on recently added features, remove stale 'New' badges

### Section 5: Settings / Guide UI Updates _(skip if no `ui/src/components/settings/`)_

**Files:** All settings tab files

1. Add guide sections for new features not yet documented
2. Update feature chips in About tab
3. Update any hardcoded text that references features with outdated descriptions

### Section 6: Plan File Audit _(skip if no `docs/plans/`)_

**Files:** `docs/plans/*.md`, `docs/PLAN.md`, `docs/plans/BACKLOG.md`

1. For each plan file, check completed tasks against git history
2. Mark completed tasks with checkmarks
3. Flag abandoned/superseded plans
4. Update BACKLOG.md — remove completed items, add newly identified work

### Section 7: Notion Project Page Update

Use Notion MCP to update the project's Notion page (find ID from CLAUDE.md or MEMORY.md):
- Update current version
- Update feature highlights
- Update architecture notes if changed
- Update roadmap status

### Section 8: Build Verification

1. Run `npm run typecheck` or equivalent — fix any type errors from text updates
2. Run `npm run build` — verify clean build
3. If landing page changed, verify static build succeeds

### Section 9: Commit and Report

1. Stage all changes with descriptive commit message:
   ```
   chore: app-sync — update docs, changelog, landing page to v{version}
   ```

2. Generate summary report:

```
=== APP-SYNC REPORT ===

Project: {project-name}
Version: {current version}
Branch: sync/app-sync-{date}

Updated:
  - CLAUDE.md: {what changed}
  - MEMORY.md: {what changed}
  - Changelog: {N new entries}
  - Landing page: {N feature cards added/updated}  [or: skipped — no landing/]
  - Settings UI: {N tabs updated}  [or: skipped — no settings UI]
  - Plans: {N tasks marked complete, N flagged stale}  [or: skipped]
  - Notion: {updated/skipped}

Skipped (no changes needed):
  - {list}

Ready to merge: git checkout main && git merge sync/app-sync-{date}
```

---

## Bonus Checks (included in every sync)

- **Dead flags**: Grep for `TODO/FIXME/HACK` comments in recently changed files
- **Stale badges**: Find `badge: 'New'` in landing page that's more than 2 versions old
- **API route coverage**: Compare route files against router registrations
- **Package.json scripts**: Verify all `scripts` entries still work
- **Changelog consistency**: All three tiers current for last deploy?

---

## When to Run

- After deploying a new version
- After completing a major feature branch merge
- Weekly maintenance — catches drift even without new features
- Before creating a release or PR to main
- When "everything feels out of sync"

## Important Notes

- NEVER modify code logic — only documentation, descriptions, and static content
- ALWAYS create a sync branch — never commit directly to main
- If unsure whether a description is accurate, flag as `[NEEDS REVIEW]` rather than guessing
- Keep landing page copy marketing-friendly — technical accuracy matters but so does appeal
- Adapt to the project — skip sections for files/directories that don't exist
