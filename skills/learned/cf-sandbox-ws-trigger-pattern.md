# Cloudflare Sandbox WS-Agent Context File + Connection Trigger

**Extracted:** 2026-02-18
**Context:** VaporForge / any system using ws-agent-server.js pattern

## Problem

Agency edits (and any feature using the WS agent) appear to succeed but nothing
actually happens — no files change, no agent output, complete silent no-op.

Root cause: `writeContextFile()` alone does NOT invoke the agent.
The context file sits on disk unread. The WS server only starts processing
when a WebSocket connection arrives.

## Solution

The two-phase handshake:
1. `writeContextFile(sessionId, {...})` — writes /tmp/vf-pending-query.json
2. `wsConnectToSandbox(sessionId, request)` — THIS is the actual trigger

Both must happen in sequence. The WS upgrade IS the query invocation.
The server reads the context file ~150ms after the WS connection opens.

## Example

WRONG — writes context but never triggers agent:
  await sandboxManager.writeContextFile(sessionId, contextData);
  return c.json({ success: true }); // agent never runs

CORRECT — context file + WS connection:
  await sandboxManager.startWsServer(sessionId);
  await sandboxManager.writeContextFile(sessionId, contextData);
  return sandboxManager.wsConnectToSandbox(sessionId, request); // triggers agent

WS endpoint must use inline token auth (WS upgrades can't carry Authorization headers):
  app.get('/api/my-feature/ws', async (c) => {
    const token = new URL(c.req.url).searchParams.get('token');
    const user = await authService.getUserFromToken(token);
    return handleMyFeatureWs(c.env, c.req.raw, user, sandboxManager);
  });

## Diagnosis

If a feature succeeds but produces no effect in the container:
1. Check if the backend opens a WS connection (not just writes a file)
2. Check if the route is registered BEFORE the protected middleware
3. Verify startWsServer is called before writeContextFile

## When to Use

Any time you're adding a new feature that invokes the claude agent in a
VaporForge container. Applies to: agency edits, custom agent endpoints,
any feature that needs the WS agent pipeline.
