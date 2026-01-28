# Learned Pattern: JB Docs Automation

## Context
- Created: 2025-01-27
- Project: Claude Code workflow enhancement
- Purpose: Automatically sync project documentation to docs.jbcloud.app

## Components Created

### Agent: `~/.claude/agents/jbdocs.md`
- Handles documentation sync to jb-cloud-docs repository
- Creates project directories under `src/content/docs/{project-slug}/`
- Generates Starlight-compatible markdown with frontmatter
- Supports init, update, and progress workflows

### Command: `~/.claude/commands/jbdocs.md`
- User-invocable skill for manual sync
- `/jbdocs` - Sync current project
- `/jbdocs init` - Initial setup
- `/jbdocs update` - Update existing docs
- `/jbdocs progress` - Update progress only

## Integration Points

### /new-project Integration
- Phase 1 asks "Document to docs.jbcloud.app?"
- Phase 6.8 auto-syncs when enabled
- Creates project directory, index.md, architecture.md, plan.md

### /end Integration
- Checks for `Sync to docs.jbcloud.app: Yes` in CLAUDE.md
- Runs `/jbdocs progress` to update progress.md
- Syncs before session ends

## Repository Structure

```
/Users/jb/jb-cloud-docs/
└── src/content/docs/
    └── {project-slug}/
        ├── index.md          # Project overview
        ├── architecture.md   # System design
        ├── plan.md           # Implementation plan
        ├── progress.md       # Current status
        └── {feature}.md      # Feature docs
```

## Frontmatter Format

```yaml
---
title: Page Title
description: Brief description
sidebar:
  order: 0  # 0 for index, 1+ for subpages
---
```

## Phase 1 Features (2026-01-28)

Added safety and reliability features:

### Flags
- `--dry-run` - Preview changes without committing
- `--fix` - Auto-fix validation issues

### Conflict Detection
- `source_project` field in index.md frontmatter
- Prevents overwriting different projects with same slug
- Offers alternative slugs on conflict

### Validation
- Checks frontmatter (title, description required)
- Code blocks must have language tags
- Auto-fix can correct common issues

### Retry Logic
- Deployment verification with exponential backoff
- 3 attempts: 0s, 30s, 60s delays
- Graceful failure (doesn't block on timeout)

## How to Reuse

1. Add to project's CLAUDE.md:
   ```markdown
   ## Documentation
   - Sync to docs.jbcloud.app: Yes
   - Project slug: {project-slug}
   - Docs URL: https://docs.jbcloud.app/{project-slug}/
   ```

2. Run `/jbdocs init` for initial setup
3. Use `/end` to auto-sync at session end
4. Run `/jbdocs update` after major changes
5. Use `/jbdocs --dry-run` to preview before syncing
6. Use `/jbdocs --fix` to auto-correct validation issues
