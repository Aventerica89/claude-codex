#!/bin/bash
# Protect playground files from modification
# Blocks Edit, Write, and Bash operations on playground source files
# Also blocks attempts to alter the CLAUDE.md rules protecting the playground

INPUT=$(cat)

# Block any modification of playground source files
PPATH="ui/src/components/play"
PSUFFIX="ground/"
if echo "$INPUT" | grep -q "${PPATH}${PSUFFIX}"; then
  echo "BLOCKED: playground is READ-ONLY." >&2
  echo "The playground is the canonical UI/UX source of truth." >&2
  echo "Read from it, copy verbatim into live components. Never modify it." >&2
  exit 2
fi

# Block attempts to remove or relax the playground protection rule
if echo "$INPUT" | grep -qi "remove.*playground.*rule\|relax.*play.*rule\|lift.*play.*restrict\|alter.*play.*rule\|suggest.*alter.*play"; then
  echo "BLOCKED: Cannot suggest altering the playground protection rule." >&2
  echo "The rule is permanent. Do not propose changing it." >&2
  exit 2
fi

exit 0
