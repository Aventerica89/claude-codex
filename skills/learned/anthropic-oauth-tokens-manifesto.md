# Anthropic OAuth Tokens: The Complete Truth

**Extracted:** 2026-02-18
**Context:** WP Dispatch v1.4 Step 1 — proved OAuth tokens work in Node.js after months of believing they were universally unsupported for API calls

---

## The Lie We Believed

For months, a comment in VaporForge's `auth.ts` (line 177) stated:

> "It can't be validated via the Messages API (OAuth not supported there)."

This became gospel. It was written into CLAUDE.md as a MANDATORY RULE:

> "OAuth tokens do NOT work for direct API calls."

It propagated into memory files. It shaped architecture decisions. It was cited as the reason VaporForge needed to run Claude Code SDK in a Cloudflare Sandbox container.

**It was incomplete.**

---

## The Real Story

Anthropic's Messages API **does** accept OAuth tokens (`sk-ant-oat01-*`). It just requires them to be sent as a **Bearer token** in the Authorization header, not as an API key in the `x-api-key` header.

| Token type | Correct header | Wrong header |
|---|---|---|
| API key (`sk-ant-api01-*`) | `x-api-key: <token>` | `Authorization: Bearer <token>` |
| OAuth token (`sk-ant-oat01-*`) | `Authorization: Bearer <token>` | `x-api-key: <token>` |

Both work at the Anthropic API level. The API validates them differently, but both are accepted.

---

## Why VaporForge Got It Wrong

VaporForge uses `@ai-sdk/anthropic` (the Vercel AI SDK provider) running in **Cloudflare Workers edge runtime**. That SDK sends everything as `x-api-key`. There is no `authToken` option. So in that specific context, OAuth tokens fail — not because the Anthropic API rejects them, but because the SDK was using the wrong header.

The VaporForge engineer (me) concluded from this failure that "OAuth tokens are not supported for API calls" — a broader claim than the evidence warranted.

---

## The Correct Implementation

### In Node.js with `@anthropic-ai/sdk`:

```typescript
function createClient(token: string): Anthropic {
  if (token.startsWith("sk-ant-oat")) {
    // OAuth token — must use Authorization: Bearer
    return new Anthropic({ authToken: token });
  }
  // API key — standard x-api-key
  return new Anthropic({ apiKey: token });
}
```

This was proven working in production on wpdispatch.app on 2026-02-18.

### In CF Workers with `@ai-sdk/anthropic`:

OAuth tokens still **do not work** here. The Vercel AI SDK Anthropic provider does not expose an `authToken` option. You would need to construct requests manually or use a different client.

---

## Did VaporForge Need the Container Architecture?

**The short answer: Yes, but not for the reason we thought.**

The container was justified as necessary because "OAuth tokens don't work for API calls." That justification was wrong. But the container is still the right architecture for VaporForge — for different reasons:

1. **VaporForge is a Claude Code IDE.** It runs `claude` CLI with full SDK capabilities: file editing, shell execution, multi-step agents, MCP servers. `messages.create()` alone cannot replace this. The container IS the product.

2. **Streaming.** CF Workers + `execStream()` has an unfixable buffering bug. The WebSocket tunnel to a container bypasses this. Even if we could do OAuth API calls from the Worker, we'd still need the container for real-time streaming.

3. **Security isolation.** Each user gets an isolated container with their own filesystem, git repos, terminals. No amount of "just call the API" replaces this.

**What changes:** VaporForge's QuickChat, Code Transform, Analyze, and CommitMsg features (which use `@ai-sdk/anthropic` in the Worker) still require `sk-ant-api01-*` API keys — that limitation is real and specific to that SDK/runtime. But the main Claude Code chat could theoretically be invoked via `messages.create()` with an OAuth token from Node.js, if VaporForge ever wanted a "lightweight mode" without spinning up a container.

---

## For Chat/Agent Applications (Like WP Dispatch)

If your app is:
- Node.js (Next.js, Express, etc.)
- Using `@anthropic-ai/sdk` directly
- Just doing chat with tool-calling

Then **you do NOT need a container.** OAuth tokens work with `authToken`. Users can use their Claude Pro/Max subscription directly. No API billing, no infrastructure overhead.

---

## Corrected Rules

### OLD (wrong):
```
OAuth tokens do NOT work for direct API calls.
```

### NEW (correct):
```
OAuth tokens work for direct @anthropic-ai/sdk calls in Node.js when using authToken.
OAuth tokens do NOT work with @ai-sdk/anthropic in CF Workers edge runtime (no authToken option).
API keys work everywhere.
```

---

## When to Use This Pattern

- Any Node.js app that wants to accept Claude.ai OAuth tokens instead of requiring API key creation
- When users have Claude Pro/Max and shouldn't need a separate API key
- Building apps that want "sign in with your Claude account" UX

## When NOT to Use

- CF Workers edge runtime with `@ai-sdk/anthropic` — use API keys there
- Anywhere you need full Claude Code SDK capabilities — use containers

---

## Affected Files in WP Dispatch

- `src/lib/claude-chat.ts` — `createClient()` helper
- `src/lib/ai-settings.ts` — `getClaudeToken()` (renamed from getAnthropicApiKey)
- `src/app/api/settings/ai/route.ts` — pattern accepts both token formats
- `src/app/api/settings/ai/test/route.ts` — same createClient pattern
- `src/app/(dashboard)/settings/ai/page.tsx` — UI updated, validation relaxed
