# MEMORY.md Top-Loading Rule

## Pattern

MEMORY.md auto-loads into every Claude Code session — but only the **first 200 lines**. Anything past line 200 is silently cut off.

## Rules

1. **Global conventions (OAuth rule, 1Password, Changelog standard) must live in lines 1-30** — they apply to every project and must always be visible
2. **Project-specific detail belongs in separate topic files** — link from MEMORY.md with `Detail file: xxx.md`
3. **VaporForge version history is the biggest offender** — it's ~180 lines and pushes everything else past the limit. Move old versions to `vaporforge-history.md`
4. **When adding something new and important, insert near the top** — not appended at the bottom

## Symptom

If you see "MEMORY.md is X lines (limit: 200). Only the first 200 lines were loaded." in the system reminder — conventions below line 200 are invisible to that session.

## Fix Applied (2026-02-18)

Moved these to top (lines 1-25):
- Anthropic OAuth Rule
- Changelog Standard
- 1Password Convention

These are globally critical and must survive every session.

## Ongoing Maintenance

Run this periodically to check what's visible:
```bash
head -200 ~/.claude/projects/-Users-jb/memory/MEMORY.md | tail -20
```
If the last visible line is still deep in VaporForge version history, the file needs restructuring.
