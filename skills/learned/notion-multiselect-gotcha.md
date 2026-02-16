# Notion Multi-Select Field Gotcha

## Pattern: error_resolution
## Project: All (Notion MCP)

## Problem

The Notion MCP `notion-create-pages` tool rejects multi_select field values that are passed as comma-separated strings.

```json
// WRONG - Notion rejects this
"Tags": "navigation, changelog, dark-mode"

// ALSO WRONG - comma-separated in one string
"Tags": "UI/UX, Database, React"
```

## Why It Fails

Notion multi_select fields only accept **predefined values** from the database schema. The MCP tool does not auto-create new options or parse comma-separated strings.

## Solution

Use a single predefined value that exists in the target database:

```json
// CORRECT - single predefined value
"Tags": "UI/UX"
```

Or check which values are predefined in the database before setting them.

## When to Apply

- Any time you create or update a Notion page with multi_select properties via MCP
- Especially in `/save-to-notion` or other automated Notion workflows
- When Tags, Categories, or any multi_select field is involved
