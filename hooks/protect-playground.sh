#!/bin/bash
# Protect playground files from modification
# This hook blocks Edit, Write, and Bash operations on playground source files

INPUT=$(cat)

# Check if the tool input references the playground directory
if echo "$INPUT" | grep -q "ui/src/components/playground/"; then
  echo "BLOCKED: ui/src/components/playground/ is READ-ONLY." >&2
  echo "The playground is the canonical UI/UX source of truth." >&2
  echo "Read from it, copy verbatim into live components. Never modify it." >&2
  exit 2
fi

exit 0
