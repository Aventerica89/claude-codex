# Routine System - Git Tracking

These files implement the `/routine-merge` system for automated PR merge workflows.

## Files to Track

### Commands (add to git)
```bash
git add ~/.claude/commands/routine-merge.md
git add ~/.claude/commands/routine-config.md
git add ~/.claude/commands/routine-stats.md
```

### Configuration (add to git)
```bash
git add ~/.claude/routines/merge.json
git add ~/.claude/routines/presets/
git add ~/.claude/routines/README.md
git add ~/.claude/routines/QUICKSTART.md
git add ~/.claude/routines/ARCHITECTURE.md
git add ~/.claude/routines/GIT-README.md
```

### Do NOT Track
```
~/.claude/routines/state/    # Runtime state files (per-PR)
```

## Quick Add All

```bash
cd ~/.claude

# Add routine commands
git add commands/routine-merge.md \
        commands/routine-config.md \
        commands/routine-stats.md

# Add routine configs and docs
git add routines/merge.json \
        routines/README.md \
        routines/QUICKSTART.md \
        routines/ARCHITECTURE.md \
        routines/GIT-README.md \
        routines/presets/

# Commit
git commit -m "feat(routines): add routine-merge system

Automated PR merge workflow with three levels:
- Light: Fast path for docs/tests (~2 min)
- Medium: Standard with Gemini review (~5 min)
- Thorough: Comprehensive pre-release (~10 min)

Commands:
- /routine-merge - Main merge routine
- /routine-config - Configuration management
- /routine-stats - Metrics and analytics

Features:
- Gemini AI review integration
- Security scanning with severity-based actions
- State preservation and resume capability
- Learning system with recommendations
- Three presets: hotfix, release, deps-update"

# Push
git push origin main
```

## File Summary

| File | Size | Purpose |
|------|------|---------|
| `commands/routine-merge.md` | 14KB | Main merge routine command |
| `commands/routine-config.md` | 9KB | Configuration management |
| `commands/routine-stats.md` | 12KB | Metrics and analytics |
| `routines/merge.json` | 3KB | Main configuration |
| `routines/README.md` | 12KB | Complete documentation |
| `routines/QUICKSTART.md` | 6KB | Getting started guide |
| `routines/ARCHITECTURE.md` | 18KB | Technical deep-dive |
| `routines/presets/hotfix.json` | 1KB | Fast merge preset |
| `routines/presets/release.json` | 2KB | Pre-release preset |
| `routines/presets/deps-update.json` | 1KB | Dependency update preset |

## After Cloning

If you clone this repo to a new machine:

1. Files will be in place
2. Run `/routine-merge --dry-run` to verify
3. Customize `merge.json` for local preferences
4. State directory will be created automatically

## Updating

When making changes to the routine system:

```bash
cd ~/.claude
git add routines/ commands/routine*.md
git commit -m "fix(routines): description of change"
git push
```
