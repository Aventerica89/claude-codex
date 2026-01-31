---
description: Sync claude-codex changes to GitHub from any directory
---

# Sync Command

Commits and pushes changes in the claude-codex repository (~/.claude) to GitHub, regardless of your current working directory.

## Arguments

Parse `$ARGUMENTS` for optional commit message:
- No arguments - Auto-generate commit message from changes
- `$ARGUMENTS` - Use as custom commit message

## Behavior

1. **Check for changes in ~/.claude**:
   ```bash
   cd ~/.claude && git status --porcelain
   ```

2. **If no changes**:
   - Output: "No changes to sync in claude-codex."
   - Exit

3. **If changes exist**:
   - Show what changed (files added/modified/deleted)
   - Generate or use commit message
   - Commit and push

4. **Commit message logic**:
   - If user provided message: use it
   - If auto-generating:
     - Check which directories changed (commands/, skills/, agents/, rules/)
     - Create conventional commit message:
       - `feat(commands): add <command-name>` - New command
       - `feat(skills): add <skill-name>` - New skill
       - `fix(commands): update <command-name>` - Modified command
       - `chore: update multiple files` - Multiple changes

5. **Execute sync**:
   ```bash
   cd ~/.claude
   git add -A
   git commit -m "<message>"
   git push origin main
   ```

6. **Report results**:
   - Show commit hash
   - Show which files were synced
   - Confirm push successful

## Example Flows

### Auto-generated message

```
User: /sync

Claude: [Checks ~/.claude for changes]
Claude: [Finds new command: sync.md]
Claude: Syncing claude-codex changes...

        Modified files:
        - commands/sync.md (new)

        [Commits with: "feat(commands): add sync"]
        [Pushes to GitHub]

        ✓ Synced to claude-codex (abc1234)
        Changes are now available on all machines.
```

### Custom message

```
User: /sync "Add sync command for cross-repo convenience"

Claude: Syncing claude-codex changes...

        Modified files:
        - commands/sync.md (new)

        [Commits with user message]
        [Pushes to GitHub]

        ✓ Synced to claude-codex (abc1234)
```

### No changes

```
User: /sync

Claude: No changes to sync in claude-codex.
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
