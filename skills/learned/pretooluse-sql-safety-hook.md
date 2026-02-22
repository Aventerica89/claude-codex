# PreToolUse SQL Safety Hook

**Extracted:** 2026-02-21
**Context:** Protecting databases from accidental destructive SQL via any CLI tool

## Problem

Deny patterns in `permissions` only match literal command strings.
`wrangler d1 execute --command "DROP TABLE users"` gets caught,
but the same SQL passed via a variable, piped script, or shell substitution is not.

## Solution

A PreToolUse hook on Bash that parses the full command from `$CLAUDE_TOOL_INPUT`,
uppercases it, and grep-matches against dangerous SQL patterns before execution.
Exit code `2` blocks the tool and surfaces the reason to Claude.

The hook lives at `~/.claude/scripts/sql-safety-check.sh` and is wired globally
in `~/.claude/settings.json` so it applies to every session and project.

## Example

```bash
# ~/.claude/scripts/sql-safety-check.sh
COMMAND=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('command', ''))
except:
    print('')
" 2>/dev/null)

UPPER_CMD=$(echo "$COMMAND" | tr '[:lower:]' '[:upper:]')

PATTERNS=("DROP TABLE" "DROP DATABASE" "TRUNCATE " "DELETE FROM " "ALTER TABLE.*DROP COLUMN")

for pattern in "${PATTERNS[@]}"; do
  if echo "$UPPER_CMD" | grep -qE "$pattern"; then
    echo "BLOCKED: Dangerous SQL pattern ('$pattern')" >&2
    exit 2
  fi
done
```

```json
// ~/.claude/settings.json — PreToolUse hooks
{
  "matcher": "Bash",
  "hooks": [{ "type": "command", "command": "~/.claude/scripts/sql-safety-check.sh" }]
}
```

## When to Use

Any project using Turso, Supabase, D1, SQLite, Postgres, or any DB CLI.
Add to global `~/.claude/settings.json` so it applies across all sessions.

## Limitation

Does not catch SQL inside `.sql` files being passed via `--file` flag.
For that, keep prod credentials out of local environment entirely.
