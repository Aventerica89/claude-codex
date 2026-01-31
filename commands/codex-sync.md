---
description: Bidirectional sync of claude-codex with GitHub from any directory
---

# Codex Sync Command

Bidirectional sync of the claude-codex repository (~/.claude) with GitHub. Pulls remote changes, commits local changes, and pushes - all from any directory.

## Arguments

Parse `$ARGUMENTS` for optional commit message:
- No arguments - Auto-generate commit message from changes
- `$ARGUMENTS` - Use as custom commit message

## Behavior (Bidirectional)

1. **Fetch remote status**:
   ```bash
   cd ~/.claude && git fetch origin
   ```

2. **Check if remote is ahead**:
   ```bash
   git rev-list HEAD..origin/main --count
   ```
   - If remote has commits → pull with rebase
   - Show what was pulled

3. **Check for local changes**:
   ```bash
   git status --porcelain
   ```
   - If no changes and already up to date → "Already in sync"
   - If changes exist → proceed to commit

4. **If local changes exist**:
   - Show what changed (files added/modified/deleted)
   - Generate or use commit message
   - Commit changes

5. **Commit message logic**:
   - If user provided message: use it
   - If auto-generating:
     - Check which directories changed (commands/, skills/, agents/, rules/)
     - Create conventional commit message:
       - `feat(commands): add <command-name>` - New command
       - `feat(skills): add <skill-name>` - New skill
       - `fix(commands): update <command-name>` - Modified command
       - `chore: update multiple files` - Multiple changes

6. **Execute sync**:
   ```bash
   cd ~/.claude
   # Pull if needed
   [git pull --rebase origin main]

   # Commit if local changes
   git add -A
   git commit -m "<message>"

   # Push
   git push origin main
   ```

7. **Report results**:
   - Show what was pulled (if any)
   - Show what was committed (if any)
   - Show commit hash
   - Confirm sync successful

## Example Flows

### Local changes only

```
User: /codex-sync

Claude: Syncing claude-codex...

        Remote: Already up to date
        Local changes:
        - commands/sync.md (new)

        [Commits with: "feat(commands): add sync"]
        [Pushes to GitHub]

        ✓ Synced to claude-codex (abc1234)
        Changes are now available on all machines.
```

### Remote changes only

```
User: /codex-sync

Claude: Syncing claude-codex...

        Pulled 2 commits from remote:
        - feat(skills): add new learned pattern
        - fix(commands): update deploy-env

        No local changes to push.

        ✓ Synced with remote (up to date)
```

### Both remote and local changes

```
User: /codex-sync

Claude: Syncing claude-codex...

        Pulled 1 commit from remote:
        - docs: update README

        Local changes:
        - commands/new-feature.md (new)

        [Rebases local changes on top of remote]
        [Commits with: "feat(commands): add new-feature"]
        [Pushes to GitHub]

        ✓ Synced to claude-codex (def5678)
```

### Already in sync

```
User: /codex-sync

Claude: Already in sync with claude-codex.
```

### Custom commit message

```
User: /codex-sync "Add bidirectional sync support"

Claude: Syncing claude-codex...

        Remote: Already up to date
        Local changes:
        - commands/sync.md (modified)

        [Commits with user message]
        [Pushes to GitHub]

        ✓ Synced to claude-codex (ghi9012)
```

## Error Handling

If git operations fail:
- Check if ~/.claude is a git repository
- Check if remote is configured
- Show git error message
- Suggest fixes:
  - Not a repo: "~/.claude is not a git repository"
  - No remote: "No remote configured. Run: cd ~/.claude && git remote add origin <url>"
  - Push failed: Show error and suggest `git pull --rebase` first

## Safety

- Always commits ALL changes in ~/.claude (uses `git add -A`)
- Never modifies the current working directory
- Returns to original directory after sync
- Uses `--porcelain` flag for reliable parsing

## Use Cases

- Just added a new command and want it synced immediately
- Modified a skill and want it available on other machines
- Updated rules and need them pushed to GitHub
- Working in a project but want to sync codex changes without changing directories
- Just logged into a new machine and want to pull latest codex changes
- Both local and remote have changes - handles rebase automatically
- Quick health check: "Am I in sync with my codex repo?"
