---
description: End session cleanly - sync docs, commit to memory, shutdown. Run when finishing work on a project.
---

# End Session Command

Cleanly wrap up a work session with documentation sync, memory commit, and optional server shutdown.

## What This Command Does

1. **Sync to docs.jbcloud.app** (if project is configured for it)
2. **Commit session to memory** (learned patterns, decisions, progress)
3. **Create session summary** for future reference
4. **Shutdown dev server** (if running)

---

## Step 1: Check Documentation Sync

If the current project has `documentToDocs: true` in its CLAUDE.md or was created with docs.jbcloud.app enabled:

### Gather Documentation to Sync
- `docs/ARCHITECTURE.md` - System design
- `docs/PLAN.md` - Implementation plan
- `CLAUDE.md` - Project context
- `CHANGELOG.md` or git log summary - What was accomplished
- Any other `docs/*.md` files

### Sync Method

Use the **jbdocs** agent to sync documentation to the jb-cloud-docs repository:

**Automated Sync (Default)**

Run `/jbdocs progress` which will:

1. Update progress.md with session accomplishments
2. Update any changed documentation files
3. Commit and push to jb-cloud-docs repository

```bash
cd /Users/jb/jb-cloud-docs
git add src/content/docs/{project-slug}/
git commit -m "docs({project-slug}): update progress - {session summary}"
git push origin main
```

**Manual Sync (if automated fails)**

If the jbdocs agent fails, manually sync:
```bash
cd /Users/jb/jb-cloud-docs
git pull origin main
# Copy updated docs
cp {project}/docs/ARCHITECTURE.md src/content/docs/{project-slug}/architecture.md
cp {project}/docs/PLAN.md src/content/docs/{project-slug}/plan.md
git add src/content/docs/{project-slug}/
git commit -m "docs({project-slug}): manual sync"
git push origin main
```

**Docs Site Location:**
- Repository: `/Users/jb/jb-cloud-docs`
- Remote: `https://github.com/Aventerica89/jb-cloud-docs.git`
- Project docs: `/Users/jb/jb-cloud-docs/src/content/docs/{project-slug}/`
- Live URL: `https://docs.jbcloud.app/{project-slug}/`

---

## Step 2: Commit to Memory

Use the `/learn` skill or continuous-learning pattern to extract and save:

### What to Remember
1. **Project context** - Name, purpose, tech stack
2. **Key decisions made** - Architecture choices, platform selections
3. **Patterns discovered** - Reusable solutions, code patterns
4. **Current state** - What's done, what's next
5. **Blockers/risks** - Issues to address next session

### Memory Format
Create or update a learned pattern file:

```markdown
# Project: {project-name}

## Context
- Type: {app/tool/site}
- Stack: {Next.js, Supabase, etc.}
- Status: {in-progress/complete}

## Key Decisions
- {Decision 1}: {Rationale}
- {Decision 2}: {Rationale}

## Progress
- [x] Phase 1: Setup
- [x] Phase 2: Core features
- [ ] Phase 3: Polish

## Next Session
- Start with: {specific task}
- Blockers: {any issues}

## Learned Patterns
- {Pattern 1}: {How to reuse}
```

Save to: `~/.claude/skills/learned/{project-name}.md`

---

## Step 3: Create Session Summary

Generate a brief summary of the session:

```markdown
## Session Summary: {date}

### Worked On
- {project-name}

### Accomplished
- {Task 1}
- {Task 2}
- {Task 3}

### Files Changed
- {file1.ts} - {what changed}
- {file2.tsx} - {what changed}

### Next Steps
1. {Next task 1}
2. {Next task 2}

### Time Spent
- ~{X} hours
```

Display to user for review.

---

## Step 4: Shutdown Dev Server

Check for running dev servers and offer to stop them:

```bash
# Find running Node processes on common dev ports
lsof -i :3000 -i :3001 -i :5173 -i :4321 | grep LISTEN
```

If found, ask user:
```
Dev server running on port 3000 (PID: 12345)
Stop it? [Y/n]
```

If yes:
```bash
kill {PID}
```

---

## Step 5: Final Output

Display summary to user:

```
Session ended cleanly.

Documentation:
  Synced to docs.jbcloud.app

Memory:
  Saved to ~/.claude/skills/learned/{project-name}.md

Server:
  Stopped dev server on port 3000

Next time:
  Run `claude` in {project-dir} to continue
  Start with: {next task}
```

---

## Usage Examples

### Basic End
```
User: /end

Claude: Wrapping up session...

Session Summary:
- Project: timesheet-filler
- Accomplished: Created architecture, implementation plan
- Next: Start Phase 1 scaffolding

Documentation synced to docs.jbcloud.app
Memory committed
Dev server stopped

See you next time!
```

### End Without Docs Sync
```
User: /end

Claude: This project isn't configured for docs.jbcloud.app sync.
Skipping documentation sync.

[Continue with memory commit and shutdown...]
```

---

## Configuration

To enable docs.jbcloud.app sync for a project, add to project's CLAUDE.md:

```markdown
## Documentation
- Sync to docs.jbcloud.app: Yes
- Project slug: {project-slug}
- Docs URL: https://docs.jbcloud.app/{project-slug}/
```

Or set during `/new-project` Phase 1 when asked "Document to docs.jbcloud.app?"

### Manual Sync Anytime

Run `/jbdocs` command directly to sync documentation outside of `/end`:
- `/jbdocs init` - Initial setup for new project
- `/jbdocs update` - Update all docs
- `/jbdocs progress` - Update progress only

---

## Notes

- Always run `/end` before closing terminal to ensure clean state
- Memory files help resume context in future sessions
- Docs sync keeps documentation site up to date automatically
- Server shutdown prevents orphaned processes
