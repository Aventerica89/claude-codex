# Claude Codex - Full Auto-Sync System Implementation Plan

## System Overview

**Claude Codex** is a universal Claude Code configuration system that:
- Syncs automatically across all machines
- Works in Claude Code CLI, Claude.ai web, and any local repository
- Uses GitHub as the master source of truth
- Provides bidirectional sync (local ↔ GitHub ↔ web)
- Distributes as an installable plugin

## Architecture

### Three-Tier System

```
┌─────────────────────────────────────────────────────────┐
│                    Tier 1: GitHub                       │
│              (Master Source of Truth)                   │
│         github.com/username/claude-codex                │
└─────────────────────────────────────────────────────────┘
                          ▲  ▼
          ┌───────────────┴──┴────────────────┐
          │                                   │
          ▼                                   ▼
┌──────────────────────┐          ┌────────────────────────┐
│  Tier 2: Local CLI   │          │   Tier 3: Web Sync     │
│   (Auto-Sync Daemon) │          │  (Browser Extension)   │
│   ~/.claude/         │          │   Claude.ai Projects   │
└──────────────────────┘          └────────────────────────┘
```

### Sync Flow

**Local → GitHub (Automatic):**
1. File watcher detects changes in `~/.claude/`
2. Auto-commits with descriptive message
3. Pushes to GitHub every 5 minutes
4. Other machines pull every hour

**GitHub → Web (One-Click):**
1. Browser extension fetches latest from GitHub
2. User clicks "Sync Codex" button
3. Auto-injects into Claude.ai Project custom instructions

**Web → GitHub (Semi-Automatic):**
1. User copies new pattern from Claude.ai
2. Clicks "Add to Codex" bookmarklet
3. Prompts for: name, category, description
4. Creates PR to GitHub via API
5. Auto-merges after validation

## File Structure

```
~/claude-codex/                          # Git repo root
├── .git/
├── .github/
│   └── workflows/
│       ├── validate.yml                 # CI: Lint, validate structure
│       └── sync-notify.yml              # Notify on successful sync
│
├── .claude-plugin/
│   └── plugin.json                      # Plugin manifest
│
├── sync/                                # Auto-sync system
│   ├── daemon/
│   │   ├── watcher.js                   # File watcher
│   │   ├── sync.js                      # Git sync logic
│   │   └── config.json                  # Sync settings
│   ├── install.sh                       # Setup script
│   ├── uninstall.sh                     # Cleanup script
│   └── README.md                        # Sync documentation
│
├── browser-extension/                   # Web sync
│   ├── manifest.json                    # Chrome extension manifest
│   ├── background.js                    # Fetch from GitHub
│   ├── content.js                       # Inject into Claude.ai
│   ├── popup.html                       # Extension UI
│   ├── popup.js                         # Popup logic
│   └── icons/
│
├── bookmarklet/                         # Fallback web sync
│   ├── sync-from-github.js              # Fetch latest config
│   ├── add-to-codex.js                  # Create new pattern
│   └── README.md                        # Bookmarklet docs
│
├── CLAUDE.md                            # Main config
├── commands/                            # Custom commands
├── agents/                              # Agent definitions
├── skills/                              # Skills & patterns
├── rules/                               # Modular rules
├── hooks/                               # Git & Claude hooks
│   ├── hooks.json                       # Claude Code hooks
│   └── git/                             # Git hooks
│       ├── post-commit                  # Auto-push hook
│       └── pre-push                     # Validation hook
│
└── README.md                            # Main documentation
```

## Implementation Phases

### Phase 1: Repository Setup (30 minutes)

**Tasks:**
1. ✅ Rename current repo: `claude-config` → `claude-codex` (DONE)
2. ✅ Update all references in CLAUDE.md
3. ✅ Create `.claude-plugin/plugin.json` manifest
4. ✅ Add GitHub workflow for validation
5. ✅ Update README with installation instructions

**Deliverables:**
- ✅ Plugin-ready repository
- ✅ CI/CD for validation
- ✅ Clear documentation

### Phase 2: Local Auto-Sync (2 hours)

**Tasks:**
1. Create file watcher daemon (`sync/daemon/watcher.js`)
2. Implement git auto-commit logic (`sync/daemon/sync.js`)
3. Create installation script (`sync/install.sh`)
4. Add LaunchDaemon/systemd service for background running
5. Test across multiple machines

**Watcher Logic:**
```javascript
// sync/daemon/watcher.js
const chokidar = require('chokidar')
const { execSync } = require('child_process')

const watcher = chokidar.watch('~/.claude/', {
  ignored: /(^|[\/\\])\../, // Ignore dotfiles
  persistent: true
})

let changeBuffer = []
let commitTimer = null

watcher.on('change', (path) => {
  changeBuffer.push(path)

  // Debounce: commit after 30 seconds of no changes
  clearTimeout(commitTimer)
  commitTimer = setTimeout(() => {
    commitChanges(changeBuffer)
    changeBuffer = []
  }, 30000)
})

function commitChanges(files) {
  const message = generateCommitMessage(files)
  execSync(`git add ${files.join(' ')}`)
  execSync(`git commit -m "${message}"`)

  // Push every 5 minutes (batched)
  schedulePush()
}
```

**Git Hooks:**
```bash
# hooks/git/post-commit
#!/bin/bash
# Auto-push after commit (batched every 5 minutes)
touch ~/.claude/.pending-push
```

**Deliverables:**
- ✅ Background daemon watching `~/.claude/`
- ✅ Auto-commit on file changes
- ✅ Batched push every 5 minutes
- ✅ LaunchDaemon/systemd service

### Phase 3: Browser Extension (4 hours)

**Tasks:**
1. Create Chrome extension structure
2. Implement GitHub API fetch
3. Build Claude.ai content injection
4. Add "Sync Codex" button to Projects page
5. Handle authentication & rate limits
6. Test in Chrome & Safari

**Extension Manifest:**
```json
{
  "manifest_version": 3,
  "name": "Claude Codex Sync",
  "version": "1.0.0",
  "description": "Sync Claude Codex configuration to Claude.ai Projects",
  "permissions": [
    "storage",
    "https://raw.githubusercontent.com/*",
    "https://claude.ai/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://claude.ai/*"],
      "js": ["content.js"]
    }
  ],
  "action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon128.png"
  }
}
```

**Content Injection:**
```javascript
// browser-extension/content.js
async function injectCodex() {
  // Fetch latest from GitHub
  const config = await fetchFromGitHub()

  // Find custom instructions textarea
  const textarea = document.querySelector('[data-test="custom-instructions"]')

  // Inject with user confirmation
  if (confirm(`Sync Claude Codex v${config.version}?`)) {
    textarea.value = config.content
    textarea.dispatchEvent(new Event('input', { bubbles: true }))

    // Show success badge
    showBadge('Codex Synced!')
  }
}

// Add sync button to Project settings
function addSyncButton() {
  const button = document.createElement('button')
  button.textContent = '🔄 Sync Codex'
  button.onclick = injectCodex

  const settingsPanel = document.querySelector('.project-settings')
  settingsPanel.prepend(button)
}

// Run on page load
if (window.location.pathname.includes('/project/')) {
  addSyncButton()
}
```

**Deliverables:**
- ✅ Chrome extension published (or unpacked)
- ✅ One-click sync to Claude.ai Projects
- ✅ Version tracking
- ✅ Safari version (if needed)

### Phase 4: Bookmarklet Fallback (1 hour)

**Tasks:**
1. Create bookmarklet for quick clipboard sync
2. Build "Add to Codex" bookmarklet
3. Test in all browsers

**Bookmarklet Code:**
```javascript
// bookmarklet/sync-from-github.js (minified)
javascript:(async()=>{
  const url='https://raw.githubusercontent.com/username/claude-codex/main/CLAUDE.md';
  const r=await fetch(url);
  const text=await r.text();
  navigator.clipboard.writeText(text);
  alert('Claude Codex copied to clipboard!');
})();
```

**Add to Codex Bookmarklet:**
```javascript
// bookmarklet/add-to-codex.js
javascript:(()=>{
  const selection=window.getSelection().toString();
  if(!selection){alert('Select text first!');return}

  const name=prompt('Pattern name?');
  const category=prompt('Category? (skill/command/agent/rule)');
  const desc=prompt('Description?');

  if(name&&category&&desc){
    // Create PR via GitHub API
    createGitHubPR(name,category,desc,selection);
    alert('Pattern added to Codex! Check GitHub PR.');
  }
})();
```

**Deliverables:**
- ✅ Drag-to-bookmarks-bar bookmarklets
- ✅ Works in all browsers
- ✅ No installation required

### Phase 5: Cross-Machine Sync (1 hour)

**Tasks:**
1. Create installation script for new machines
2. Test sync across 3+ machines
3. Verify conflict resolution
4. Document troubleshooting

**Installation Script:**
```bash
#!/bin/bash
# sync/install.sh

echo "Installing Claude Codex..."

# Backup existing ~/.claude/
if [ -d ~/.claude ]; then
  echo "Backing up ~/.claude/ to ~/.claude.backup/"
  mv ~/.claude ~/.claude.backup
fi

# Clone Codex repo
git clone https://github.com/username/claude-codex.git ~/claude-codex

# Symlink to ~/.claude/
ln -s ~/claude-codex ~/.claude

# Install file watcher daemon
cd ~/claude-codex/sync/daemon
npm install
node watcher.js install  # Installs LaunchDaemon

echo "✅ Claude Codex installed!"
echo "Changes will auto-sync to GitHub every 5 minutes"
```

**Deliverables:**
- ✅ One-command installation
- ✅ Auto-sync working across machines
- ✅ Conflict resolution tested

### Phase 6: Plugin Distribution (2 hours)

**Tasks:**
1. Create plugin manifest
2. Test installation via `claude plugin install`
3. Publish to marketplace (optional)
4. Create installation video/GIF

**Plugin Manifest:**
```json
{
  "name": "claude-codex",
  "description": "Universal Claude Code configuration with auto-sync across CLI and web",
  "author": {
    "name": "Your Name",
    "url": "https://github.com/username"
  },
  "homepage": "https://github.com/username/claude-codex",
  "repository": "https://github.com/username/claude-codex",
  "license": "MIT",
  "version": "1.0.0",
  "keywords": [
    "claude-code",
    "configuration",
    "auto-sync",
    "commands",
    "agents",
    "skills"
  ],
  "commands": "./commands",
  "skills": "./skills",
  "agents": "./agents"
}
```

**Installation Methods:**
```bash
# Method 1: Direct install
claude plugin install github:username/claude-codex

# Method 2: Via marketplace (if published)
claude plugin install claude-codex@official

# Method 3: Manual (for development)
cd ~/claude-codex && ./sync/install.sh
```

**Deliverables:**
- ✅ Plugin installable via Claude Code CLI
- ✅ Listed in marketplace (optional)
- ✅ Clear installation docs

## Technical Specifications

### Auto-Sync Daemon

**Language:** Node.js (works everywhere)
**Dependencies:**
- `chokidar` - File watching
- `simple-git` - Git operations
- `node-schedule` - Cron-like scheduling

**Features:**
- Debounced commits (30 seconds after last change)
- Batched pushes (every 5 minutes)
- Smart commit messages (analyze changed files)
- Conflict detection & resolution
- Error logging & recovery

**Resource Usage:**
- Memory: ~20MB
- CPU: <1% idle, ~5% during sync
- Network: Minimal (only pushes diffs)

### Browser Extension

**Platforms:**
- Chrome (Manifest V3)
- Safari (via Xcode conversion)
- Firefox (separate manifest)

**Features:**
- Fetch from GitHub raw URL
- Parse CLAUDE.md structure
- Inject into Project custom instructions
- Version tracking (detect updates)
- Rate limit handling
- Offline support (cache last fetch)

**Security:**
- No authentication needed (public repo)
- CSP compliant
- No external requests except GitHub
- No user data collection

### Git Hooks

**Hooks Implemented:**
1. `pre-commit` - Validate file structure
2. `post-commit` - Schedule push
3. `pre-push` - Run tests, check for secrets
4. `post-merge` - Notify user of updates

**Validation Checks:**
- YAML frontmatter in `.md` files
- No secrets/API keys in config
- Max file size limits
- Required files exist

## Security Considerations

**Sensitive Data:**
- Never commit `settings.local.json` (has secrets)
- Maintain `.gitignore` for sensitive files
- Pre-push hook scans for API keys

**Authentication:**
- GitHub repo can be public or private
- SSH key or Personal Access Token for push
- Browser extension uses public API (no auth)

**Conflict Resolution:**
- Pull before push (rebase strategy)
- Last-write-wins for conflicts
- Manual resolution for complex conflicts

## Testing Plan

### Phase 1 Tests
- [ ] Repository renamed successfully
- [ ] Plugin manifest valid
- [ ] CI/CD pipeline runs
- [ ] README renders correctly

### Phase 2 Tests
- [ ] File watcher detects changes
- [ ] Auto-commit works
- [ ] Batched push works
- [ ] Daemon survives reboot
- [ ] Works on macOS, Linux, Windows

### Phase 3 Tests
- [ ] Extension loads in Chrome
- [ ] Fetch from GitHub works
- [ ] Injection into Claude.ai works
- [ ] Version tracking works
- [ ] Safari version works

### Phase 4 Tests
- [ ] Bookmarklet copies to clipboard
- [ ] Add-to-Codex creates PR
- [ ] Works in all major browsers

### Phase 5 Tests
- [ ] Install script works on fresh machine
- [ ] Sync works across 3 machines
- [ ] Conflicts resolve correctly
- [ ] Uninstall script cleans up

### Phase 6 Tests
- [ ] Plugin installs via `claude plugin install`
- [ ] All commands/skills/agents work
- [ ] Updates propagate correctly

## Success Metrics

**Auto-Sync:**
- Changes appear on other machines within 1 hour
- 0 manual git commands needed for sync
- <1% conflict rate

**Web Sync:**
- One click to sync to Claude.ai
- <5 seconds to complete
- Works 99% of the time

**User Experience:**
- Install in <5 minutes
- No configuration needed
- "It just works"

## Rollout Plan

1. **Week 1:** Phases 1-2 (Repository + Local Sync)
2. **Week 2:** Phase 3 (Browser Extension)
3. **Week 3:** Phases 4-5 (Bookmarklet + Multi-Machine)
4. **Week 4:** Phase 6 (Plugin Distribution)

## Maintenance

**Regular Tasks:**
- Monitor GitHub Actions for failures
- Update dependencies monthly
- Review conflict logs
- Optimize sync performance

**Versioning:**
- Semantic versioning (1.0.0)
- Changelog in GitHub releases
- Auto-update notification in extension

## Future Enhancements

**Potential Features:**
- Desktop app (Electron) for visual management
- Alfred/Raycast workflow integration
- Mobile app (view-only)
- Team sharing (organization-wide Codex)
- AI-assisted pattern extraction
- Codex marketplace (community patterns)
- VS Code extension
- Analytics (most-used commands/agents)

## Questions to Resolve

1. **Repo visibility:** Public or private GitHub repo?
2. **Sync frequency:** 5 minutes good? Or configurable?
3. **Browser priority:** Chrome first, then Safari? Or both?
4. **Daemon approach:** LaunchDaemon (macOS) or systemd (Linux)?
5. **Conflict strategy:** Last-write-wins or manual resolution?

---

**Next Steps:**
1. Review this plan
2. Answer questions above
3. Approve to proceed with implementation
4. Start with Phase 1
