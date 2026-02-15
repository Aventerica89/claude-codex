# Cloudflare Sandbox Streaming: WebSocket Bypass for execStream() Buffering

**Extracted:** 2026-02-15
**Context:** Any Cloudflare Sandbox application that needs real-time streaming output from a long-running process inside a container.

## Problem

Cloudflare Sandbox `execStream()` returns SSE-over-RPC that **buffers internally until the child process exits**. This is unfixable — it's inside Cloudflare's platform infrastructure. The result: zero progressive output for processes that produce many small lines (like AI SDK streaming responses). Users see nothing for 30-60+ seconds, then the entire output dumps at once.

There are actually TWO layers of buffering:

1. **Node.js stdout block-buffering**: When stdout is piped (not TTY — always true in containers), `console.log()` → `process.stdout.write()` uses a ~16KB block buffer. Fix: `fs.writeSync(1, data + '\n')` — synchronous, unbuffered write to fd 1.

2. **CF Sandbox execStream() SSE/RPC buffering**: Even after fixing #1, the SSE/RPC transport inside Cloudflare holds output until process exit. **This cannot be fixed.** Must be bypassed entirely.

## Solution

Use `sandbox.wsConnect(request, port)` to establish a **direct WebSocket tunnel** from the Worker to a port inside the container. This bypasses the entire execStream/SSE/RPC pipeline.

### Architecture

```
BEFORE (broken):
  Browser → Worker SSE → execStream(cmd) → SSE/RPC [BUFFERED] → stdout [BUFFERED]

AFTER (working):
  Browser → Worker WS → sandbox.wsConnect(req, 8765) → WS server → stdout lines as WS frames
```

### Implementation Components

1. **WS server in container** (`ws-agent-server.js`): Listens on port 8765, reads a context file (`/tmp/vf-pending-query.json`) written by the Worker, spawns the target process, and pipes every stdout line as an individual WS frame.

2. **Worker WS handler**: Authenticates the WS upgrade request (JWT via query param — WS can't carry custom headers), starts the WS server in the container, writes the context file with secrets/config, then proxies the connection via `sandbox.wsConnect(request, 8765)`.

3. **Frontend async generator**: Opens WS connection, uses a push/pull queue pattern to yield parsed messages from WS frames. POST `/persist` endpoint saves the full response text after stream completes (can't use `waitUntil` with WS).

### Key Details

- **One WS connection per message**: Fresh auth and config each time. No persistent connection.
- **Context file pattern**: Worker writes secrets to `/tmp/vf-pending-query.json` via `sandbox.writeFile()`. Container WS server reads it, deletes it immediately, then spawns the process with those env vars. Secrets never persist on disk.
- **WS auth via query param**: `wss://host/api/sdk/ws?token=JWT` — validated server-side before upgrade.
- **Docker cache invalidation**: After changing Dockerfile, must run `docker image prune -a -f && docker builder prune -a -f` or the deploy will say "Image already exists remotely, skipping push" because cached layers produce the same hash.

## Example

```javascript
// Worker: proxy WS to container
app.get('/api/sdk/ws', async (c) => {
  const token = new URL(c.req.url).searchParams.get('token');
  const user = await authService.getUserFromToken(token);

  await sandboxManager.startWsServer(sandboxId);
  await sandboxManager.writeContextFile(sandboxId, { prompt, env: secrets });
  return sandboxManager.wsConnectToSandbox(sandboxId, c.req.raw);
});

// Container WS server: pipe stdout as WS frames
child.stdout.on('data', (chunk) => {
  for (const line of chunk.toString().split('\n').filter(Boolean)) {
    ws.send(line);  // Each line = one WS frame = instant delivery
  }
});

// Frontend: async generator from WS
async function* streamFromWs(url) {
  const ws = new WebSocket(url);
  const queue = [];
  let resolve;
  ws.onmessage = (e) => { /* push parsed data to queue */ };
  while (true) {
    const item = queue.shift() ?? await new Promise(r => resolve = r);
    if (item.done) break;
    yield item.value;
  }
}
```

## When to Use

- Any time you need real-time streaming from a process running inside a Cloudflare Sandbox container
- When `execStream()` output appears buffered or delayed
- When building chat/AI applications on CF Sandboxes that need progressive text rendering
- Anytime you see "nothing for N seconds then everything at once" in sandbox output
