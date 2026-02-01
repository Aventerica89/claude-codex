---
description: Configure routine settings, presets, and behavior
---

# Routine Config

Manage routine system configuration, presets, and settings.

## Usage

```bash
/routine-config                      # Show current config
/routine-config --edit               # Edit config file
/routine-config --reset              # Reset to defaults
/routine-config --set <key> <value>  # Set specific value
/routine-config --preset <name>      # Load preset as default

# Preset management
/routine-config --list-presets       # Show available presets
/routine-config --create-preset      # Create new preset from current config
/routine-config --delete-preset      # Delete preset
```

## Arguments

Parse `$ARGUMENTS` for:
- `--edit` or `-e` - Open config in editor
- `--reset` or `-r` - Reset to default configuration
- `--set <key> <value>` - Set specific configuration value
- `--preset <name>` - Load preset as default config
- `--list-presets` or `-l` - List all available presets
- `--create-preset <name>` - Create new preset
- `--delete-preset <name>` - Delete existing preset
- `--validate` or `-v` - Validate configuration file
- `--export` - Export config as JSON
- `--import <file>` - Import config from file

---

## Configuration Paths

| Config | Path |
|--------|------|
| Merge routine | `~/.claude/routines/merge.json` |
| Presets | `~/.claude/routines/presets/*.json` |
| State files | `~/.claude/routines/state/*.json` |

---

## Common Configuration Tasks

### Change Default Level

```bash
/routine-config --set default_level thorough
```

### Enable Auto-Fix

```bash
/routine-config --set auto_fix true
```

### Change Merge Method

```bash
/routine-config --set merge.method rebase
```

### Disable Branch Deletion

```bash
/routine-config --set merge.delete_branch false
```

### Enable Auto-Merge (risky!)

```bash
/routine-config --set merge.auto_merge true
/routine-config --set merge.confirmation_required false
```

---

## Preset Management

### List Available Presets

```bash
/routine-config --list-presets
```

Output:
```
Available presets:

1. hotfix
   Description: Fast merge for critical production fixes
   Checks: build, tests, security (quick)
   Time: ~2 minutes

2. release
   Description: Comprehensive pre-release checks
   Checks: All checks enabled
   Time: ~10 minutes

3. deps-update
   Description: Dependency update merge
   Checks: build, tests, security, bundle size
   Time: ~5 minutes

Use: /routine-merge --preset <name>
```

### Create New Preset

```bash
/routine-config --create-preset my-workflow
```

Interactive:
1. Shows current config
2. Asks which checks to enable
3. Asks for merge preferences
4. Saves to `~/.claude/routines/presets/my-workflow.json`

### Delete Preset

```bash
/routine-config --delete-preset hotfix
```

**Note:** Built-in presets (hotfix, release, deps-update) can't be deleted, only modified.

---

## Configuration Reference

### Top-Level Settings

```json
{
  "enabled": true,              // Enable/disable routine system
  "default_level": "medium",    // light, medium, thorough
  "auto_fix": false,            // Auto-apply low-risk fixes
  "wait_for_reviews": true,     // Wait for external reviews
  "timeout_seconds": 300        // Global timeout
}
```

### Check Configuration

Each check has:

```json
{
  "enabled": true,              // Include this check
  "required": true,             // Block merge if fails
  "command": "npm test",        // Command to run (if applicable)
  "timeout_seconds": 180,       // Max execution time
  "levels": ["medium"]          // Which levels include this
}
```

### Merge Settings

```json
{
  "merge": {
    "method": "squash",         // squash, merge, rebase
    "delete_branch": true,      // Delete after merge
    "auto_merge": false,        // Merge without confirmation
    "confirmation_required": true
  }
}
```

### Severity Handling (Gemini/Security)

```json
{
  "implement_severity": ["CRITICAL", "HIGH"],  // Auto-implement
  "prompt_severity": ["MEDIUM"],               // Ask user
  "log_severity": ["LOW"]                      // Just log
}
```

---

## Validation

Validate configuration:

```bash
/routine-config --validate
```

Checks:
- ✅ JSON syntax valid
- ✅ All required fields present
- ✅ Valid values for enums (level, method, etc.)
- ✅ Timeout values reasonable
- ✅ Severity lists valid
- ✅ Commands executable

Output:
```
Validating ~/.claude/routines/merge.json...

✅ Configuration valid

Warnings:
- timeout_seconds is high (300s) - consider reducing
- auto_merge enabled without confirmation_required - risky!

Recommendations:
- Enable 'learning.track_metrics' to optimize checks
- Consider adding 'bundle_size' check for thorough level
```

---

## Export/Import

### Export Current Config

```bash
/routine-config --export
```

Saves to: `~/.claude/routines/merge-export-{timestamp}.json`

Use cases:
- Backup before changes
- Share config with team
- Version control your settings

### Import Config

```bash
/routine-config --import ~/Downloads/merge-config.json
```

Validates before importing:
- Checks JSON syntax
- Validates all fields
- Asks for confirmation before replacing current config
- Creates backup of current config first

---

## Reset to Defaults

```bash
/routine-config --reset
```

**Prompts:**
```
This will reset all settings to defaults.
Current config will be backed up to:
  ~/.claude/routines/merge-backup-{timestamp}.json

Continue? [Yes/No]
```

Resets:
- All top-level settings
- All check configurations
- Merge preferences
- Does NOT delete custom presets
- Does NOT delete state files

---

## Examples

### Example 1: Quick Config Check
```
User: /routine-config

Claude: Current routine configuration:

**Default Level**: medium
**Auto-Fix**: Disabled
**Wait for Reviews**: Enabled

**Enabled Checks** (medium):
- ✅ Build
- ✅ Tests (80% coverage)
- ✅ Gemini Review
- ✅ Security Quick Scan
- ✅ TypeScript
- ✅ GitHub Actions

**Merge Settings**:
- Method: Squash
- Delete branch: Yes
- Auto-merge: No

Presets available: hotfix, release, deps-update
```

### Example 2: Enable Auto-Fix
```
User: /routine-config --set auto_fix true

Claude: ✅ Updated configuration

auto_fix: false → true

This will automatically apply low-risk fixes like:
- npm audit fix (for vulnerabilities)
- eslint --fix (for lint issues)
- prettier --write (for formatting)

Risky fixes will still require confirmation.
```

### Example 3: Create Custom Preset
```
User: /routine-config --create-preset quick-feature

Claude: Creating new preset 'quick-feature'...

Which checks to enable?
[Shows checklist with current config selected]

User: [Selects: build, tests, lint, github_actions]

Claude: Merge settings?
- Method: [squash/merge/rebase]
- Delete branch: [yes/no]
- Confirmation required: [yes/no]

User: squash, yes, yes

Claude: ✅ Created preset 'quick-feature'

Saved to: ~/.claude/routines/presets/quick-feature.json

Use with: /routine-merge --preset quick-feature

Would you like to set this as your default? [Yes/No]
```

### Example 4: Validate After Manual Edit
```
User: /routine-config --validate

Claude: Validating configuration...

❌ Validation failed

Errors:
1. Line 23: "timeout_seconds": "120" should be number, not string
2. Line 45: "merge.method": "squish" - invalid value (use: squash, merge, rebase)
3. Line 67: Missing required field "gemini_review.levels"

Fix these issues and run --validate again.

To reset to working config:
/routine-config --reset
```

---

## Advanced Configuration

### Per-Project Overrides

Create project-specific config:
```
project/.claude/routines/merge.json
```

This overrides global config for this project only.

### Environment-Specific Settings

```json
{
  "environments": {
    "staging": {
      "merge": {
        "auto_merge": true,
        "confirmation_required": false
      }
    },
    "production": {
      "default_level": "thorough",
      "merge": {
        "auto_merge": false,
        "confirmation_required": true
      }
    }
  }
}
```

Use: `/routine-merge --env production`

### Dynamic Check Configuration

Configure checks based on PR attributes:

```json
{
  "dynamic_rules": [
    {
      "condition": "pr.files_changed > 20",
      "action": "upgrade_to_thorough"
    },
    {
      "condition": "pr.contains_migration",
      "action": "require_checks",
      "checks": ["breaking_changes", "performance"]
    },
    {
      "condition": "pr.labels.includes('hotfix')",
      "action": "use_preset",
      "preset": "hotfix"
    }
  ]
}
```

---

## Configuration Tips

### Optimize for Speed
```json
{
  "default_level": "light",
  "wait_for_reviews": false,
  "timeout_seconds": 60,
  "merge": {
    "auto_merge": true
  }
}
```

### Maximize Safety
```json
{
  "default_level": "thorough",
  "auto_fix": false,
  "wait_for_reviews": true,
  "timeout_seconds": 600,
  "checks": {
    "gemini_review": {
      "required": true
    },
    "security_scan": {
      "required": true,
      "block_on_critical": true
    }
  },
  "merge": {
    "confirmation_required": true
  }
}
```

### Balance (Recommended)
```json
{
  "default_level": "medium",
  "auto_fix": false,
  "wait_for_reviews": true,
  "timeout_seconds": 300,
  "merge": {
    "auto_merge": false,
    "confirmation_required": true
  }
}
```

---

## Related Commands

- `/routine-merge` - Run merge routine
- `/routine-stats` - View metrics
- `/deploy-check` - Pre-deployment checks

---

## Notes

- Configuration is validated on load
- Invalid configs fall back to defaults
- Changes take effect immediately
- Custom presets are preserved across resets
- State files are never modified by config changes
