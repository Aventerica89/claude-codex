# CF Sandbox: Port-Bound Polling Before wsConnect

**Extracted:** 2026-02-18
**Context:** Cloudflare Sandbox container services that must be running before proxying a WebSocket

## Problem

`sandbox.wsConnect(request, PORT)` throws if the port isn't actually bound yet.
A fixed wait (e.g., 300ms setTimeout) after starting a process only ensures the process
*exists*, not that its port is *listening*. The process may be starting up but not yet accepting connections.

This caused `AgencyEditor.tsx: WebSocket connection failed` — Worker returned 500 because
`wsConnect` threw before the WS agent server had bound port 8765.

## Solution

Replace fixed wait + pgrep check with a TCP probe loop using bash `/dev/tcp`:

```bash
# Test if port 8765 is bound
(echo > /dev/tcp/localhost/8765) 2>/dev/null && echo "BOUND" || echo "NOT_BOUND"
```

In TypeScript (sandbox context):

```typescript
// Start the process
await sandboxInstance.runCommand('nohup node /opt/server.js > /tmp/server.log 2>&1 &');

// Poll until port is actually BOUND
let bound = false;
for (let i = 0; i < 20; i++) {
  await new Promise((r) => setTimeout(r, 500));
  const portCheck = await sandboxInstance.runCommand(
    '(echo > /dev/tcp/localhost/8765) 2>/dev/null && echo "BOUND" || echo "NOT_BOUND"'
  );
  if (portCheck.stdout?.includes('BOUND')) {
    bound = true;
    break;
  }
}
if (!bound) throw new Error('Server failed to bind port after 10s');
```

20 polls × 500ms = 10 seconds max wait. Exits immediately on success.

## Why `/dev/tcp` Works

`/dev/tcp/HOST/PORT` is a bash built-in that opens a TCP connection.
- Port LISTENING → connection succeeds → stdout: "BOUND"
- Port NOT listening → connection fails → stdout: "NOT_BOUND"

No extra tools needed — works in minimal Alpine/Debian containers.

## When to Use

Anytime you:
- Start a background server in a CF Sandbox container
- Then immediately proxy to it via `sandbox.wsConnect(request, port)` or `sandbox.exposePort()`

Applies to: ws-agent-server.js, Astro dev server, any HTTP/WS server started with `nohup ... &`.

## Anti-Pattern (Don't Do This)

```typescript
// BAD: Fixed wait — process may exist but port not bound
await sandboxInstance.runCommand('nohup node server.js &');
await new Promise((r) => setTimeout(r, 300));
// wsConnect here may throw!
```

## Related

- VaporForge `src/sandbox.ts`: `startWsServer()` — fixed in commit `431ff3c`
- Also applies to `kickoffAgencySetup()` Astro dev server ready-check
