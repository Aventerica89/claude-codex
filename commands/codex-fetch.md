---
description: Fetch latest claude-codex configuration from GitHub (browser-safe)
---

# Codex Fetch Command

Fetches the latest claude-codex configuration from GitHub and displays it. Useful for browser sessions or viewing remote config without git.

## Arguments

Parse `$ARGUMENTS` for optional file to fetch:
- No arguments - Fetch main CLAUDE.md
- `commands/<name>` - Fetch specific command
- `skills/<name>` - Fetch specific skill
- `rules/<name>` - Fetch specific rule
- `all` - Show directory listing and structure

## Behavior

1. **Determine GitHub URL**:
   - Base: `https://raw.githubusercontent.com/Aventerica89/claude-codex/main/`
   - Default file: `CLAUDE.md`
   - If argument provided: append to base URL

2. **Fetch content**:
   - Use WebFetch tool with the GitHub raw URL
   - Prompt: "Return the complete file content exactly as-is"

3. **Display result**:
   - Show file path
   - Show file size/line count
   - Display full content
   - Provide link to view on GitHub

4. **Error handling**:
   - If file not found (404): "File not found in codex repository"
   - List similar/available files
   - Suggest correct path

## Example Flows

### Fetch main config

```
User: /codex-fetch

Claude: Fetching latest CLAUDE.md from codex...

        [Displays full CLAUDE.md content]

        Source: https://github.com/Aventerica89/claude-codex/blob/main/CLAUDE.md
        Use /sync to pull these changes locally (CLI only)
```

### Fetch specific command

```
User: /codex-fetch commands/sync.md

Claude: Fetching commands/sync.md from codex...

        [Displays sync.md content]

        Source: https://github.com/Aventerica89/claude-codex/blob/main/commands/sync.md
```

### Fetch specific skill

```
User: /codex-fetch skills/learned/nextjs-security-audit-checklist.md

Claude: Fetching skills/learned/nextjs-security-audit-checklist.md...

        [Displays skill content]
```

### Browse structure

```
User: /codex-fetch all

Claude: Fetching codex repository structure...

        Available files:
        - CLAUDE.md (main config)
        - README.md (documentation)

        Directories:
        - commands/ (34 files)
        - skills/ (12+ learned patterns)
        - skills/learned/ (detailed patterns)
        - agents/ (specialized agents)
        - rules/ (modular guidelines)
        - data/ (pattern libraries)

        Use /codex-fetch <path> to view specific file
        Example: /codex-fetch commands/deploy-env.md
```

### File not found

```
User: /codex-fetch commands/nonexistent.md

Claude: File not found: commands/nonexistent.md

        Available commands:
        - sync.md
        - codex-fetch.md
        - deploy-env.md
        - new-project.md
        ...

        Use /codex-fetch commands/<name>.md
```

## Implementation

Use WebFetch tool:
```
url: https://raw.githubusercontent.com/Aventerica89/claude-codex/main/<path>
prompt: "Return the complete file content"
```

For directory listing, fetch the GitHub API:
```
url: https://api.github.com/repos/Aventerica89/claude-codex/contents/<path>
prompt: "List all files and directories"
```

## Use Cases

- **Browser sessions**: View codex config in Claude.ai Projects
- **Quick reference**: Check command syntax without opening files
- **Verification**: See what's in the remote repo before syncing
- **Discovery**: Browse available commands, skills, and patterns
- **Team sharing**: Share specific patterns without git access
- **Documentation**: View codex structure and organization

## Browser-Specific Benefits

This command works perfectly in browser because:
- No git required - uses HTTPS fetch
- No file system access needed
- Read-only operation - safe for web context
- Can copy/paste configs into Projects knowledge
- Instant access to latest remote version

## Companion to /sync

- `/sync` - Bidirectional git sync (CLI only)
- `/codex-fetch` - Read-only remote fetch (works everywhere)

Use `/codex-fetch` when:
- In browser (no git available)
- Just want to read, not modify
- Checking remote before syncing
- Sharing configs with others
