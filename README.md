# Claude Codex

**Universal Claude Code configuration system with auto-sync across CLI and web.**

Claude Codex is a comprehensive configuration framework for Claude Code that provides:
- Curated commands, agents, skills, and rules for professional development
- Automatic synchronization across all your machines
- One-click sync to Claude.ai Projects
- Plugin-based distribution for easy installation

## Features

- **50+ Custom Commands** - Productivity shortcuts for common development tasks
- **12+ Specialized Agents** - TDD, security review, architecture, build fixes, and more
- **15+ Skills** - Frontend/backend patterns, security review, continuous learning
- **Modular Rules** - Coding style, git workflow, testing, performance optimization
- **Auto-Sync** - Changes sync automatically across all machines via GitHub
- **Web Integration** - Browser extension for Claude.ai Projects
- **Plugin System** - Install once, use everywhere

## Quick Start

### Installation

**Option 1: As Plugin (Recommended)**

```bash
# Install via Claude Code CLI
claude plugin install github:Aventerica89/claude-codex

# The plugin is now active - all commands, agents, and skills are available
```

**Option 2: Direct Clone**

```bash
# Backup existing config (if any)
mv ~/.claude ~/.claude.backup

# Clone Claude Codex
git clone https://github.com/Aventerica89/claude-codex.git ~/claude-codex

# Symlink to ~/.claude/
ln -s ~/claude-codex ~/.claude

# Install auto-sync (optional)
cd ~/claude-codex/sync
./install.sh
```

### Verify Installation

```bash
# Check that Claude Code recognizes the config
claude --version

# List available commands
ls ~/.claude/commands/

# Test a command (if implemented)
claude /help
```

## What's Included

### Commands

Custom slash commands for common workflows:
- `/commit` - Smart git commit with analysis
- `/review-pr` - Comprehensive PR review
- `/deploy` - Automated deployment workflows
- `/context-save` / `/context-restore` - Session management
- And many more...

### Agents

Specialized AI agents for complex tasks:
- **planner** - Feature implementation planning
- **tdd-guide** - Test-driven development
- **code-reviewer** - Code quality analysis
- **security-reviewer** - Security vulnerability scanning
- **architect** - System design and architecture
- **build-error-resolver** - Fix build and type errors
- **e2e-runner** - Playwright E2E testing
- **doc-updater** - Documentation management

### Skills

Reusable patterns and workflows:
- **coding-standards** - TypeScript/JavaScript best practices
- **frontend-patterns** - React, Next.js patterns
- **backend-patterns** - API design, database optimization
- **security-review** - Security checklists and patterns
- **tdd-workflow** - Test-driven development workflow
- **continuous-learning** - Auto-extract patterns from sessions

### Rules

Modular guidelines for consistent development:
- **coding-style.md** - Immutability, file organization
- **testing.md** - TDD workflow, 80% coverage requirement
- **git-workflow.md** - Commit format, PR workflow
- **security.md** - Security checks, secret management
- **performance.md** - Model selection, context management

## Auto-Sync System

Claude Codex includes an optional auto-sync system that keeps your configuration synchronized across all machines.

### How It Works

```
Your Machine 1          GitHub (Master)          Your Machine 2
    ~/.claude/     ←→   claude-codex repo   ←→     ~/.claude/

    Changes auto-commit      Updates every           Pulls latest
    and push every 5min      hour automatically      config hourly
```

### Enable Auto-Sync

```bash
cd ~/claude-codex/sync
./install.sh

# Auto-sync daemon is now running
# Changes will sync automatically
```

### Manual Sync

```bash
# Push your changes
cd ~/.claude
git add -A && git commit -m "update: description" && git push

# Pull latest from GitHub
git pull --rebase
```

## Web Integration

Use Claude Codex in Claude.ai Projects with the browser extension.

### Browser Extension

**Installation:**
1. Download the extension from `browser-extension/`
2. Load as unpacked extension in Chrome
3. Navigate to claude.ai/projects
4. Click "Sync Codex" button

**Features:**
- One-click sync from GitHub to Projects
- Automatic version detection
- Offline caching

### Bookmarklet (Alternative)

Drag this to your bookmarks bar:

```javascript
javascript:(async()=>{const r=await fetch('https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md');navigator.clipboard.writeText(await r.text());alert('Codex copied!')})();
```

Then click it to copy the latest config to clipboard.

## Project Structure

```
claude-codex/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest
├── .github/
│   └── workflows/
│       └── validate.yml         # CI validation
├── agents/                      # Specialized agents
├── commands/                    # Custom commands
├── skills/                      # Reusable skills
├── rules/                       # Modular rules
├── sync/                        # Auto-sync system
│   ├── daemon/                  # File watcher
│   ├── install.sh               # Setup script
│   └── uninstall.sh             # Cleanup
├── browser-extension/           # Web sync
├── CLAUDE.md                    # Main configuration
├── ideas.md                     # Feature ideas
└── README.md                    # This file
```

## Configuration

### Main Config

The main configuration is in `CLAUDE.md` with these sections:
- Core Philosophy (CLI-first, agent-first, parallel execution)
- 1Password integration for API keys
- Modular rules system
- Available agents and when to use them
- String length limits (prevent API errors)
- Personal preferences

### Modular Rules

Rules are separated into focused files in `rules/`:
- `cli-first.md` - Check tools before asking user
- `coding-style.md` - Immutability, file organization
- `testing.md` - TDD workflow, coverage requirements
- `git-workflow.md` - Commit format, PR process
- `security.md` - Security checks, secret management

### Customization

To customize for your workflow:

1. Fork this repository
2. Edit `CLAUDE.md` and rule files
3. Add your own commands in `commands/`
4. Add your own skills in `skills/learned/`
5. Push changes - they'll sync automatically

## Usage Examples

### Using Commands

```bash
# In Claude Code CLI
/commit              # Smart commit workflow
/review-pr 123       # Review PR #123
/context-save dev    # Save current context
```

### Using Agents

```bash
# Claude will proactively use agents when appropriate
# You can also explicitly request:
"Use the planner agent to design the authentication system"
"Use the security-reviewer agent to audit this code"
```

### Using Skills

```bash
# Skills are automatically loaded
# Referenced in CLAUDE.md:
- coding-standards
- frontend-patterns
- tdd-workflow
```

## Contributing

This is a personal configuration system, but feel free to:
- Fork and customize for your needs
- Submit ideas via issues
- Share patterns you've discovered

## Troubleshooting

### Auto-sync not working

```bash
# Check daemon status
cd ~/claude-codex/sync/daemon
node watcher.js status

# Restart daemon
node watcher.js restart
```

### Plugin not recognized

```bash
# Verify plugin manifest
cat ~/.claude/.claude-plugin/plugin.json

# Reinstall
claude plugin uninstall claude-codex
claude plugin install github:Aventerica89/claude-codex
```

### Sync conflicts

```bash
# Pull with rebase (recommended)
cd ~/.claude
git pull --rebase origin main

# Or reset to remote (CAUTION: loses local changes)
git fetch origin
git reset --hard origin/main
```

## Roadmap

- [x] Plugin manifest
- [x] GitHub validation workflow
- [x] Comprehensive documentation
- [ ] Auto-sync daemon
- [ ] Browser extension
- [ ] Bookmarklet tools
- [ ] Multi-machine testing
- [ ] Marketplace submission

## License

MIT - See LICENSE file for details

## Links

- **GitHub**: https://github.com/Aventerica89/claude-codex
- **Issues**: https://github.com/Aventerica89/claude-codex/issues
- **Claude Code**: https://claude.ai/claude-code

---

**Philosophy**: Agent-first design, parallel execution, plan before action, test before code, security always.
