# CF Workers + Hono: WebSocket Path Whitelist Gap

**Extracted:** 2026-02-19
**Context:** Cloudflare Workers using Hono for routing with a custom WebSocket
interceptor in index.ts (the Worker entry point)

## Problem
WebSocket connections to a Hono route return an immediate error (400, 404, etc.)
and the Hono handler's console.logs never fire — even after deploying diagnostics.

The symptom is that `ws.onerror` fires immediately in the browser with no useful
message, and wrangler tail shows the request hitting the worker but none of the
handler's logs appear.

## Root Cause
In CF Workers, code in `index.ts` `fetch()` runs BEFORE the Hono router. A common
pattern is to intercept WebSocket upgrades at the top level:

    if (request.headers.get('Upgrade') === 'websocket') {
      const url = new URL(request.url);
      if (url.pathname === '/api/sdk/ws') {     // <-- ONLY one path whitelisted
        return router.fetch(request, env, ctx);
      }
      // Fallback: DO routing, requires sessionId, returns 400 if missing
    }

Any new WS endpoint added to Hono (e.g. `/api/agency/edit-ws`) falls to the
fallback unless explicitly added to the whitelist. The fallback may look for a
query param (`sessionId`) that the new endpoint doesn't provide — immediate 400.

## Solution
Add every WS path that should be handled by Hono to the whitelist:

    if (url.pathname === '/api/sdk/ws' || url.pathname === '/api/agency/edit-ws') {
      return router.fetch(request, env, ctx);
    }

Or refactor to a list for maintainability:

    const HONO_WS_PATHS = ['/api/sdk/ws', '/api/agency/edit-ws'];
    if (HONO_WS_PATHS.includes(url.pathname)) {
      return router.fetch(request, env, ctx);
    }

## When to Use
- New WS route added to Hono but connection fails immediately
- WS handler's console.logs never appear in wrangler tail
- No error message in browser `ws.onerror` beyond "connection failed"
- Request appears in wrangler tail but nothing inside the handler fires
