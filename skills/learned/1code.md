# Project: 1Code

## Context
- Type: Electron desktop app
- Stack: Electron, React 19, TypeScript, Drizzle ORM, SQLite, tRPC, Bun
- Repo: https://github.com/21st-dev/1Code
- Local: /Users/jb/Documents/1Code
- Status: Installed (v0.0.49)

## What It Does
Claude Code desktop wrapper - local-first AI code assistance with:
- Chat sessions linked to local project folders
- Plan mode (read-only) and Agent mode (full permissions)
- Real-time tool execution visualization
- Session resume via sessionId

## Build Notes

### Prerequisites
- Bun (install via `curl -fsSL https://bun.sh/install | bash`)
- Python
- Xcode Command Line Tools (macOS)

### Build Commands
```bash
bun install
bun run claude:download      # Downloads Claude binary
bun run build
bun run package:mac          # Creates DMG
```

### Troubleshooting

**ARM64 architecture issues (Rosetta):**
```bash
rm -rf node_modules
arch -arm64 bun install
arch -arm64 bun run build
```

**Code signing for local dev:**
```bash
export CSC_IDENTITY_AUTO_DISCOVERY=false
bun run package:mac
```

**Resource fork errors:**
```bash
xattr -cr /path/to/1Code
rm -rf release
```

**Download all Claude binaries:**
```bash
node scripts/download-claude-binary.mjs --all
```

## Documentation
- Synced to: https://docs.jbcloud.app/1code/
- Slug: 1code
