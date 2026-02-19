# External HTTP MCP Injection Anti-Pattern

**Extracted:** 2026-02-18
**Context:** Injecting MCP server configs into Claude SDK query calls in VaporForge

## Problem

When `CLAUDE_MCP_SERVERS` includes an external HTTP MCP (e.g., `https://mcp.docs.astro.build/mcp`),
the Claude SDK tries to connect to it during the query call. If the server is unreachable,
rate-limiting, or down — the **entire query silently fails**. No error surfaces to the frontend.
The WS stream just closes with no output.

This caused "commands do nothing" in VaporForge Agency Mode after adding an Astro docs MCP.

## Solution

Only inject MCP servers into agent environments when they are:
1. **Guaranteed available** — local stdio servers in the container, or known-reliable HTTP endpoints
2. **Tested for reachability** before injection (ping/health check first)
3. **Non-critical** — query should be able to continue even if MCP fails

For critical paths like agency edits, embed knowledge directly in the prompt instead.

```typescript
// BAD: External HTTP MCP that may be unreachable
env: {
  CLAUDE_MCP_SERVERS: JSON.stringify({
    astro: { type: 'http', url: 'https://mcp.docs.astro.build/mcp' }
  })
}

// GOOD: No external MCP — put needed context in the prompt
env: {
  // Prompt already has file path + Astro-specific instructions
}
```

## When to Use

- Anytime you add a new MCP server to an agent's environment
- Before adding any external HTTP MCP: test if reliably available (health check endpoint)
- For critical paths (agency edits, main chat): prefer local stdio MCPs or no MCPs
- Optional enhancement MCPs: wrap in try/catch and continue without them

## Related

- VaporForge `src/api/agency.ts`: `handleAgencyEditWs()` — fixed in commit `798bc17`
- Same risk applies to any HTTP MCP in `CLAUDE_MCP_SERVERS` — one bad server blocks all
