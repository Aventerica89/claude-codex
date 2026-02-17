# CF Sandbox: No Concurrent exec() Calls

**Extracted:** 2026-02-17
**Context:** Cloudflare Sandbox SDK container operations

## Problem

Cloudflare Sandbox SDK cannot handle concurrent `sandbox.exec()` or `sandbox.writeFile()` calls via `Promise.all`. The RPC layer fails silently or times out, causing WebSocket connections to fail entirely.

## Solution

Always run container operations sequentially. Only parallelize KV reads and other non-container operations.

```typescript
// WRONG: Concurrent container ops
await Promise.all([
  sandbox.exec('command1'),
  sandbox.exec('command2'),
  sandbox.writeFile('/path', content),
]);

// CORRECT: Sequential container ops
await sandbox.exec('command1');
await sandbox.exec('command2');
await sandbox.writeFile('/path', content);
```

## Additional Gotcha: ss command unavailable

The `ss` (socket statistics) tool is NOT available in CF Sandbox minimal Ubuntu containers. Using it in polling loops generates many failing exec calls. Use `pgrep` instead:

```bash
# WRONG: ss not available
ss -tln | grep :8765

# CORRECT: pgrep works
pgrep -f ws-agent-server.js
```

## When to Use

- Any time you run multiple sandbox SDK operations
- When debugging "WebSocket connection failed" errors after code changes
- When adding new container setup steps to VaporForge
