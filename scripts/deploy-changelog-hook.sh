#!/bin/bash
# deploy-changelog-hook.sh
# Fires after every deploy command via PostToolUse hook in ~/.claude/settings.json.
# Bumps patch version in package.json, writes Tier 2 (CHANGELOG-DEV.md) and Tier 3 (changelog-action.json) entries.
#
# Usage: deploy-changelog-hook.sh "<bash command that was run>"
# Called automatically by Claude Code PostToolUse hook.

COMMAND="${1:-}"
DRY_RUN="${DRY_RUN:-0}"

# Only fire on deploy patterns
if ! echo "$COMMAND" | grep -qE '(wrangler deploy|vercel( deploy)?|npm run deploy|npx wrangler deploy)'; then
  exit 0
fi

# Find package.json by walking up from current directory
PKG_FILE=""
DIR="$(pwd)"
while [ "$DIR" != "/" ]; do
  if [ -f "$DIR/package.json" ]; then
    PKG_FILE="$DIR/package.json"
    break
  fi
  DIR="$(dirname "$DIR")"
done

if [ -z "$PKG_FILE" ]; then
  echo "[changelog-hook] No package.json found, skipping"
  exit 0
fi

PROJECT_DIR="$(dirname "$PKG_FILE")"

# Read current version
CURRENT_VERSION=$(node -e "try{console.log(require('$PKG_FILE').version)}catch(e){}" 2>/dev/null)
if [ -z "$CURRENT_VERSION" ]; then
  echo "[changelog-hook] No version field in package.json, skipping"
  exit 0
fi

# Bump patch: 0.26.0 -> 0.26.1
NEW_VERSION=$(echo "$CURRENT_VERSION" | awk -F. '{print $1"."$2"."($3+1)}')

if [ "$DRY_RUN" = "1" ]; then
  echo "[changelog-hook] DRY RUN: would bump $CURRENT_VERSION -> $NEW_VERSION"
  echo "[changelog-hook] DRY RUN: project dir: $PROJECT_DIR"
  echo "[changelog-hook] DRY RUN: detected deploy command: $COMMAND"
  exit 0
fi

# Bump version in package.json
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('$PKG_FILE', 'utf8'));
  pkg.version = '$NEW_VERSION';
  fs.writeFileSync('$PKG_FILE', JSON.stringify(pkg, null, 2) + '\n');
" 2>/dev/null

# Get git info
HASH=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null | awk '{print $1}')
HASH="${HASH:-unknown}"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE=$(date -u +"%Y-%m-%d")
TIME=$(date -u +"%H:%M")

# Tier 3: append one NDJSON line to changelog-action.json
ACTION_FILE="$PROJECT_DIR/changelog-action.json"
MSG=$(git -C "$PROJECT_DIR" log --oneline -1 2>/dev/null | cut -c9- | cut -c1-60)
MSG="${MSG:-deploy}"
echo "{ \"v\": \"$NEW_VERSION\", \"ts\": \"$TS\", \"msg\": \"$MSG\", \"hash\": \"$HASH\" }" >> "$ACTION_FILE"

# Tier 2: build commit lines from recent git log
COMMIT_LINES=""
while IFS= read -r line; do
  MSG_SHORT=$(echo "$line" | cut -c9-)
  TYPE="CHORE   "
  if echo "$MSG_SHORT" | grep -qi "^feat"; then TYPE="FEAT    "; fi
  if echo "$MSG_SHORT" | grep -qi "^fix";  then TYPE="FIX     "; fi
  if echo "$MSG_SHORT" | grep -qi "^refactor"; then TYPE="REFACTOR"; fi
  if echo "$MSG_SHORT" | grep -qi "^perf"; then TYPE="PERF    "; fi
  if echo "$MSG_SHORT" | grep -qi "^security"; then TYPE="SECURITY"; fi
  DESC=$(echo "$MSG_SHORT" | sed 's/^[a-zA-Z]*([^)]*): *//' | sed 's/^[a-zA-Z]*: *//')
  SCOPE=$(echo "$MSG_SHORT" | grep -o '([^)]*)' | tr -d '()' | head -1)
  if [ -z "$SCOPE" ]; then
    SCOPE=$(echo "$MSG_SHORT" | sed 's/^[a-zA-Z]*: *//' | awk '{print $1}' | tr '[:upper:]' '[:lower:]' | tr -d ',.' | cut -c1-15)
  fi
  COMMIT_LINES="${COMMIT_LINES}${TYPE}${SCOPE} — ${DESC}
"
done < <(git -C "$PROJECT_DIR" log --oneline -3 2>/dev/null)

# Tier 2: append block to CHANGELOG-DEV.md
DEV_FILE="$PROJECT_DIR/CHANGELOG-DEV.md"
{
  printf "\n### %s %s · %s · v%s\n" "$DATE" "$TIME" "$HASH" "$NEW_VERSION"
  printf "%s" "$COMMIT_LINES"
} >> "$DEV_FILE"

echo "[changelog-hook] v$CURRENT_VERSION → v$NEW_VERSION · Tier 2+3 updated ($PROJECT_DIR)"
