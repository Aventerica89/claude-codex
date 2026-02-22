---
name: save-to-notion-decision
description: Save an architectural decision record (ADR) to Notion Knowledge Base. Shortcut for /save-to-notion with type=decision. Use after choosing between approaches.
---

# Save Decision to Notion

Save an architectural decision record to the Notion Knowledge Base with type `decision`.

## How to Invoke

Run the `/save-to-notion` command with `decision` as the type argument, plus the decision subject from `$ARGUMENTS`:

```
/save-to-notion decision $ARGUMENTS
```

Example: if `$ARGUMENTS` is "WebSocket vs SSE", the title becomes `{Project} | Decision: WebSocket vs SSE`.

## What Gets Saved

Follow the `decision` template from the save-to-notion command:
- Decision (one sentence summary)
- Context (why this decision was needed)
- Options Considered (all options with pros/cons)
- Chosen Approach (with full reasoning)
- Consequences (what this means going forward)
