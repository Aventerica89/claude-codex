# Stale Config Injection: Always Compute Fresh from Source of Truth

**Extracted:** 2026-02-15
**Context:** Any system where config is cached at creation time but can be modified later by the user

## Problem

Config values written to a cache/KV store at resource creation time become stale when users modify settings after creation. The system keeps reading the old cached value, so changes appear to have no effect.

In VaporForge: `session-mcp:${sessionId}` KV key was written ONCE when a session was created. When users added/removed MCP servers in Settings, the KV key was never updated. Both SSE and WS handlers read this stale key on every chat message, so newly added MCP servers were invisible to the agent.

## Symptoms

- User configures something in settings
- System appears to ignore the change
- Restarting the session "fixes" it (because a new KV key is written)
- Developers add more logging, confirm the config is being read... but it's the OLD config

## Solution

Replace cached reads with fresh computation from the source of truth. Instead of reading a stale `session-mcp:${sessionId}` KV key, compute fresh config from `sandboxConfig` (which is assembled fresh from KV on every request via `assembleSandboxConfig()`).

See `src/api/sdk.ts` lines 551-559 for the VaporForge implementation.

## Key Insight

There's a difference between:
- **Cache at creation** (write-once, read-many): Good for immutable data
- **Cache for performance** (write-through, invalidate on change): Good for mutable data
- **Compute fresh** (read source every time): Good for config that changes unpredictably

MCP server config is user-modifiable at any time, so it must be computed fresh. The old approach was "cache at creation" which is wrong for mutable config.

## When to Use

- User reports "settings don't take effect until restart"
- Config values are written at resource creation AND modifiable after creation
- Any KV/cache pattern where the cached value can become stale
- Debugging "it works after restart but not after changing settings"
