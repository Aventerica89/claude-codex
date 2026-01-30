#!/bin/bash

set -e

echo "🚀 Installing Claude Codex Auto-Sync System"
echo "============================================"
echo

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f ".claude-plugin/plugin.json" ]; then
  echo -e "${RED}Error: Must run from claude-codex repository root${NC}"
  echo "cd ~/claude-codex && ./sync/install.sh"
  exit 1
fi

CODEX_DIR="$(pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "📍 Codex directory: $CODEX_DIR"
echo "📍 Claude directory: $CLAUDE_DIR"
echo

# Step 1: Backup existing ~/.claude if it's not a symlink
if [ -d "$CLAUDE_DIR" ] && [ ! -L "$CLAUDE_DIR" ]; then
  echo -e "${YELLOW}⚠️  Backing up existing ~/.claude to ~/.claude.backup${NC}"
  mv "$CLAUDE_DIR" "$CLAUDE_DIR.backup"
  echo -e "${GREEN}✅ Backup created${NC}"
  echo
fi

# Step 2: Create symlink
if [ ! -L "$CLAUDE_DIR" ]; then
  echo "🔗 Creating symlink: ~/.claude -> $CODEX_DIR"
  ln -sf "$CODEX_DIR" "$CLAUDE_DIR"
  echo -e "${GREEN}✅ Symlink created${NC}"
else
  echo -e "${GREEN}✅ Symlink already exists${NC}"
fi
echo

# Step 3: Initialize git if not already a repo
cd "$CODEX_DIR"
if [ ! -d ".git" ]; then
  echo "📦 Initializing git repository"
  git init
  git remote add origin https://github.com/Aventerica89/claude-codex.git
  git add .
  git commit -m "chore: initialize claude-codex"
  echo -e "${GREEN}✅ Git initialized${NC}"
else
  echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi
echo

# Step 4: Install daemon dependencies
echo "📦 Installing daemon dependencies"
cd "$CODEX_DIR/sync/daemon"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo

# Step 5: Install LaunchAgent (macOS) or systemd service (Linux)
echo "🔧 Installing auto-sync service"

if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS - LaunchAgent
  node watcher.js install
  echo -e "${GREEN}✅ LaunchAgent installed${NC}"
  echo "   Service will start automatically on login"
  echo "   Logs: ~/.claude/sync.log"

elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux - systemd
  SERVICE_FILE="$HOME/.config/systemd/user/claude-codex-sync.service"
  mkdir -p "$HOME/.config/systemd/user"

  cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=Claude Codex Auto-Sync Daemon
After=network.target

[Service]
Type=simple
ExecStart=$(which node) $CODEX_DIR/sync/daemon/watcher.js
Restart=always
RestartSec=10
StandardOutput=append:$HOME/.claude/sync.log
StandardError=append:$HOME/.claude/sync.error.log

[Install]
WantedBy=default.target
EOF

  systemctl --user daemon-reload
  systemctl --user enable claude-codex-sync.service
  systemctl --user start claude-codex-sync.service

  echo -e "${GREEN}✅ systemd service installed and started${NC}"
  echo "   Check status: systemctl --user status claude-codex-sync"
  echo "   View logs: journalctl --user -u claude-codex-sync -f"
else
  echo -e "${YELLOW}⚠️  Unsupported OS: $OSTYPE${NC}"
  echo "   Manual setup required"
fi
echo

# Step 6: Test sync
echo "🧪 Testing sync functionality"
cd "$CLAUDE_DIR"
SYNC_STATUS=$(node "$CODEX_DIR/sync/daemon/watcher.js" status)
echo "$SYNC_STATUS"
echo -e "${GREEN}✅ Sync daemon is working${NC}"
echo

# Summary
echo "============================================"
echo -e "${GREEN}✨ Claude Codex Auto-Sync Installation Complete!${NC}"
echo
echo "What happens now:"
echo "  • Changes in ~/.claude/ will auto-commit after 30 seconds"
echo "  • Commits will auto-push to GitHub every 5 minutes"
echo "  • Other machines will auto-pull updates every hour"
echo
echo "Commands:"
echo "  • Check status: cd ~/.claude/sync/daemon && npm run status"
echo "  • View logs: tail -f ~/.claude/sync.log"
echo "  • Stop service: npm run uninstall-service"
echo
echo "Next steps:"
echo "  1. Verify: git -C ~/.claude remote -v"
echo "  2. Test: echo '# test' >> ~/.claude/test.md"
echo "  3. Watch: tail -f ~/.claude/sync.log"
echo
echo "Happy coding! 🚀"
