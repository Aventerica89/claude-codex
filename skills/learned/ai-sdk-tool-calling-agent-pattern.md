# AI SDK Tool-Calling Agent Pattern

**Extracted:** 2026-02-12
**Context:** Building lightweight AI agents with Vercel AI SDK that call tools in a loop, running in Workers without a full sandbox container

## Problem

Full Claude Code SDK agents require a sandbox container (~$7/user/mo, startup latency). Many tasks only need the model to read a few files, search code, or run a command. Need a lighter-weight agent running directly in the edge Worker.

## Solution

Use streamText() with tools and maxSteps to create an agent loop:

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: createModel('claude', creds, 'sonnet'),
  messages: conversationHistory,
  system: 'You are a code assistant. Use tools to investigate.',
  tools: {
    readFile: tool({
      description: 'Read a file from the workspace',
      parameters: z.object({ path: z.string() }),
      execute: async ({ path }) => await sandbox.readFile(path),
    }),
    searchCode: tool({
      description: 'Search for patterns in workspace',
      parameters: z.object({ query: z.string() }),
      execute: async ({ query }) => {
        return await sandbox.exec(['grep', '-rn', query, '/workspace']);
      },
    }),
  },
  maxSteps: 5,
});
```

The model decides which tools to call. Results feed back automatically. Loop continues until maxSteps or model stops calling tools.

### Tool States (for UI visualization)

- input-streaming (Pending): parameters being generated
- input-available (Running): tool actively executing
- output-available (Completed): result returned
- output-error (Error): execution failed

### Architecture Options

- **Tools in sandbox:** Route tool calls to container via WS. Best for file ops, exec.
- **Tools in Worker:** No sandbox needed. Hit KV, D1, external APIs. Instant.
- **Hybrid:** Some tools in Worker, some proxy to sandbox.

## When to Use

- Quick Chat that needs to investigate code before answering
- Multi-step analysis without full SDK overhead
- Any feature where AI needs to "look things up"
- Building lightweight agents in edge Workers

## Key Constraints

- maxSteps prevents infinite loops (start with 5)
- Each step = full API round-trip (latency adds up)
- CF Workers have 30-second CPU time limit
- Tool execute functions must handle errors gracefully
