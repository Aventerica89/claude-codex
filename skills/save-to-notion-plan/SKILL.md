---
name: save-to-notion-plan
description: Save an implementation plan to Notion Knowledge Base. Shortcut for /save-to-notion with type=plan. Use when completing or pausing work on a multi-phase plan.
---

# Save Plan to Notion

Save the current implementation plan to the Notion Knowledge Base with type `plan`.

## How to Invoke

Run the `/save-to-notion` command with `plan` as the type argument, plus any title suffix from `$ARGUMENTS`:

```
/save-to-notion plan $ARGUMENTS
```

If `$ARGUMENTS` is empty, the title will be auto-generated from the plan context.

## What Gets Saved

Follow the `plan` template from the save-to-notion command:
- Objective
- Architecture
- Implementation Phases (ALL phases, complete — never truncate)
- Dependencies and Risks
- Success Criteria
