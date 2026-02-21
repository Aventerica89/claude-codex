---
description: Remind user what project they're working on and current status
---

# Remind Command

Quick context reminder for users with multiple windows/sessions.

## Arguments

Parse `$ARGUMENTS` for flags:
- `today` - Show recent git commit history grouped by theme/session
- `--on` - Enable auto-reminders (every 2nd pause by default)
- `--off` - Disable auto-reminders
- `--frequency <n>` or `-f <n>` - Set reminder frequency (every nth pause)
- `--full` - Include git status and modified files
- `--tasks` or `-t` - Include current task list
- No flags - Show manual reminder once

## Today Mode (`/remind today`)

When `today` is passed as the argument:

1. Run `git log --oneline -20` in the current working directory
2. Group the commits into logical clusters by theme or time (e.g., "This session", "Yesterday", feature sprints)
3. Output a brief human-readable summary of each group with commit hashes

### Output Format

```
**Recent Work: {project-name}**

**{Group Label}** (e.g. "This session", "Security sprint", "Yesterday")
- `abc1234` — What was done
- `def5678` — What was done

**{Group Label}**
- `ghi9012` — What was done
```

### Grouping Strategy

- Group by date first (today's commits vs earlier)
- Within a date, group by theme if multiple related commits are clustered (e.g., several "fix: lint" commits = "Lint fixes sprint")
- Label groups descriptively: "This session", "Earlier today", "Yesterday", or a theme like "Security hardening" / "PWA assets"
- Show at most 20 commits total

---

## Auto-Remind Mode

### Enable Auto-Remind

When `--on` is passed:

1. Read current state from `~/.claude/remind-state.json` (create if missing)
2. Set `enabled: true`
3. Set frequency from `-f` flag or default to 2
4. Reset turn counter to 0
5. Confirm to user:

```
Auto-remind enabled (every 2 responses).
Use `/remind --off` to disable.
```

### Disable Auto-Remind

When `--off` is passed:

1. Set `enabled: false` in state file
2. Confirm: `Auto-remind disabled.`

### State File Format

```json
// ~/.claude/remind-state.json
{
  "enabled": true,
  "frequency": 2,
  "turnCount": 0
}
```

**Important**: After enabling/disabling, Claude should follow the rules in `~/.claude/rules/auto-remind.md` to actually show reminders.

---

## Manual Reminder Behavior

When invoked without `--on`/`--off`, immediately output:

```
**Current Project: {project-name}**
- Path: {working-directory}
- Description: {from CLAUDE.md if available}
- Current Task: {what we're working on}
- Waiting On: {any blockers or pending actions}
```

### How to Determine Context

1. **Project Name**: Get from working directory name or CLAUDE.md
2. **Description**: Read from project's CLAUDE.md `## Project Overview` or description field
3. **Current Task**: Check recent conversation context or TaskList
4. **Waiting On**: Any pending user actions, external processes, or blockers

### With `--full` Flag

Add after the standard output:

```
**Recent Changes:**
- [git status summary]
- [modified files list]
```

### With `--tasks` Flag

Add after the standard output:

```
**Task List:**
- [ ] Task 1 (pending)
- [~] Task 2 (in progress)
- [x] Task 3 (completed)
```

---

## Example Outputs

### Today Mode

```
/remind today

**Recent Work: WP Dispatch**

**This session**
- `f66f407` — HIG PWA overhaul — CSS master control system + full compliance
- `6e1e928` — Fix Next.js 16 proxy export bug
- `88b4e66` / `ecad2f2` — PWA icons regenerated, splash screens fixed

**CI lint fixes**
- `cb7b737` / `03dcbf8` / `90fdd57` / `59631ea` — ESLint errors from GitHub Actions

**Automation**
- `41a0de1` — GitHub Actions CI + Claude Code hooks

**Security hardening**
- `824da48` — Rate limit waitlist, clean up dead env var
- `b0cbb32` — Enforce auth, remove secret from JS bundle, CSP + HSTS
- `4b02669` — Require AUTH_SECRET separate from ENCRYPTION_SECRET
- `4338ade` — Remove RCE vectors from WP-CLI allowlist
```

### Manual Remind

```
/remind

**Current Project: jb-cloud-app-tracker**
- Path: /Users/jb/jb-cloud-app-tracker
- Description: Track cloud apps across multiple providers
- Current Task: Implementing Vercel API integration
- Waiting On: Database migration (run `supabase db push`)
```

### Enable Auto-Remind

```
/remind --on

Auto-remind enabled (every 2 responses).
I'll show a brief context reminder when pausing for your input.
Use `/remind --off` to disable.
```

### Custom Frequency

```
/remind --on -f 3

Auto-remind enabled (every 3 responses).
Use `/remind --off` to disable.
```

### Disable

```
/remind --off

Auto-remind disabled.
```

---

## Usage Tips

- Use `--on` when juggling multiple projects/windows
- Use `-f 1` for very frequent reminders (every response)
- Use `-f 5` for occasional reminders
- Manual `/remind` always works regardless of auto state
