# Debugging: When Diagnostic Logs Never Fire

**Extracted:** 2026-02-19
**Context:** Debugging any middleware/handler in a layered system (CF Workers,
Express, Hono, etc.) where deployed diagnostic logs don't appear

## Problem
You add console.log diagnostics to a function and deploy. The function should be
running, but the logs never appear — not in wrangler tail, not in any log sink.

This is easy to misinterpret as a log transport problem (sampling, buffering,
log level filtering) and waste time trying to fix the logging infrastructure.

## Solution
When diagnostic logs never fire, the function was never called. Don't debug
deeper into the function — debug earlier in the stack.

**Debugging steps:**
1. Add a log at the very entry point of the system (e.g. `index.ts fetch()`)
   to confirm the request is arriving at all
2. Trace the request path step by step from entry to the handler
3. Look for early-exit conditions: auth checks, URL pattern matches, fallback
   branches, middleware that short-circuits the chain
4. The gap between "last log that fires" and "first log that doesn't" is where
   the request is being intercepted

## Example
Agency WS handler had `console.log('[agency/ws] called')` as first line.
Log never appeared despite request reaching the Worker. Root cause: `index.ts`
WS interceptor returned `400 Missing sessionId` before the Hono router ran.
The handler was never invoked.

Signal: wrangler tail showed the WS upgrade request arriving, but no `[agency/ws]`
logs. Adding a log to `index.ts` immediately before the Hono router call would
have pinpointed the interception in one step.

## When to Use
- Deployed diagnostic logs don't appear despite the feature being invoked
- Tempted to blame log sampling, buffering, or transport issues
- Function "should" be running based on the request type/path
- Adding more logs inside the function still shows nothing
