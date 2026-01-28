---
description: Generate standup notes from recent git activity and session context. Perfect for daily standups or status updates.
---

# Standup Notes Generator

Generate a formatted standup summary from git history and current context.

## Usage

```
/standup              # Yesterday's work + today's plan
/standup --week       # Weekly summary
/standup --slack      # Slack-formatted output
```

## Arguments

Parse `$ARGUMENTS` for:
- `--week` or `-w` - Weekly summary instead of daily
- `--slack` or `-s` - Format for Slack (with emoji)
- `--markdown` or `-m` - Clean markdown output

---

## Workflow

### Step 1: Gather Git Activity

```bash
# Daily (default)
git log --since="yesterday" --author="$(git config user.name)" --oneline

# Weekly
git log --since="1 week ago" --author="$(git config user.name)" --oneline
```

Also check:
```bash
# Changed files
git diff --stat HEAD~5

# Current branch
git branch --show-current

# Uncommitted changes
git status --short
```

### Step 2: Analyze Changes

Group commits by:
- **Features**: `feat:` commits
- **Fixes**: `fix:` commits
- **Refactoring**: `refactor:` commits
- **Docs**: `docs:` commits
- **Other**: Everything else

### Step 3: Check Current Context

Read from:
- Recent conversation context
- `docs/PLAN.md` if exists (current phase)
- TaskList if available

### Step 4: Generate Output

**Default Format**:
```markdown
## Standup - {date}

### Yesterday
- Completed {feature/fix description}
- Fixed {bug description}
- Refactored {component}

### Today
- Working on {current task}
- Planning to {next task}

### Blockers
- {Any blockers, or "None"}
```

**Slack Format** (`--slack`):
```
*Standup - {date}*

:white_check_mark: *Yesterday*
• Completed {feature}
• Fixed {bug}

:dart: *Today*
• Working on {task}
• Planning {next task}

:warning: *Blockers*
• None
```

**Weekly Format** (`--week`):
```markdown
## Weekly Summary - {date range}

### Completed
- {Feature 1} - {brief description}
- {Feature 2} - {brief description}
- {X} bugs fixed

### In Progress
- {Current work}

### Metrics
- Commits: {count}
- Files changed: {count}
- Lines: +{added} / -{removed}

### Next Week
- {Planned work}
```

---

## Example Output

```
User: /standup

Claude:
## Standup - 2025-01-27

### Yesterday
- Added `/jbdocs` automation for documentation sync
- Updated `/new-project` with Phase 6.8 auto-sync
- Fixed `/end` command paths for jb-cloud-docs
- Tested docs sync on wp-manager project

### Today
- Adding new utility commands (fix-issue, standup, etc.)
- Updating command documentation
- Enhancing /new-project workflow

### Blockers
- None

---
*Generated from 4 commits across 6 files*
```

---

## Integration

This command works well with:
- `/end` - Include standup in session summary
- `/context-save` - Save standup with session state
- Slack/Discord webhooks for automated posting

---

## Notes

- Uses git author from `git config user.name`
- Respects timezone for "yesterday" calculation
- Can be customized for team-specific formats
- Works across multiple repositories if in monorepo
