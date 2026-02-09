#!/bin/bash
# Strategic Compact + Notion Auto-Save
# Fires on PreToolUse (Edit/Write) to track session progress
# and instruct Claude to save context to Notion at checkpoints.
#
# FIXED: Previous version used $$ (shell PID) for counter file,
# which created a new file per invocation and never incremented.
# Now uses a fixed path with staleness detection for auto-reset.
#
# Hook config (in ~/.claude/settings.json):
# {
#   "hooks": {
#     "PreToolUse": [{
#       "matcher": "Edit|Write",
#       "hooks": [{
#         "type": "command",
#         "command": "~/.claude/skills/strategic-compact/suggest-compact.sh"
#       }]
#     }]
#   }
# }

COUNTER_FILE="/tmp/claude-tool-count"
NOTION_SAVE_INTERVAL=${NOTION_SAVE_INTERVAL:-20}
COMPACT_SUGGEST_INTERVAL=${COMPACT_SUGGEST_INTERVAL:-40}
STALE_HOURS=2

# Auto-reset if counter file is older than STALE_HOURS (new session)
if [ -f "$COUNTER_FILE" ]; then
  file_age=$(( $(date +%s) - $(stat -f %m "$COUNTER_FILE" 2>/dev/null || stat -c %Y "$COUNTER_FILE" 2>/dev/null || echo 0) ))
  stale_seconds=$((STALE_HOURS * 3600))
  if [ "$file_age" -gt "$stale_seconds" ]; then
    rm -f "$COUNTER_FILE"
  fi
fi

# Initialize or increment counter
if [ -f "$COUNTER_FILE" ]; then
  count=$(cat "$COUNTER_FILE")
  count=$((count + 1))
else
  count=1
fi
echo "$count" > "$COUNTER_FILE"

# First Notion checkpoint — save early before context gets huge
if [ "$count" -eq "$NOTION_SAVE_INTERVAL" ]; then
  echo "[AutoSave] $count edits — SAVE TO NOTION NOW: Run /save-to-notion to checkpoint session context before it gets lost" >&2
fi

# Subsequent Notion checkpoints — every NOTION_SAVE_INTERVAL calls
if [ "$count" -gt "$NOTION_SAVE_INTERVAL" ] && [ $((count % NOTION_SAVE_INTERVAL)) -eq 0 ]; then
  echo "[AutoSave] $count edits — SAVE TO NOTION NOW: Run /save-to-notion to checkpoint session context" >&2
fi

# Compact suggestion — at higher threshold
if [ "$count" -eq "$COMPACT_SUGGEST_INTERVAL" ]; then
  echo "[StrategicCompact] $count edits — Run /save-to-notion THEN /compact to preserve context before it gets compacted away" >&2
fi

# Ongoing compact suggestions — every 15 after threshold
if [ "$count" -gt "$COMPACT_SUGGEST_INTERVAL" ] && [ $((count % 15)) -eq 0 ]; then
  echo "[StrategicCompact] $count edits — URGENT: Run /save-to-notion then /compact NOW to prevent context loss" >&2
fi
