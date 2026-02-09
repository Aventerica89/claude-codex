# Chrome MCP Tab Targeting

## Problem
Two Chrome MCP servers exist (`chrome-devtools` and `claude-in-chrome`) with separate tab/page contexts. Screenshots and actions can target the wrong tab if using the wrong server.

## Key Difference
- **chrome-devtools**: Has its own page list (`list_pages`/`select_page`). Can become stale (`about:blank`) if not refreshed.
- **claude-in-chrome**: Uses tab IDs from `tabs_context_mcp`. More reliable for tab management.

## Pattern: Always Use claude-in-chrome for Navigation + Screenshots

1. Get tab context first: `tabs_context_mcp`
2. Create new tab if needed: `tabs_create_mcp`
3. Navigate: `navigate` with tabId
4. Screenshot: `computer` action=screenshot with tabId

```
tabs_context_mcp -> tabs_create_mcp -> navigate(url, tabId) -> computer(screenshot, tabId)
```

## Gotcha
- `chrome-devtools.take_screenshot` captures whatever page devtools is connected to (may be stale)
- `claude-in-chrome.computer(screenshot)` captures the specified tabId (reliable)
- Always prefer `claude-in-chrome` computer tool for screenshots

## When chrome-devtools is Better
- Performance tracing (`performance_start_trace`)
- Network request inspection (`list_network_requests`)
- Console message reading (`list_console_messages`)
- DOM evaluation (`evaluate_script`)
