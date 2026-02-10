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

7. **Update Landing Site Stats** (if commands/agents/skills/rules changed):

   Count current totals:
   ```bash
   COMMANDS=$(ls -1 ~/.claude/commands/*.md 2>/dev/null | wc -l | tr -d ' ')
   AGENTS=$(ls -1 ~/.claude/agents/*.md 2>/dev/null | wc -l | tr -d ' ')
   SKILLS=$(find ~/.claude/skills -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
   RULES=$(ls -1 ~/.claude/rules/*.md 2>/dev/null | wc -l | tr -d ' ')
   ```

   Update Hero.tsx in the landing directory:
   - Location: `~/.claude/landing/src/components/Hero.tsx` (or wherever the landing is)
   - Update the stats text: "{COMMANDS}+ commands, {AGENTS} specialized agents, {SKILLS} skills"
   - Update the stats grid array with new values

   If stats changed:
   - Commit the Hero.tsx change
   - Trigger Vercel deploy (auto on push) or run `cd landing && npm run build`

8. **Report results**:
   - Show what was pulled (if any)
   - Show what was committed (if any)
   - Show commit hash
   - Show if landing site stats were updated
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

### With landing site stats update

```
User: /codex-sync

Claude: Syncing claude-codex...

        Local changes:
        - commands/pause.md (new)
        - commands/resume.md (new)

        [Commits with: "feat(commands): add pause and resume"]
        [Pushes to GitHub]

        Landing site stats updated:
        - Commands: 38 → 40+
        - Updated Hero.tsx

        ✓ Synced to claude-codex (jkl3456)
        ✓ codex.jbcloud.app will auto-deploy with new stats
```

## Subcommand: install

When `$ARGUMENTS` starts with `install`, the remaining arguments are plugin names to install.

Example: `/codex-sync install hookify commit-commands coderabbit`

### Install Behavior

1. **Parse plugin names** from arguments (space-separated after `install`)

2. **For each plugin name**, fetch its details from the codex API:
   ```
   GET https://codex.jbcloud.app/api/plugins/[source]:[name]
   ```
   Try both `anthropic-official:{name}` and `awesome-community:{name}` IDs.
   The response includes `repository_url` and `components` array.

3. **Download component files** from the plugin's GitHub repository:
   - Each component has a `type` (agent, skill, command, rule) and `slug`
   - Fetch the raw .md file from GitHub:
     ```
     https://raw.githubusercontent.com/{owner}/{repo}/main/{type}s/{slug}.md
     ```
   - For official plugins (anthropic-official), the path is:
     ```
     https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/{name}/{type}s/{slug}.md
     ```
   - For community plugins (awesome-community), parse the repository_url for the correct path.

4. **Write files** to the correct local directories:
   - Agents → `~/.claude/agents/{slug}.md`
   - Skills → `~/.claude/skills/{slug}.md`
   - Commands → `~/.claude/commands/{slug}.md`
   - Rules → `~/.claude/rules/{slug}.md`

5. **Mark as installed** via the codex API:
   ```
   POST https://codex.jbcloud.app/api/plugins/install
   Body: { "pluginId": "{id}", "action": "install" }
   ```

6. **Report results**:
   ```
   Installed 3 plugins:
   - hookify (2 commands, 1 agent)
   - commit-commands (2 commands)
   - coderabbit (1 agent)

   Files added to ~/.claude/:
   - commands/hookify.md
   - commands/configure-hookify.md
   - agents/hookify-analyzer.md
   - commands/commit.md
   - commands/commit-push-pr.md
   - agents/code-reviewer.md
   ```

### Install Example

```
User: /codex-sync install hookify commit-commands

Claude: Installing 2 plugins from codex.jbcloud.app...

        hookify:
        - Fetched plugin details (2 commands, 1 agent)
        - Downloaded hookify.md → ~/.claude/commands/
        - Downloaded configure-hookify.md → ~/.claude/commands/
        - Downloaded hookify-analyzer.md → ~/.claude/agents/

        commit-commands:
        - Fetched plugin details (2 commands)
        - Downloaded commit.md → ~/.claude/commands/
        - Downloaded commit-push-pr.md → ~/.claude/commands/

        Marked 2 plugins as installed on codex.jbcloud.app

        Installed 2 plugins (5 files added)
```

## Subcommand: remove

When `$ARGUMENTS` starts with `remove`, the remaining arguments are plugin names to remove.

Example: `/codex-sync remove hookify commit-commands`

### Remove Behavior

1. **Parse plugin names** from arguments (space-separated after `remove`)

2. **For each plugin name**, fetch its details from the codex API to get component list.

3. **Delete component files** from local directories:
   - Check each component's expected path (`~/.claude/{type}s/{slug}.md`)
   - Delete if it exists
   - Skip with warning if not found

4. **Mark as uninstalled** via the codex API:
   ```
   POST https://codex.jbcloud.app/api/plugins/install
   Body: { "pluginId": "{id}", "action": "uninstall" }
   ```

5. **Report results**:
   ```
   Removed 2 plugins:
   - hookify (3 files deleted)
   - commit-commands (2 files deleted)
   ```

### Remove Example

```
User: /codex-sync remove hookify

Claude: Removing 1 plugin...

        hookify:
        - Deleted ~/.claude/commands/hookify.md
        - Deleted ~/.claude/commands/configure-hookify.md
        - Deleted ~/.claude/agents/hookify-analyzer.md

        Marked hookify as uninstalled on codex.jbcloud.app

        Removed 1 plugin (3 files deleted)
```

## Error Handling

### Install/Remove errors

- Plugin not found: "Plugin '{name}' not found in catalog. Check the name at codex.jbcloud.app/dashboard/plugins"
- Download failed: "Failed to download {slug}.md from GitHub: {error}. The repo may be private or the file may have moved."
- File write failed: Show error and suggest checking permissions on ~/.claude/
- API update failed: "Plugin installed locally but failed to update codex.jbcloud.app. Run /codex-sync to push state."
- File not found on remove: "Skipping {slug}.md - file not found (may have been manually removed)"

### Git sync errors

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
- Auto-update codex.jbcloud.app stats when commands/agents/skills change
