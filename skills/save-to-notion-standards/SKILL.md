---
name: save-to-notion-standards
description: Register a command or workflow convention in the Notion Standards DB. Shortcut for /save-to-notion standards. Use after finalizing a new command pattern or system convention.
---

# Save Convention to Notion Standards DB

Save a command or workflow convention to the Claude Code Standards database with type `Convention`.

## How to Invoke

Run the `/save-to-notion` command with `standards` as the type argument and the subject from `$ARGUMENTS`:

```
/save-to-notion standards $ARGUMENTS
```

Example: `/save-to-notion standards save-to-notion` registers the save-to-notion convention.

## What Gets Saved

- Routes to the **Standards DB** (not Knowledge Base)
- Archives any existing `Group: Latest` page for the same subject
- Creates a new page with `Group: Latest, Version: N+1`
- Content: formal spec — what the standard is, when to use it, exact format/rules, examples, anti-patterns

## Note

This is the same as running `/register-convention` but focused only on the Notion save step.
