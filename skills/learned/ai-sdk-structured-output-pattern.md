# AI SDK Structured Output Pattern

**Extracted:** 2026-02-12
**Context:** Using Vercel AI SDK to get typed JSON from AI models instead of raw text/markdown

## Problem

Most AI features return unstructured text that must be parsed, regex-matched, or displayed as markdown. This limits what UI you can build — everything becomes "chat bubbles with markdown". You can't render structured panels, badges, progress bars, or typed data without fragile string parsing.

## Solution

Use `generateText()` or `streamText()` with `Output.object()` to force the model to return a Zod-validated typed object:

```typescript
import { generateText, Output } from 'ai';
import { z } from 'zod';

const schema = z.object({
  complexity: z.enum(['low', 'medium', 'high']),
  issues: z.array(z.object({
    line: z.number(),
    severity: z.enum(['error', 'warning', 'info']),
    message: z.string(),
  })),
  suggestions: z.array(z.string()),
  summary: z.string(),
});

const { object } = await generateText({
  model: createModel('claude', creds, 'sonnet'),
  output: Output.object({ schema }),
  prompt: `Analyze this TypeScript code:\n\n${code}`,
});
// object is fully typed: { complexity: 'medium', issues: [...], ... }
```

### Output Modes

- `Output.object({ schema })` — single typed object
- `Output.array({ schema })` — array of typed elements (can stream individual items)
- `Output.enum({ values })` — classification into fixed set of values

### Streaming Structured Data

```typescript
const result = streamText({
  model,
  output: Output.object({ schema }),
  prompt: '...',
});
// Client receives partial objects as they generate
// Use useObject() hook on frontend to consume
```

### Frontend Hook

```typescript
// useObject() consumes streamed structured data
const { object, isLoading } = useObject({
  api: '/api/analyze/code',
  schema: codeAnalysisSchema,
});
// Renders partial results as they stream in
```

## Example Use Cases

| Feature | Schema | UI Rendering |
|---------|--------|-------------|
| Code analysis | complexity, issues[], suggestions[] | Severity badges, issue cards |
| Commit generation | type, scope, subject, body, breaking | Commit component with file changes |
| Classification | enum of categories | Colored category badge |
| Test planning | testCases[] with description, type, priority | Test Results component |
| API review | endpoints[] with method, path, issues | Structured endpoint table |

## When to Use

- Building any AI feature that should render as structured UI (not markdown)
- Need typed, validated data from AI (not raw strings)
- Want to stream partial structured results to frontend
- Classification tasks (enum mode)
- Generating arrays of items (array mode streams individual elements)

## Key Insight

This is the difference between "AI that chats" and "AI that generates data". Structured output turns the model into a programmable data generator. Combined with AI Elements components (Task, TestResults, Commit, etc.), you get rich interactive UI instead of text walls.

## Compatibility

- Works in Cloudflare Workers edge runtime (proven in VaporForge v0.10.0)
- Works with Claude (Anthropic) and Gemini (Google) via AI SDK providers
- Zod schemas can use .describe() to give the model hints about field meaning
- Handle `NoObjectGeneratedError` for cases where model fails to match schema
