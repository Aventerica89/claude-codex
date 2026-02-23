# Multi-Provider SSE Streaming Normalization

**Extracted:** 2026-02-23
**Context:** Building AI chat features that support multiple LLM providers with streaming responses

## Problem

Each AI provider returns streaming SSE in a different format:
- **Anthropic:** `content_block_delta` events with `delta.text`
- **OpenAI-compatible** (DeepSeek, Groq): `choices[0].delta.content` with `[DONE]` sentinel
- **Gemini:** `candidates[0].content.parts[0].text` via `streamGenerateContent?alt=sse`

You need a single `ReadableStream<Uint8Array>` of plain text regardless of which provider is upstream. Without normalization, every consumer (API route, WebSocket handler, etc.) must know provider-specific parsing.

## Solution

A `TransformStream` factory that takes a provider-specific text extractor function and handles all the SSE line parsing:

```typescript
function createSSEParser(
  extractText: (data: string) => string
): TransformStream<Uint8Array, Uint8Array> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  let buffer = ''

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const text = extractText(line.slice(6))
          if (text) controller.enqueue(encoder.encode(text))
        }
      }
    },
    flush(controller) {
      if (buffer.startsWith('data: ')) {
        const text = extractText(buffer.slice(6))
        if (text) controller.enqueue(encoder.encode(text))
      }
    },
  })
}
```

Then each provider just needs a tiny extractor:

```typescript
// Anthropic
function parseAnthropicEvent(data: string): string {
  const p = JSON.parse(data)
  return p.type === 'content_block_delta' ? p.delta?.text ?? '' : ''
}

// OpenAI-compatible (DeepSeek, Groq)
function parseOpenAIEvent(data: string): string {
  if (data === '[DONE]') return ''
  return JSON.parse(data).choices?.[0]?.delta?.content ?? ''
}

// Gemini
function parseGeminiEvent(data: string): string {
  return JSON.parse(data).candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}
```

Usage: `response.body.pipeThrough(createSSEParser(parseAnthropicEvent))`

## Key Details

- **Buffer management:** SSE chunks don't align with message boundaries. The `buffer` accumulates partial lines and only processes complete `\n`-delimited lines.
- **flush():** Handles the final partial line when the stream ends.
- **Fallback order:** Define a `PROVIDER_ORDER` array and pick the first provider with a configured token. Anthropic > DeepSeek > Groq > Gemini is a good default.
- **Gemini quirk:** Uses `?alt=sse` query param and `system_instruction` instead of a `system` field. Role mapping: `assistant` -> `model`.
- **Return type:** The API route returns `new Response(stream, { headers: { 'content-type': 'text/plain; charset=utf-8' } })` — the client reads with a standard `ReadableStream` reader.

## When to Use

- Adding AI chat to any JB Cloud project (TAM Compliance, WP Dispatch, Clarity)
- Any multi-provider streaming feature
- When you need provider-agnostic streaming in a Route Handler or Worker
- Complements `provider-availability-guard-pattern.md` (that handles the UI guard, this handles the streaming plumbing)

## Projects Using This

- TAM Compliance: `src/lib/ai/providers.ts`
- Adaptable to: Clarity, WP Dispatch, VaporForge
