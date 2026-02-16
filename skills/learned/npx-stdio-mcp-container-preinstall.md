# npx-Based MCP Servers Fail Silently in Containers

**Extracted:** 2026-02-15
**Context:** Any containerized environment running Claude SDK with stdio MCP servers that use npx

## Problem

When MCP servers are configured with `command: "npx"` and `args: ["-y", "@package/name"]`, the Claude SDK tries to spawn the process via npx. In containerized environments (CF Sandboxes, Docker, etc.), npx attempts to download the package at runtime. This fails silently because:

1. Container network may be slow or restricted
2. npm registry download times out before the SDK's MCP init timeout
3. The SDK silently drops MCP servers that fail to initialize -- no error, no log, they just vanish
4. The agent reports fewer MCP servers than were configured, with no indication why

This creates a maddening debugging experience: config looks correct, logs show servers being passed, but the agent can't see them.

## Root Cause Chain

```
User configures MCP server (command: npx, args: [-y, @gongrzhe/server-gmail-autoauth-mcp])
  -> Worker passes config as CLAUDE_MCP_SERVERS env var (correct)
  -> claude-agent.js parses and passes as options.mcpServers (correct)
  -> SDK calls npx to spawn the process
  -> npx can't find package locally, starts npm download
  -> Download times out (container network, or just slow)
  -> SDK catches the spawn failure silently
  -> MCP server is dropped from the agent's available servers
  -> Agent lists 7 of 15 configured servers with no errors
```

## Solution

Pre-install npx packages globally before the agent process spawns. In the container setup/refresh step, scan MCP config for `command === 'npx'` servers, extract package names from args, and run `npm install -g <packages> --prefer-offline` with a timeout. After global install, npx finds the package locally and starts it instantly.

See `src/sandbox.ts:refreshMcpConfig()` for the VaporForge implementation.

## Diagnostic Pattern

Add transport-type logging before passing MCP config to SDK. Log each server name with its transport type (stdio vs http) and command. This reveals the split: HTTP servers work, npx stdio servers don't. Pre-installed node stdio servers (like a local script) DO work -- confirming the issue is npx download, not stdio transport.

## When to Use

- Configuring stdio MCP servers in containerized environments
- Agent reports fewer MCP servers than configured
- HTTP MCP servers work but stdio servers don't
- Any npx-based tool that needs to run in a container without interactive network
- Debugging "silent MCP server failures" in Claude SDK
