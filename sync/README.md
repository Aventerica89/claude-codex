# Claude Codex Auto-Sync System

Automatic synchronization of your Claude Code configuration across all machines.

## Overview

The auto-sync system watches your `~/.claude/` directory for changes and automatically:
1. Commits changes after 30 seconds of inactivity
2. Pushes to GitHub every 5 minutes (batched)
3. Generates smart commit messages based on what changed

Other machines configured with Claude Codex will automatically pull updates.

## Architecture

```
~/.claude/ (symlinked to ~/claude-codex/)
    ↓
File Watcher (chokidar)
    ↓
Debounced Commits (30s)
    ↓
Batched Pushes (5min)
    ↓
GitHub Repository
    ↓
Other Machines (hourly pull)
```

## Installation

### Quick Install

```bash
cd ~/claude-codex
./sync/install.sh
```

This will:
- Create symlink from `~/.claude/` to `~/claude-codex/`
- Install daemon dependencies (chokidar, simple-git)
- Set up LaunchAgent (macOS) or systemd service (Linux)
- Start the auto-sync service

### Manual Install

```bash
# 1. Install dependencies
cd ~/claude-codex/sync/daemon
npm install

# 2. Start watcher manually (for testing)
node watcher.js

# 3. Install as service
node watcher.js install
```

## Usage

### Check Status

```bash
cd ~/claude-codex/sync/daemon
npm run status
```

Output:
```
[Sync] Status:
  Last commit: 2026-01-29T20:45:00.000Z
  Last push: 2026-01-29T20:50:00.000Z
  Pending push: no
```

### View Logs

```bash
# Real-time logs
tail -f ~/.claude/sync.log

# Error logs
tail -f ~/.claude/sync.error.log
```

### Manual Sync

If you need to force a sync immediately:

```bash
cd ~/.claude
git add -A
git commit -m "sync: manual update"
git push
```

## Configuration

### Timing Settings

Edit `sync/daemon/watcher.js` to change:

```javascript
const DEBOUNCE_MS = 30000      // 30 seconds - wait time after last change
const PUSH_INTERVAL_MS = 300000 // 5 minutes - how often to push
```

### Ignored Files

The watcher automatically ignores:
- `.git/` directory
- `node_modules/`
- `cache/`
- `debug/`
- `history.jsonl`
- Dotfiles (`.something`)

To add more, edit the `ignored` array in `watcher.js`.

## How It Works

### 1. File Detection

```javascript
// Watches ~/.claude/ for:
- add: New files created
- change: Existing files modified
- unlink: Files deleted
```

### 2. Debouncing

Changes are buffered and committed after 30 seconds of no activity. This prevents:
- Committing while you're still typing
- Creating too many tiny commits
- Spamming git history

### 3. Smart Commit Messages

The daemon analyzes which files changed and generates descriptive messages:

```
sync: update 2 command(s), 1 skill(s)

- commands/new-feature.md
- commands/another-command.md
- skills/learned/new-pattern.md
```

### 4. Batched Pushes

Commits are pushed every 5 minutes to avoid:
- Too many GitHub API calls
- Excessive network usage
- Race conditions with other machines

### 5. Conflict Resolution

Before pushing, the daemon:
1. Pulls with `--rebase` to get latest changes
2. Attempts to merge automatically
3. If conflicts occur, logs error and retries later

## Troubleshooting

### Service Not Running

**macOS:**
```bash
# Check status
launchctl list | grep claude-codex

# Restart
launchctl unload ~/Library/LaunchAgents/com.claude-codex.sync.plist
launchctl load ~/Library/LaunchAgents/com.claude-codex.sync.plist
```

**Linux:**
```bash
# Check status
systemctl --user status claude-codex-sync

# Restart
systemctl --user restart claude-codex-sync

# View logs
journalctl --user -u claude-codex-sync -f
```

### Changes Not Syncing

1. Check logs: `tail -f ~/.claude/sync.log`
2. Check git status: `git -C ~/.claude status`
3. Try manual push: `git -C ~/.claude push`

### Sync Conflicts

If you get conflicts:

```bash
cd ~/.claude

# See what's conflicted
git status

# Option 1: Accept remote changes (loses local)
git fetch origin
git reset --hard origin/main

# Option 2: Accept local changes (loses remote)
git push --force

# Option 3: Manual resolution
git mergetool
```

### Too Many Commits

If commit history gets too noisy, squash recent commits:

```bash
cd ~/.claude

# Squash last 10 commits
git rebase -i HEAD~10

# Mark commits to squash, save, push
git push --force
```

## Uninstallation

```bash
cd ~/claude-codex
./sync/uninstall.sh
```

This will:
- Stop the auto-sync service
- Remove LaunchAgent/systemd service
- Remove symlink
- Optionally restore backup

## Advanced Usage

### Custom Sync Script

Create `~/.claude/hooks/on-sync.sh` to run custom logic:

```bash
#!/bin/bash
# Run after each sync

echo "Synced at $(date)" >> ~/sync-history.log
```

### Sync to Multiple Remotes

```bash
cd ~/.claude

# Add second remote
git remote add backup git@github.com:username/claude-codex-backup.git

# Push to both
git remote set-url --add --push origin git@github.com:username/claude-codex.git
git remote set-url --add --push origin git@github.com:username/claude-codex-backup.git
```

### Sync Notifications

Add desktop notifications when sync completes:

**macOS:**
```javascript
// In watcher.js, after pushToRemote()
execSync(`osascript -e 'display notification "Claude Codex synced" with title "Auto-Sync"'`)
```

**Linux:**
```javascript
execSync(`notify-send "Claude Codex" "Auto-sync complete"`)
```

## Performance

**Resource Usage:**
- Memory: ~20MB
- CPU: <1% idle, ~5% during sync
- Disk: Minimal (only diffs)
- Network: ~1-10KB per sync (depending on changes)

**Battery Impact:**
- Negligible on modern machines
- File watcher uses native OS APIs (efficient)
- Only wakes up when files change

## Security

**What's Safe:**
- All sync happens over SSH/HTTPS
- No secrets are committed (`.gitignore` prevents this)
- Pre-push hook scans for API keys

**What to Watch:**
- Don't commit `settings.local.json` (has permissions)
- Don't commit `.env` files
- Review commits before force-pushing

## FAQ

**Q: Will this work if I edit files directly on GitHub?**
A: Yes! Local daemon will pull changes on next interval.

**Q: Can I temporarily pause syncing?**
A: Yes, unload the service temporarily:
```bash
# macOS
launchctl unload ~/Library/LaunchAgents/com.claude-codex.sync.plist

# Linux
systemctl --user stop claude-codex-sync
```

**Q: Does this work on Windows?**
A: Not yet. The daemon is designed for macOS/Linux. You can run the watcher manually in WSL.

**Q: Can I sync to a private repo?**
A: Yes! Just ensure your SSH keys are set up correctly.

## Contributing

Found a bug or have an improvement? Submit an issue or PR to:
https://github.com/Aventerica89/claude-codex

## License

MIT - See LICENSE file
