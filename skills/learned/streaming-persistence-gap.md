# Streaming Endpoint Persistence Gap

**Extracted:** 2026-02-08
**Context:** Cloudflare Workers + KV + SSE streaming architecture

## Problem
Chat messages don't survive browser refresh even though the app has message persistence infrastructure (KV storage, history endpoint). The streaming endpoint that the client ACTUALLY uses for chat never writes messages to the persistence layer, while non-streaming endpoints that DO persist are unused by the client.

## Solution
1. Identify which endpoint the client actually calls for chat (trace from UI -> API call)
2. Check if that endpoint writes to persistence (KV, DB, etc.)
3. Add persistence writes: user message BEFORE stream starts, assistant message AFTER stream completes
4. Assistant message write goes in waitUntil/finally block so it doesn't block the response
5. Use same key pattern as the history read endpoint expects

## Example
```typescript
// BEFORE streaming -- persist user message immediately
const userMessageId = crypto.randomUUID();
await env.KV.put(
  `message:${sessionId}:${userMessageId}`,
  JSON.stringify({
    id: userMessageId,
    sessionId,
    role: 'user',
    content: prompt,
    timestamp: new Date().toISOString()
  }),
  { expirationTtl: 7 * 24 * 60 * 60 }
);

// AFTER streaming completes (in waitUntil) -- persist assistant message
if (fullText) {
  const assistantMessageId = crypto.randomUUID();
  await env.KV.put(
    `message:${sessionId}:${assistantMessageId}`,
    JSON.stringify({
      id: assistantMessageId,
      sessionId,
      role: 'assistant',
      content: fullText,
      timestamp: new Date().toISOString()
    }),
    { expirationTtl: 7 * 24 * 60 * 60 }
  );
}
```

## When to Use
- Chat/messages don't survive page refresh
- Streaming endpoint exists alongside non-streaming endpoints
- History endpoint reads from persistence but finds nothing
- Client sends messages through a different endpoint than expected

## Related Patterns

### Build Pipeline Trap
Running only `build:ui` leaves stale code in `dist/`. Must run `build:ui && build:merge` because Wrangler deploys from `dist/`, not `ui/dist/`. The merge script copies the Vite output to the Wrangler assets directory.

### Agent Swarm Debugging
Used a 3-agent team (server-investigator, client-tracer, bundle-verifier) to find 6 bugs in parallel. The server investigator found the most critical issues. Pattern: split investigation by layer (server/client/deployment).
