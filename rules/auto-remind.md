# Auto-Remind Rule

## Overview

When auto-remind is enabled, Claude should periodically show a brief context reminder to help users track what they're working on.

## Check State

At the START of processing each user message, check if auto-remind is enabled:

```bash
cat ~/.claude/remind-state.json 2>/dev/null
```

If file exists and `enabled: true`, track turns and show reminders.

## When to Show Reminder

Show a reminder when ALL of these are true:

1. **Auto-remind is enabled** (`enabled: true` in state file)
2. **Turn count reached** (turnCount >= frequency)
3. **Response is complete** (not mid-tool-execution)
4. **No pending choices** (not waiting on AskUserQuestion response)
5. **Pausing for input** (Claude is done and waiting for user)

## When to SKIP Reminder

Do NOT show reminder if ANY of these are true:

- AskUserQuestion was just used (user has choices to make)
- User is in the middle of answering a multi-part question
- Just showed a reminder in the previous response
- Task is actively in progress and needs immediate continuation
- Response is an error message or warning
- User explicitly asked a yes/no question requiring immediate answer

## Turn Counting Logic

1. After each complete response where Claude pauses for user input:
   - Increment `turnCount` in state file
2. When `turnCount >= frequency`:
   - Show reminder
   - Reset `turnCount` to 0
3. If reminder is skipped (due to skip conditions):
   - Do NOT increment counter (wait for next valid opportunity)

## Reminder Format (Compact)

When showing auto-reminder, use this compact format at the END of your response:

```
---
**Context:** {project-name} | {one-line-description}
**Working on:** {current-task-summary}
```

Keep it to 2-3 lines max. Don't repeat full path or details unless relevant.

## Example Flow

```
Turn 1: User asks to create a component
        Claude creates component, responds
        turnCount: 0 -> 1
        No reminder (count < 2)

Turn 2: User asks to add tests
        Claude adds tests, responds
        turnCount: 1 -> 2
        Show reminder (count >= 2)
        Reset turnCount: 2 -> 0

Turn 3: User asks question
        Claude uses AskUserQuestion
        SKIP increment (user has pending choices)

Turn 4: User answers question
        Claude continues work
        turnCount: 0 -> 1
        No reminder
```

## State File Management

The `/remind` command manages the state file:

```json
{
  "enabled": true,
  "frequency": 2,
  "turnCount": 0
}
```

Claude should:
- READ state at start of each message
- UPDATE turnCount after complete responses
- NEVER modify `enabled` or `frequency` (only `/remind` command does that)

## Implementation Notes

- State file: `~/.claude/remind-state.json`
- Default frequency: 2 (every other response)
- Reminder appears at END of response, before any question to user
- Use `---` separator to visually distinguish reminder
- Keep reminder brief - full details available via `/remind --full`
