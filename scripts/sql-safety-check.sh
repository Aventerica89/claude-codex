#!/bin/bash
# PreToolUse hook: blocks dangerous SQL patterns in any Bash command
# Catches inline SQL regardless of which CLI tool passes it

COMMAND=$(echo "$CLAUDE_TOOL_INPUT" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('command', ''))
except:
    print('')
" 2>/dev/null)

if [ -z "$COMMAND" ]; then
  exit 0
fi

PATTERNS=(
  "DROP TABLE"
  "DROP DATABASE"
  "DROP SCHEMA"
  "TRUNCATE TABLE"
  "TRUNCATE "
  "DELETE FROM [a-zA-Z]"
  "ALTER TABLE.*DROP COLUMN"
)

UPPER_CMD=$(echo "$COMMAND" | tr '[:lower:]' '[:upper:]')

for pattern in "${PATTERNS[@]}"; do
  if echo "$UPPER_CMD" | grep -qE "$pattern"; then
    echo "BLOCKED: Dangerous SQL pattern detected ('$pattern')" >&2
    echo "Command was: $COMMAND" >&2
    echo "Run manually if intentional." >&2
    exit 2
  fi
done

exit 0
