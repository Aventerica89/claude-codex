#!/bin/bash
# ~/.claude/hooks/animation-perf-check.sh
# Require fixing-motion-performance skill before writing animation code

input=$(cat)

# Extract file path
file_path=$(echo "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', d)
    print(ti.get('file_path', ''))
except:
    pass
" 2>/dev/null)

# Only check TS/TSX/JS/JSX files
if ! echo "$file_path" | grep -qE '\.(ts|tsx|js|jsx)$'; then
    exit 0
fi

# Extract new content
new_content=$(echo "$input" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    ti = d.get('tool_input', d)
    print(ti.get('new_string', '') + '\n' + ti.get('content', ''))
except:
    pass
" 2>/dev/null)

# Detect animation patterns in new content
if ! echo "$new_content" | grep -qE "(from 'motion/react'|from \"motion/react\"|from 'framer-motion'|from \"framer-motion\"|motion\\.div|AnimatePresence|useMotionValue|useAnimation|layout=|initial=\{|animate=\{|transition=\{.*duration|@keyframes|will-change)"; then
    exit 0
fi

# Check sentinel: has the skill been applied recently (within 4 hours)?
SKILL_FLAG="$HOME/.claude/animation-skill-applied"
if [ -f "$SKILL_FLAG" ]; then
    file_age=$(( $(date +%s) - $(stat -f %m "$SKILL_FLAG" 2>/dev/null || stat -c %Y "$SKILL_FLAG" 2>/dev/null || echo 0) ))
    if [ "$file_age" -lt 14400 ]; then
        exit 0
    fi
fi

cat << 'MSG'
[animation-perf-check] Animation code detected.

REQUIRED: Fetch and apply the fixing-motion-performance skill before implementing.
  URL: https://github.com/ibelick/ui-skills/blob/main/skills/fixing-motion-performance/SKILL.md

Key rules:
  - Default to transform/opacity (compositor only, no layout trigger)
  - Scope transitions: transition-[border-color,color] NOT transition-all
  - Use FLIP (motion layout) for layout-like effects; prefer layout="size"/"position" over layout
  - Never animate layout properties continuously on large surfaces

After applying the skill, unlock with:
  touch ~/.claude/animation-skill-applied

If the skill is already applied in this session, run the touch command above and retry.
MSG

exit 2
