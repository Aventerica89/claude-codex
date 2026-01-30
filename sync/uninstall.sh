#!/bin/bash

set -e

echo "🗑️  Uninstalling Claude Codex Auto-Sync System"
echo "============================================"
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

CODEX_DIR="$(pwd)"
CLAUDE_DIR="$HOME/.claude"

# Step 1: Stop and remove service
echo "⏹️  Stopping auto-sync service"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS - LaunchAgent
  cd "$CODEX_DIR/sync/daemon" 2>/dev/null || cd "$CLAUDE_DIR/sync/daemon" 2>/dev/null || true
  if [ -f "watcher.js" ]; then
    node watcher.js uninstall || true
  fi

  PLIST="$HOME/Library/LaunchAgents/com.claude-codex.sync.plist"
  if [ -f "$PLIST" ]; then
    launchctl unload "$PLIST" 2>/dev/null || true
    rm "$PLIST"
  fi
  echo -e "${GREEN}✅ LaunchAgent removed${NC}"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux - systemd
  systemctl --user stop claude-codex-sync.service 2>/dev/null || true
  systemctl --user disable claude-codex-sync.service 2>/dev/null || true
  rm -f "$HOME/.config/systemd/user/claude-codex-sync.service"
  systemctl --user daemon-reload
  echo -e "${GREEN}✅ systemd service removed${NC}"
fi
echo

# Step 2: Remove symlink
if [ -L "$CLAUDE_DIR" ]; then
  echo "🔗 Removing symlink: $CLAUDE_DIR"
  rm "$CLAUDE_DIR"
  echo -e "${GREEN}✅ Symlink removed${NC}"
fi
echo

# Step 3: Restore backup if it exists
if [ -d "$CLAUDE_DIR.backup" ]; then
  echo -e "${YELLOW}⚠️  Found backup at ~/.claude.backup${NC}"
  read -p "Restore backup? [y/N] " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    mv "$CLAUDE_DIR.backup" "$CLAUDE_DIR"
    echo -e "${GREEN}✅ Backup restored${NC}"
  else
    echo "Backup left at ~/.claude.backup"
  fi
fi
echo

# Step 4: Clean up logs
echo "🧹 Cleaning up logs"
rm -f "$HOME/.claude/sync.log" "$HOME/.claude/sync.error.log"
echo -e "${GREEN}✅ Logs removed${NC}"
echo

# Summary
echo "============================================"
echo -e "${GREEN}✨ Claude Codex Auto-Sync Uninstalled${NC}"
echo
echo "What was removed:"
echo "  • Auto-sync background service"
echo "  • Symlink from ~/.claude to claude-codex"
echo "  • Sync logs"
echo
echo "What remains:"
echo "  • claude-codex repository (at $CODEX_DIR)"
echo "  • Your backup (if not restored): ~/.claude.backup"
echo
echo "To completely remove:"
echo "  rm -rf $CODEX_DIR"
echo "  rm -rf ~/.claude.backup"
echo
