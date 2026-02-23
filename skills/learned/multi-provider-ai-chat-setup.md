---
name: multi-provider-ai-chat-setup
description: Runtime patterns for multi-provider AI chat using Vercel AI SDK. Covers provider resolution, SDK wiring gotchas, agent loop with tool calling, summary generation, and error classification. Discovered building WP Dispatch builds 14.9-14.15.
source: ~/wp-dispatch (builds 14.9-14.15)
date: 2026-02-23
---

# Multi-Provider AI Chat Setup

## 5-Layer Architecture

```
integrations table (encrypted keys)
    ↓
ai-provider.ts (resolution: priority order or user override)
    ↓
claude-chat.ts (agent loop: generateText + stopWhen)
    ↓
/api/chat/route.ts (request handling, summary dispatch)
    ↓
/api/chat/providers (UI: what's available without decrypting keys)
```

## Provider Priority (cheapest first)

```
deepseek → groq → gemini → anthropic
```

- DeepSeek: cheapest capable model, reliable tool calling
- Groq: SUMMARY-ONLY — fast/free but hallucinates tool results
- Gemini: fallback, free tier quota prone
- Anthropic: most capable, reserved for when others fail

## Two-Tier Model Strategy

| Tier | Purpose | Model per provider |
|------|---------|-------------------|
| Chat | Main agent loop | deepseek-chat, llama-3.3-70b-versatile, gemini-2.0-flash, claude-sonnet-4-5 |
| Summary | Short async summaries | deepseek-chat, llama-3.1-8b-instant, gemini-1.5-flash, claude-haiku-4-5 |

Summary is generated async (non-blocking) after the chat response is returned.
Groq summary model is preferred when configured (fast + free), else falls back to active provider's summary model.

## SDK Wiring Per Provider

### DeepSeek (CRITICAL GOTCHA)

```ts
import { createOpenAI } from "@ai-sdk/openai"

const client = createOpenAI({ apiKey: key, baseURL: "https://api.deepseek.com/v1" })
// MUST use .chat() — NOT client() — default routes to Responses API which DeepSeek doesn't support
return { chatModel: client.chat("deepseek-chat"), summaryModel: client.chat("deepseek-chat") }
```

### Groq

```ts
import { createGroq } from "@ai-sdk/groq"

const client = createGroq({ apiKey: key })
return { chatModel: client("llama-3.3-70b-versatile"), summaryModel: client("llama-3.1-8b-instant") }
// NOTE: Groq hallucinates tool call results — reserve for summaries, not tool-calling loops
```

### Gemini

```ts
import { createGoogleGenerativeAI } from "@ai-sdk/google"

const client = createGoogleGenerativeAI({ apiKey: key })
return { chatModel: client("gemini-2.0-flash"), summaryModel: client("gemini-1.5-flash") }
```

### Anthropic (CRITICAL GOTCHA)

```ts
import { createAnthropic } from "@ai-sdk/anthropic"

// OAuth tokens (sk-ant-oat...) are REJECTED by the Messages API
// Only API keys (sk-ant-api...) work — skip OAuth tokens silently
if (key.startsWith("sk-ant-oat")) continue // or return null
const client = createAnthropic({ apiKey: key })
return { chatModel: client("claude-sonnet-4-5-20250929"), summaryModel: client("claude-haiku-4-5-20251001") }
```

## Agent Loop Pattern

```ts
import { generateText, stepCountIs } from "ai"

const result = await generateText({
  model: provider.chatModel,
  system: systemPrompt,
  messages,
  tools,                          // undefined = no tool calling
  stopWhen: stepCountIs(8),       // max iterations
  abortSignal: AbortSignal.timeout(45_000),
})
```

## Retry Pattern (Groq failed_generation)

```ts
if (msg.includes("failed_generation") && tools) {
  // Groq can't format tool calls — retry as plain text
  const fallback = await generateText({ model, system, messages })
  return { response: fallback.text }
}
```

## Error Classification

```ts
if (msg.includes("quota") || msg.includes("exceeded"))
  → "Provider quota exceeded. Upgrade or switch in Settings > AI."
if (msg.includes("not found") || msg.includes("404"))
  → "Model not found. May be deprecated — check Settings > AI."
if (msg.includes("rate limit") || msg.includes("429"))
  → "Rate limit hit. Wait and try again."
else
  → "AI provider error: {msg}. Verify API key in Settings > AI."
```

## Non-Blocking Summary Generation

```ts
// Fire-and-forget — don't await
const summaryModel = (await getSummaryProvider()) ?? provider.summaryModel
generateConversationSummary(summaryModel, message, result.response)
  .then(async (summary) => { /* update DB row with summary */ })
  .catch((err) => { console.error("Summary generation failed:", err) })
```

## Known Gotchas

| Provider | Gotcha | Fix |
|----------|--------|-----|
| DeepSeek | Default routes to Responses API | Use `client.chat()` not `client()` |
| Groq | Hallucinates tool call results | Summary-only; retry without tools on `failed_generation` |
| Anthropic | OAuth tokens rejected by Messages API | Filter `sk-ant-oat*` tokens before creating client |
| Gemini | Free tier quota exhaustion | Place last in priority order |
| AI SDK v3 | `compatibility` option removed | Use `.chat()` method instead |
| AI SDK | `stopWhen` not `maxSteps` | Import `stepCountIs` from `"ai"`, pass as `stopWhen` |

## Canonical Source

- `~/wp-dispatch/src/lib/ai-provider.ts` — provider resolution
- `~/wp-dispatch/src/lib/claude-chat.ts` — agent loop
- `~/wp-dispatch/src/app/api/chat/route.ts` — request handler
- `~/wp-dispatch/src/app/api/chat/providers/route.ts` — UI providers endpoint
