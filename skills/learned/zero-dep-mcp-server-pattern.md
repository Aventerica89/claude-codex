# Zero-Dependency MCP Server Pattern (Sandbox-Embedded)

## When to Use
- Adding a new AI provider or external API as an MCP tool in a sandboxed environment
- Need an MCP server that runs inside a container with no npm dependencies
- Building stdio-based MCP servers for the Claude Agent SDK

## Pattern

Build a single-file Node.js MCP server using only built-in modules (`https`, `fs`, `path`). Embed it in the Dockerfile via heredoc. The SDK spawns it as a stdio child process.

### MCP Server Template

```javascript
#!/usr/bin/env node
const https = require('https');

const TOOLS = [
  {
    name: 'tool_name',
    description: 'What this tool does',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'The input' } },
      required: ['query'],
    },
  },
];

async function handleToolCall(name, args) {
  // Call external API via https.request()
  // Return: { content: [{ type: 'text', text: '...' }] }
  // Error: { isError: true, content: [{ type: 'text', text: '...' }] }
}

function makeResponse(id, result) {
  return JSON.stringify({ jsonrpc: '2.0', id, result });
}

async function handleMessage(msg) {
  switch (msg.method) {
    case 'initialize':
      return makeResponse(msg.id, {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'my-server', version: '1.0.0' },
      });
    case 'notifications/initialized': return null;  // No response
    case 'tools/list': return makeResponse(msg.id, { tools: TOOLS });
    case 'tools/call':
      return makeResponse(msg.id, await handleToolCall(msg.params?.name, msg.params?.arguments || {}));
    case 'ping': return makeResponse(msg.id, {});
    default:
      return JSON.stringify({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'Method not found' } });
  }
}

// Newline-delimited JSON transport
let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', async (chunk) => {
  buffer += chunk;
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';
  for (const line of lines) {
    if (!line.trim()) continue;
    const response = await handleMessage(JSON.parse(line.trim()));
    if (response) process.stdout.write(response + '\n');
  }
});
process.stdin.on('end', () => process.exit(0));
```

### Dockerfile Embedding

```dockerfile
RUN cat > /opt/my-app/server.js << 'EOF'
// ... server code ...
EOF
RUN chmod +x /opt/my-app/server.js
```

### SDK MCP Config (passed via CLAUDE_MCP_SERVERS env)

```json
{ "my-server": { "command": "node", "args": ["/opt/my-app/server.js"] } }
```

## Key Insights

1. **Protocol version**: Use `2024-11-05` for current MCP spec
2. **Notifications return null**: `notifications/initialized` has no id, no response needed
3. **Tool results format**: `{ content: [{ type: 'text', text: '...' }] }` — always array of content blocks
4. **Error results**: Set `isError: true` on the result object, NOT as a JSON-RPC error
5. **Transport**: Newline-delimited JSON on stdin/stdout (not content-length headers)
6. **API key via env**: Read from `process.env` — flows through VF's `collectUserSecrets()` pipeline
7. **Security**: For file-reading tools, validate paths against allowed roots (`/workspace`, `/root`)
8. **Stderr for logs**: Use `process.stderr.write()` for debug logging — stdout is protocol-only

## Learned From
- VaporForge Gemini MCP integration (2026-02-12)
- Reference implementations: cmdaltctr/claude-gemini-mcp-slim, raiansar/claude_code-gemini-mcp
