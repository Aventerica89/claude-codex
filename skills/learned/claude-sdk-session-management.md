# Claude SDK Session Management

**Category**: Backend Patterns
**Learned From**: VaporForge chat implementation (2026-02-06)
**Confidence**: High (tested and deployed)

## Problem

Building a chat application with Claude where each message needs conversation context from previous messages. Using the Claude CLI (`claude --print`) results in stateless interactions with no memory.

## Solution

Use `@anthropic-ai/claude-agent-sdk` with session management to maintain conversation continuity.

## Implementation Pattern

### 1. Install SDK

```bash
npm install @anthropic-ai/claude-agent-sdk
# May need --legacy-peer-deps if Zod version conflicts
```

### 2. Session State Schema

Add sessionId tracking to your session/conversation state:

```typescript
// Add to your Session/Conversation type
type Session = {
  id: string;
  userId: string;
  sdkSessionId?: string; // Claude SDK session for continuity
  // ... other fields
};
```

### 3. SDK Query with Session Management

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';

async function chatWithClaude(
  prompt: string,
  session: Session,
  cwd: string = '/workspace'
) {
  // Build query options
  const queryOptions = {
    prompt,
    cwd,
    model: 'claude-sonnet-4-5',
    // Resume existing session OR start new one
    ...(session.sdkSessionId
      ? { resume: session.sdkSessionId, continue: true }
      : { continue: true }
    ),
  };

  // Run query and stream results
  const stream = query(queryOptions);

  let responseText = '';
  let newSessionId = session.sdkSessionId || '';

  for await (const msg of stream) {
    const msgAny = msg as any;

    // Capture session ID from first message
    if (msgAny.type === 'session-init' && msgAny.sessionId) {
      newSessionId = msgAny.sessionId;
    }

    // Extract text deltas for streaming
    if (msgAny.event?.type === 'content_block_delta') {
      const delta = msgAny.event.delta;
      if (delta?.type === 'text_delta' && delta.text) {
        responseText += delta.text;
        // Optionally stream to client here
      }
    }

    // Handle errors
    if (msgAny.type === 'error') {
      throw new Error(msgAny.errorText || 'Claude SDK error');
    }
  }

  // Update session with new sessionId
  if (newSessionId !== session.sdkSessionId) {
    await saveSession({
      ...session,
      sdkSessionId: newSessionId
    });
  }

  return responseText;
}
```

### 4. Cache Dynamic Imports (Performance)

For Cloudflare Workers or environments with cold starts:

```typescript
let cachedQuery: typeof import('@anthropic-ai/claude-agent-sdk').query | null = null;

const getClaudeQuery = async () => {
  if (cachedQuery) return cachedQuery;
  const sdk = await import('@anthropic-ai/claude-agent-sdk');
  cachedQuery = sdk.query;
  return cachedQuery;
};
```

## Key Concepts

### Session Continuity
- First message: SDK creates session, returns `sessionId` in `session-init` event
- Subsequent messages: Pass `resume: sessionId` to maintain conversation context
- Claude remembers full conversation history automatically

### Stream Events
```typescript
// Key event types to handle:
- 'session-init' → Extract sessionId
- 'content_block_delta' → Extract text for streaming
- 'error' → Handle errors
```

### Query Options
```typescript
{
  prompt: string,           // User message
  cwd: string,              // Working directory
  model?: string,           // Claude model (default: sonnet-4-5)
  resume?: string,          // Session ID to resume
  continue?: boolean,       // Continue session mode
  env?: Record<string, string>, // Environment variables
}
```

## CLI vs SDK Comparison

| Feature | CLI (`claude --print`) | SDK (`query()`) |
|---------|------------------------|-----------------|
| Memory | ❌ Stateless | ✅ Session-based |
| Speed | Slow (process spawn) | Fast (direct SDK) |
| Streaming | No | Yes (text deltas) |
| Tool use | Limited | Full support |
| Use case | One-off commands | Chat applications |

## When to Use

✅ **Use SDK when:**
- Building chat/conversation interfaces
- Need conversation continuity
- Want real-time streaming responses
- Building web-based Claude Code IDE

❌ **Use CLI when:**
- One-off terminal commands
- Simple automation scripts
- Don't need conversation history

## Common Pitfalls

1. **Forgetting to store sessionId**: Without storing, each message starts fresh
2. **Not handling session-init**: SessionId arrives in stream, must extract it
3. **Wrong continue flag**: Use `continue: true` even when resuming
4. **Peer dependency conflicts**: May need `--legacy-peer-deps` for Zod

## Related Patterns

- See: `~/.claude/docs/ai-sdk.md` (if exists) for full SDK reference
- See: Dynamic ESM module caching pattern
- Reference: 1Code implementation uses this pattern

## Example Projects

- **VaporForge**: Web-based Claude Code IDE (2026-02-06)
- **1Code**: Desktop IDE with SDK session management
- **claudecodeui**: Web interface wrapping Claude Code

## References

- [AI SDK Core Docs](https://ai-sdk.dev/docs/reference/ai-sdk-core)
- [Claude Agent SDK GitHub](https://github.com/anthropics/claude-agent-sdk)
- [1Code Source](https://github.com/Aventerica89/1code)
