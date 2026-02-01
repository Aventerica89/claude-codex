# Project: aerospace-studio

**Last Session:** 2026-01-31
**Status:** In Progress (paused)
**Repo:** https://github.com/Aventerica89/aerospace-studio

## Context
- Type: Desktop utility / visual config tool
- Stack: Next.js 16, TypeScript, Tailwind CSS, @dnd-kit
- Purpose: Visual workspace manager for AeroSpace (macOS tiling WM)

## Features Implemented
- [x] Workspace grid with drag-drop
- [x] Multi-monitor support
- [x] Profile save/load
- [x] Config export to ~/.aerospace.toml
- [x] Quick actions (layouts, balance, etc.)
- [x] Keybinds help modal
- [x] Workspace selection for targeted actions

## Key Decisions
- **@dnd-kit over react-dnd**: Better TypeScript support, smaller bundle
- **ID Prefixing**: `win:`, `drop:`, `ws:`, `monitor:` to avoid collisions
- **Vitest for testing**: Fast, native ESM support

## Known Issues (To Fix Next Session)
- Drag-drop still has UX issues - needs more refinement
- Window reordering within workspace not implemented
- Consider replacing @dnd-kit with simpler solution

## Patterns Learned
See: `~/.claude/skills/learned/dnd-kit-nested-droppables.md`

## Next Session
- Start with: Test drag-drop thoroughly after fixes
- Consider: Simpler drag-drop approach or custom implementation
- Priority: Get basic functionality stable before adding features

## Files Structure
```
/Users/jb/projects/aerospace-studio/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main UI
│   │   └── api/aerospace/        # CLI integration
│   ├── components/
│   │   ├── WorkspaceGrid.tsx     # Drag-drop grid
│   │   ├── WorkspaceCard.tsx     # Individual workspace
│   │   ├── AppChip.tsx           # Window chips
│   │   ├── QuickActions.tsx      # Layout buttons
│   │   ├── ProfileBar.tsx        # Save/load profiles
│   │   └── KeybindsHelp.tsx      # Floating help
│   ├── hooks/useAerospace.ts     # State management
│   └── types/aerospace.ts        # Type definitions
```

## Commands
```bash
cd ~/projects/aerospace-studio
npm run dev      # Start dev server
npm run test     # Run vitest
npm run build    # Production build
```
