# MCP Tool Discovery via JSON-RPC

**Extracted:** 2026-02-15
**Context:** When building MCP server management UIs that need to show available tools

## Problem
MCP servers expose tools, but there's no obvious "list tools" REST endpoint. You need to
know the JSON-RPC protocol to query for available tools.

## Solution
MCP uses JSON-RPC 2.0 over HTTP POST. Send a `tools/list` method call to the server URL:

```typescript
async function discoverTools(
  url: string,
  headers?: Record<string, string>
): Promise<{ tools: string[]; toolCount: number } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {},
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) return null;

    const data = await res.json() as {
      result?: { tools?: Array<{ name: string }> };
    };

    const toolList = data?.result?.tools;
    if (!Array.isArray(toolList)) return null;

    const names = toolList.map((t) => t.name).filter(Boolean);
    return { tools: names, toolCount: names.length };
  } catch {
    return null;
  }
}
```

Key details:
- Same URL as the MCP server endpoint (POST, not GET)
- Response shape: `{ result: { tools: [{ name, description, inputSchema }] } }`
- Pass auth headers if server requires authentication
- Use generous timeout (8s) — some servers are slow to respond
- Cache results to avoid repeated discovery calls

## When to Use
- Building MCP server management UI (show tools per server)
- Health checking MCP servers (tool count as capability indicator)
- Any MCP client that needs to enumerate available tools
