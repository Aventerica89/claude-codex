---
description: Generate user-friendly changelogs from git commit history
---

# Changelog Generator

Generate polished, user-friendly changelogs from git commit history. Analyzes commits, categorizes changes, and rewrites technical language for your audience.

## CRITICAL: Respect Project-Specific Changelog Rules

**Before doing ANYTHING**, check for project-specific changelog instructions:

1. Read `CLAUDE.md` in the project root — look for changelog/version rules
2. Read `.claude/changelog-config.json` if it exists
3. Check for a `version.ts` or `version.js` with a `DEV_CHANGELOG` array

**If the project has its own changelog rules, follow those EXACTLY.** Do not use the generic format below. The project rules override this skill entirely.

Common project-specific patterns to detect:
- Two-file systems (e.g. `CHANGELOG-DEV.md` + `version.ts`) — update BOTH files
- Prepend-not-replace — add new entries above existing ones, never overwrite
- Required git hash in entry header — use `git rev-parse --short HEAD`
- Required version number from `package.json` or `version.ts`

**If no project-specific rules are found**, proceed with the generic format below.

## Arguments

Parse `$ARGUMENTS` for range and flags:
- `last-week` / `last-month` / `last-7-days` / `last-30-days` — time-based range
- `v1.0.0..v1.1.0` or `v1.0.0...v1.1.0` — version range
- `since-last-tag` or no args — commits since the most recent tag (default)
- `--all` — all commits (use with caution on large repos)
- `--dry-run` — preview without saving to file
- `--no-rewrite` — keep original commit messages, don't translate to user language
- `--with-hashes` — include short commit hashes

## Instructions

### 1. Load Configuration

Read `~/.claude/changelog-config.json` for category mappings, excluded prefixes, output style, and voice settings.

If the file doesn't exist, use sensible defaults:
- Categories: features, improvements, fixes, breaking, security, docs
- Exclude: chore, ci, test, wip, merge commits
- Style: customer-friendly, no icons, grouped by category
- Range: since last tag

### 2. Determine Commit Range

**If version range provided** (e.g. `v1.0.0..v1.1.0`):
```bash
git log v1.0.0..v1.1.0 --oneline --no-decorate --format="%H|%s|%an|%ai"
```

**If time-based range provided**:
```bash
# last-week
git log --since="1 week ago" --oneline --no-decorate --format="%H|%s|%an|%ai"
# last-month
git log --since="1 month ago" --oneline --no-decorate --format="%H|%s|%an|%ai"
# last-N-days
git log --since="N days ago" --oneline --no-decorate --format="%H|%s|%an|%ai"
```

**If since-last-tag or no args**:
```bash
# Get latest tag
LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null)
if [ -n "$LATEST_TAG" ]; then
  git log ${LATEST_TAG}..HEAD --oneline --no-decorate --format="%H|%s|%an|%ai"
else
  # No tags exist, use last 20 commits
  git log -20 --oneline --no-decorate --format="%H|%s|%an|%ai"
fi
```

**If --all**:
```bash
git log --oneline --no-decorate --format="%H|%s|%an|%ai"
```

### 3. Parse and Filter Commits

For each commit line (format: `hash|subject|author|date`):

1. **Skip excluded commits**: Check subject against `exclude_prefixes` and `exclude_patterns` from config
2. **Extract conventional commit type**: Parse `type: description` or `type(scope): description` format
3. **Handle non-conventional commits**: If no prefix match, attempt to classify by keywords:
   - "add", "new", "create", "implement" -> features
   - "fix", "resolve", "correct", "patch" -> fixes
   - "update", "improve", "enhance", "optimize" -> improvements
   - "remove", "delete", "deprecate" -> breaking (flag for review)
   - "secure", "vulnerability", "CVE" -> security
   - Unclassified -> improvements (default bucket)

### 4. Categorize into Groups

Group commits by category as defined in config. Each group contains:
- Category label (e.g. "New Features")
- List of commits with: original message, author, hash, date

### 5. Rewrite for Audience (unless --no-rewrite)

If `voice.rewrite_technical` is true in config, transform each commit message:

**Rules for rewriting:**
- Remove conventional commit prefix (`feat:`, `fix:`, etc.)
- Remove scope `(auth)`, `(ui)`, etc. — incorporate naturally if relevant
- Convert imperative developer language to user-facing benefit language
- Remove file paths, variable names, technical implementation details
- Start with a verb in past tense ("Added", "Fixed", "Improved") or describe the benefit
- Keep it to one clear sentence, max 120 characters
- If the commit is genuinely internal (refactoring, test changes), and it somehow passed the filter, skip it

**Examples:**
- `feat(auth): add OAuth2 PKCE flow for mobile clients` -> "Added secure sign-in support for mobile devices"
- `fix: resolve race condition in WebSocket reconnect` -> "Fixed an issue where real-time updates could temporarily disconnect"
- `perf: add Redis caching layer to /api/search` -> "Search results now load significantly faster"
- `fix(ui): correct z-index stacking on modal overlay` -> "Fixed a display issue where popups could appear behind other elements"

### 6. Format Output

Build the changelog markdown based on config output settings:

**Header:**
- If version range: `## v{version} - {date}`
- If time range: `## Updates - {range description}`
- If since-last-tag: `## {next-version or "Unreleased"} - {date}`

**Body** (for each non-empty category in order: breaking, security, features, improvements, fixes, docs):
```
### {category.label}

- {rewritten commit message}
- {rewritten commit message}
```

If `output.use_icons` is true, prepend category headers with the appropriate icon.
If `output.include_commit_hash` is true or `--with-hashes`, append `({short-hash})` to each line.
If `output.include_author` is true, append `- @{author}` to each line.

### 7. Present to User

Show the generated changelog in a code block for review.

If empty (all commits were filtered out):
- Report: "No user-facing changes found in this range. All commits were internal (tests, CI, refactoring)."
- Suggest: "Use --no-rewrite to see all commits, or check /changelog-settings to adjust filters."

### 8. Save Output (unless --dry-run)

**If save_to_file is set in config:**

**IMPORTANT: Always PREPEND new entries. Never overwrite or replace existing content.**

Check if the target file (e.g. `CHANGELOG.md`) exists:
- If it exists: Read existing content, prepend new changelog entry with a blank line separator, write back. Never remove existing entries.
- If it doesn't exist: Create it with the changelog content

### 9. Integration Points

**With /create-release:**
If the user runs `/create-release` after `/changelog`, suggest: "Would you like to include this changelog in the GitHub Release notes?"

**With /save-to-notion:**
The changelog content can be referenced in Notion session saves as part of the "what was accomplished" section.

## Error Handling

**Not a git repository:**
```
Error: Not in a git repository. Run this from a project with git history.
```

**No commits found in range:**
```
No commits found in the specified range.
Try: /changelog last-month
Or:  /changelog --all
```

**Invalid version range:**
```
Error: Could not find tag '{tag}'. Available tags:
{list last 5 tags}
```

## Tips

- Run `/changelog-settings` to customize categories, voice, and output format
- Use `--dry-run` to preview before writing to CHANGELOG.md
- Pair with `/create-release` for a complete release workflow
- The rewriter transforms technical commits — review the output before publishing
- For projects without conventional commits, the keyword classifier still works reasonably well
