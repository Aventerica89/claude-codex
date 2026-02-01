---
description: Install claude-codex with auto-sync on a new machine
---

# Codex Install Command

Installs the full claude-codex system with auto-sync daemon. One command to set up a new machine.

## Behavior

1. **Check if already installed**:
   ```bash
   if [ -L ~/.claude ] && [ -d ~/claude-codex ]; then
     echo "Claude Codex already installed"
     exit 0
   fi
   ```

2. **Clone repository** (if not present):
   ```bash
   if [ ! -d ~/claude-codex ]; then
     git clone https://github.com/Aventerica89/claude-codex.git ~/claude-codex
   fi
   ```

3. **Run install script**:
   ```bash
   cd ~/claude-codex
   ./sync/install.sh
   ```

4. **Report results**:
   - Show what was installed
   - Confirm auto-sync is running
   - Show next steps

## Example Flow

```
User: /codex-install

Claude: Installing Claude Codex...

        Cloning repository to ~/claude-codex
        Running install script...

        [Install script output]

        Installation complete:
        - Repository: ~/claude-codex
        - Symlink: ~/.claude -> ~/claude-codex
        - Auto-sync: Running (commits every 30s, pushes every 5min)

        Verify with: git -C ~/.claude remote -v
        View logs: tail -f ~/.claude/sync.log
```

## Already Installed

```
User: /codex-install

Claude: Claude Codex is already installed.

        Location: ~/claude-codex
        Symlink: ~/.claude -> ~/claude-codex

        To reinstall, run:
          rm -rf ~/claude-codex ~/.claude
          /codex-install

        To just sync: /sync
```

## Error Handling

- **Git not installed**: "Git is required. Install with: brew install git"
- **No network**: "Cannot reach GitHub. Check your internet connection."
- **Permission denied**: "Cannot write to ~/claude-codex. Check permissions."
- **Existing ~/.claude (not symlink)**: Install script backs it up to ~/.claude.backup

## Implementation

Execute these bash commands in sequence:

```bash
# Check if already installed
if [ -L "$HOME/.claude" ] && [ -d "$HOME/claude-codex/.git" ]; then
  echo "Already installed"
  exit 0
fi

# Clone if needed
if [ ! -d "$HOME/claude-codex" ]; then
  git clone https://github.com/Aventerica89/claude-codex.git "$HOME/claude-codex"
fi

# Run installer
cd "$HOME/claude-codex" && ./sync/install.sh
```

## Use Cases

- Setting up a new development machine
- Fresh OS install
- New team member onboarding
- Restoring after cleanup

## Related Commands

- `/codex-fetch` - View remote config (read-only, works in browser)
- `/sync` - Bidirectional sync (after installation)
