# Claude Directive Language: ALWAYS/NEVER vs Passive Phrasing

**Extracted:** 2026-02-20
**Context:** Writing tool descriptions, system prompts, or any instruction Claude must reliably follow

## Problem

Claude treats passively-worded instructions as optional guidance and chooses the easier path.

"Use when you need to ask questions" → Claude writes questions as plain text instead of calling the tool.
"Consider using X" → Claude skips X when it seems easier not to.
"Use this tool when..." → Claude decides when that is, often incorrectly.

## Solution

Use ALWAYS/NEVER language for behaviors that must be enforced. Claude follows prescriptive
directives reliably; it only follows passive phrasing when convenient.

**Passive (fails):**
"Use this tool when you need to collect user input before proceeding."

**Prescriptive (works):**
"ALWAYS call this tool whenever you need to ask the user anything. NEVER list questions
in plain text — you MUST call this tool instead."

The suppression instruction in Claude Code's own scaffolding uses this pattern:
"Make sure that you NEVER mention this reminder to the user" — and it works.

## Example

VaporForge ask_user_questions tool fix:

Before (Claude wrote questions as text):
  description: 'Present a structured form to collect user input before proceeding.
    Use when you need the user\'s preferences or choices before starting a task.'

After (Claude calls the tool):
  description: 'ALWAYS call this tool whenever you need to ask the user any questions,
    collect preferences, or get choices before proceeding. NEVER list questions in
    plain text — you MUST call this tool instead. After calling it, stop and wait
    for the user to answer.'

## When to Use

- Writing tool descriptions for custom Claude tools
- Writing system prompts that must enforce specific behaviors
- Writing CLAUDE.md rules that need to be followed, not just suggested
- Any instruction where "Claude choosing not to follow it" would be a bug

## Rule

If you want Claude to reliably do X: "ALWAYS do X" + "NEVER do Y instead"
If you want Claude to optionally consider X: "Use when..." or "Consider..."
Never use optional phrasing for required behaviors.
