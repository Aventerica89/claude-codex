# Learned: Claude Plugin Marketplace Installation Pattern

**Extracted:** 2026-02-05
**Session:** jb-cloud-app-tracker - Installing official Claude plugins
**Status:** Production-tested

## Problem

When installing multiple Claude plugins from the official marketplace, the naive approach fails: trying to install without first adding the marketplace results in "marketplace not found" errors. The correct workflow requires a two-step initialization process before bulk installation can work.

## Solution

### Step 1: Add the Official Marketplace (One-Time Setup)

```bash
claude plugin marketplace add anthropics/claude-plugins-official
```

This registers the `anthropics/claude-plugins-official` marketplace as a available source for plugin discovery.

**What happens:**
- Downloads marketplace index from `anthropics/claude-plugins-official`
- Stores reference locally so subsequent installs know where to find plugins
- Only needs to run once per workspace

### Step 2: Install Plugins from Marketplace

After the marketplace is registered, install individual plugins:

```bash
claude plugin install {plugin-name}@claude-plugins-official
```

**Important:** Include the `@claude-plugins-official` suffix to specify which marketplace to use.

### Step 3: Bulk Installation Pattern

For installing multiple plugins, use a loop or script:

```bash
# Option 1: Bash loop with array
PLUGINS=(
  "claude-plugins-official"
  "plugin-name-1"
  "plugin-name-2"
  # ... up to 51+ plugins
)

for plugin in "${PLUGINS[@]:1}"; do  # Skip first item (marketplace name)
  claude plugin install "$plugin@claude-plugins-official"
done

# Option 2: One-liner
for p in plugin1 plugin2 plugin3 plugin4 plugin5; do claude plugin install "$p@claude-plugins-official"; done
```

### Step 4: Verify Installation

List installed plugins:

```bash
claude plugin list
```

Each installed plugin will show:
- Plugin name
- Version
- Status (enabled/disabled)
- Source marketplace

## How It Works

### Marketplace Architecture

```
Marketplace Index (anthropics/claude-plugins-official)
├── Plugin metadata (name, version, description, commands)
├── Version registry
└── Dependency information

Local Installation
├── ~/.claude/plugins/installed/
│   ├── plugin-1/
│   ├── plugin-2/
│   └── ...
├── ~/.claude/plugin-manifest.json (tracks installed state)
└── ~/.claude/config.json (marketplace references)
```

### Installation Flow

```
1. User runs: claude plugin marketplace add anthropics/claude-plugins-official
   ↓
2. Claude CLI fetches marketplace index
   ↓
3. Marketplace reference stored locally
   ↓
4. User runs: claude plugin install name@anthropics/claude-plugins-official
   ↓
5. CLI looks up plugin in marketplace
   ↓
6. Downloads plugin from marketplace
   ↓
7. Installs to ~/.claude/plugins/installed/{name}
   ↓
8. Updates plugin manifest
```

## Key Details

### Marketplace Naming Convention

The official marketplace uses namespaced format:
- **Organization:** `anthropics` (official Anthropic plugins)
- **Repository:** `claude-plugins-official` (official public plugins)
- **Full reference:** `anthropics/claude-plugins-official`

This matches GitHub organization/repo naming for clarity.

### Plugin Reference Format

When installing, always use the full reference:

```bash
# CORRECT
claude plugin install plugin-name@anthropics/claude-plugins-official

# SHORTHAND (if marketplace is default)
claude plugin install plugin-name@claude-plugins-official

# WRONG - will fail if marketplace not added
claude plugin install plugin-name
```

### Common Issues & Fixes

**Issue: "Marketplace not found" error**
```
Error: Could not find marketplace: anthropics/claude-plugins-official
```
**Fix:** Run step 1 first:
```bash
claude plugin marketplace add anthropics/claude-plugins-official
```

**Issue: "Plugin not found in marketplace" error**
```
Error: Plugin 'plugin-name' not found in marketplace
```
**Fix:** Verify plugin name matches marketplace:
```bash
claude plugin search plugin-name --marketplace anthropics/claude-plugins-official
```

**Issue: Plugin installed but not showing in `claude plugin list`**
**Fix:** Refresh plugin cache:
```bash
claude plugin refresh
```

## When to Use This Pattern

- Installing official Anthropic plugins from marketplace
- Setting up new Claude workspace
- Adding multiple plugins at once (bulk installation)
- Integrating third-party plugin repositories
- CI/CD automation for plugin management

## When NOT to Use

- Local plugins (use `claude plugin install ./path/to/plugin` instead)
- Private/custom plugins (use direct paths)
- Installing from different marketplace (would add different marketplace first)

## Real-World Example: Full Setup

```bash
#!/bin/bash
# setup-plugins.sh - Install official Claude plugins

# Step 1: Add marketplace (idempotent - safe to run multiple times)
echo "Adding official marketplace..."
claude plugin marketplace add anthropics/claude-plugins-official

# Step 2: List of official plugins to install
OFFICIAL_PLUGINS=(
  "anthropic-sdk"
  "code-executor"
  "github-integration"
  "slack-integration"
  "vercel-integration"
  # ... 46 more plugins
)

# Step 3: Install each plugin
echo "Installing ${#OFFICIAL_PLUGINS[@]} plugins..."
for plugin in "${OFFICIAL_PLUGINS[@]}"; do
  echo "Installing $plugin..."
  claude plugin install "$plugin@anthropics/claude-plugins-official"

  if [ $? -eq 0 ]; then
    echo "✓ $plugin installed"
  else
    echo "✗ $plugin failed - skipping"
  fi
done

# Step 4: Verify
echo ""
echo "Installed plugins:"
claude plugin list | grep "anthropics"

echo ""
echo "Setup complete!"
```

## Performance Notes

- **Marketplace index download:** ~5-10 seconds (one-time)
- **Individual plugin install:** ~2-3 seconds per plugin
- **Bulk install (51 plugins):** ~2-3 minutes total
- **Network:** Requires internet connection
- **Parallelization:** Can use `xargs -P 4` for parallel installation (not tested for stability)

## Advanced: Multiple Marketplaces

Can add and use multiple marketplaces:

```bash
# Add official marketplace
claude plugin marketplace add anthropics/claude-plugins-official

# Add community marketplace
claude plugin marketplace add community/claude-plugins-community

# Install from specific marketplace
claude plugin install plugin-name@anthropics/claude-plugins-official
claude plugin install custom-plugin@community/claude-plugins-community

# List all registered marketplaces
claude plugin marketplace list
```

## Environment Variables

No specific env vars needed for marketplace installation. Uses:
- Default Claude config location: `~/.claude/`
- Network access via standard system proxy (respects HTTP_PROXY, HTTPS_PROXY)

## Troubleshooting Matrix

| Error | Cause | Solution |
|-------|-------|----------|
| "Marketplace not found" | Step 1 not run | `claude plugin marketplace add anthropics/claude-plugins-official` |
| "Plugin not found" | Wrong plugin name | `claude plugin search` to find exact name |
| "Connection timeout" | Network issue | Check internet, firewall, proxy settings |
| "Version conflict" | Dependency issue | Update Claude CLI: `npm install -g @anthropic-ai/claude-cli@latest` |
| "Permission denied" | File permissions | Ensure `~/.claude/plugins/` is writable |

## Related Patterns

- **Local Plugin Development:** `claude plugin init ./my-plugin`
- **Plugin Configuration:** `claude plugin config {name} --set key=value`
- **Plugin Disabling:** `claude plugin disable {name}` (preserves installation)
- **Plugin Removal:** `claude plugin uninstall {name}`
