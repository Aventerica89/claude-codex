---
description: Remind user what project they're working on and current status
---

# Remind Command

Quick context reminder for users with multiple windows/sessions.

## Arguments

Parse `$ARGUMENTS` for flags:
- `--on` - Enable auto-reminders (every 2nd pause by default)
- `--off` - Disable auto-reminders
- `--frequency <n>` or `-f <n>` - Set reminder frequency (every nth pause)
- `--full` - Include git status and modified files
- `--tasks` or `-t` - Include current task list
- No flags - Show manual reminder once

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
