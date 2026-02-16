# Notion Knowledge Base Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace single-type /save-to-notion with a 7-type knowledge management system backed by a new Knowledge Base database in Notion.

**Architecture:** New Notion database with expanded schema (12 properties, 7 content types). Single skill file with argument parsing, auto-detection, and type-specific content templates. Local backup to ~/.claude/contexts/ and ~/.claude/transcripts/.

**Tech Stack:** Notion MCP (claude.ai Notion), Claude Code skills (markdown), git, bash

---

### Task 1: Create Knowledge Base Database in Notion

**Files:**
- None (Notion API only)

**Step 1: Load the create-database tool**

Run: `ToolSearch` with query `+notion create database`
Expected: `mcp__claude_ai_Notion__notion-create-database` tool loaded

**Step 2: Create the Knowledge Base database**

Use `mcp__claude_ai_Notion__notion-create-database` with:
- Parent: Claude Sessions page `301cc9ae-33da-8169-8542-e8379afabe4f`
- Title: "Knowledge Base"
- Schema: Title, Type (select), Project (select), Status (select), Branch (text), Version (text), Git Commit (text), Deploy Status (select), Context Level (select), Tags (multi_select), Date (date)
- All select options as defined in the design doc

**Step 3: Verify by fetching the new database**

Use `notion-fetch` on the returned database URL.
Expected: Schema matches design with all properties and select options.

**Step 4: Record the data_source_id**

Extract the `collection://` URL from the fetch result. This is the data_source_id for all future create-pages calls.

**Step 5: Commit checkpoint note**

Update the design doc with the actual data_source_id:
- File: `docs/plans/2026-02-16-notion-knowledge-base-design.md`
- Replace `TBD` with actual ID
- Commit: `docs: record Knowledge Base data_source_id`

---

### Task 2: Create Local Directories

**Files:**
- Create: `~/.claude/transcripts/` (directory)

**Step 1: Create transcripts directory**

Run: `mkdir -p ~/.claude/transcripts`

**Step 2: Verify**

Run: `ls -la ~/.claude/transcripts/`
Expected: Empty directory exists

---

### Task 3: Write New /save-to-notion Skill

**Files:**
- Modify: `~/.claude/commands/save-to-notion.md`

**Step 1: Write the complete new skill file**

Replace the entire contents of `~/.claude/commands/save-to-notion.md` with the new version that includes:

1. **Frontmatter**: Updated description and argument-hint
2. **Argument parsing**: Parse `$ARGUMENTS` for type (first word) and optional title suffix
3. **Auto-detection logic**: Conversation scanning signals table
4. **Knowledge Base data_source_id**: The ID from Task 1
5. **Project directory mapping**: All 11 projects
6. **Auto-populated fields**: Git branch, version, commit, tags extraction
7. **7 content templates**: session, plan, table, decision, memory, reference, verbatim
8. **Local backup step**: Write to contexts/ (always) and transcripts/ (verbatim only)
9. **Confirmation output**: Type-aware success message
10. **Updated database IDs**: Knowledge Base replaces Sessions

The skill file structure:

```
---
description: Save context to Notion Knowledge Base. Supports 7 types: session, plan, table, decision, memory, reference, verbatim.
argument-hint: "[type] [optional title]"
---

# Save to Notion Knowledge Base

## Arguments
Parse $ARGUMENTS: first word = type, rest = title suffix

## Type Detection (if no type given)
[auto-detection signal table]

## Knowledge Base Database
data_source_id: {from Task 1}
Parent: Claude Sessions (301cc9ae-33da-8169-8542-e8379afabe4f)

## Workflow
### Step 1: Determine type
### Step 2: Gather context (git, version, etc.)
### Step 3: Generate content using type-specific template
### Step 4: Create Notion page
### Step 5: Save local backup
### Step 6: Confirm

## Content Templates
[All 7 templates from design doc]

## Project Mapping
[All 11 projects]

## Important Notes
[Security, completeness, curating rules]
```

**Step 2: Verify skill loads**

Run: `/save-to-notion --help` (or just check the file renders)
The skill should parse correctly when invoked.

**Step 3: Commit**

```bash
git -C ~/claude-codex add commands/save-to-notion.md
git -C ~/claude-codex commit -m "feat: overhaul /save-to-notion with 7-type Knowledge Base"
```

---

### Task 4: Test Session Save (default type)

**Step 1: Run /save-to-notion with no args**

This should auto-detect "session" type, gather git context from current directory, create a page in the Knowledge Base with all fields populated.

**Step 2: Verify in Notion**

Fetch the created page. Confirm:
- Title follows `{Project} | Session: {description}` format
- All properties populated (Type, Project, Status, Branch, Version, Git Commit, Date)
- Content follows session template
- Local backup exists at `~/.claude/contexts/`

**Step 3: Test explicit session type**

Run: `/save-to-notion session Test Session Save`
Verify title includes "Test Session Save" suffix.

---

### Task 5: Test Plan Save

**Step 1: Run /save-to-notion plan**

Since we just designed the Knowledge Base system, there's a real plan to save.

**Step 2: Verify**

- Title: `{Project} | Plan: {description}`
- Type property: "plan"
- Content includes Objective, Architecture, Phases sections
- Tables preserved completely

---

### Task 6: Test Decision Save

**Step 1: Run /save-to-notion decision**

Save the architecture decision from this session (Approach B: New Knowledge Base DB).

**Step 2: Verify**

- Title: `{Project} | Decision: {description}`
- Type: "decision"
- Content includes Options Considered table, Chosen Approach section

---

### Task 7: Update Memory Files and References

**Files:**
- Modify: `~/.claude/projects/-Users-jb/memory/MEMORY.md`
- Modify: `~/.claude/rules/notion-autosave.md` (via claude-codex symlink)

**Step 1: Update MEMORY.md**

Add Knowledge Base database ID and updated workspace structure under Notion section.

**Step 2: Update notion-autosave.md rule**

Update to reference Knowledge Base instead of Sessions DB. Update the /save-to-notion description.

**Step 3: Commit**

```bash
git -C ~/claude-codex commit -am "docs: update memory and rules with Knowledge Base IDs"
```

---

### Task 8: Push to GitHub

**Step 1: Push all commits**

```bash
git -C ~/claude-codex push origin main
```

---

## Execution Notes

- Tasks 1-3 are setup (create DB, dirs, skill file)
- Tasks 4-6 are verification (test each type)
- Tasks 7-8 are cleanup (update references, push)
- Commit after each task for iPad/Termius safety
- The skill file is the main deliverable (~300 lines of markdown)
