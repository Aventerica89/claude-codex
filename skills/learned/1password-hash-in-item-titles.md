# 1Password op:// References Break on # in Item Titles

**Extracted:** 2026-02-23
**Context:** Using 1Password MCP tools or op CLI with item titles containing #

## Problem

Item titles like `#clarity / TODOIST_CLIENT_ID` cannot be used in `op://` secret references. The `#` character is invalid in the path segment:

```
op://App Dev/#clarity / TODOIST_CLIENT_ID/credential
# → Error: invalid character in secret reference: '#'
```

This also affects `op inject` in `.env.local.tpl` files.

## Solution

Use the item's UUID instead of its title when the title contains `#`:

```bash
# Find the item ID
op item list --vault "App Dev" --format json | jq '.[] | select(.title | contains("clarity")) | {id, title}'

# Use ID in op:// reference
op://App Dev/oklogquw3ohhdzoktpfznimajy/credential

# Or retrieve directly via MCP
mcp__1p__get_api_key with itemId: "oklogquw3ohhdzoktpfznimajy"
```

For `.env.local.tpl`, either rename the 1Password item to remove `#`, or use the UUID:
```
TODOIST_CLIENT_ID={{ op://App Dev/oklogquw3ohhdzoktpfznimajy/credential }}
```

## When to Use

- `op inject` or `deploy_env_vars` fails with "invalid character in secret reference"
- Item titles follow the `#project / VAR_NAME` convention (standard in this workspace)
- Deploying env vars for any JB Cloud project using the `#project / ...` naming convention
