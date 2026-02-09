# Vercel: CLI-Dependent Code Fails in Serverless

**Extracted:** 2026-02-08
**Context:** Any Next.js/Vercel app that uses shell execution to call local CLI tools

## Problem

Code that calls CLI binaries via shell execution works locally but fails silently on Vercel serverless functions. The error is caught and returns a generic "error processing your request" message, making it hard to diagnose.

The pattern: API route calls a shell script that invokes a CLI binary. Locally the binary exists; on Vercel it doesn't.

## Solution

Replace CLI/shell invocations with direct SDK calls. Most CLI tools have corresponding SDKs:

- `claude` CLI -> `@anthropic-ai/sdk` (constructor auto-reads ANTHROPIC_API_KEY from env)
- `gh` CLI -> `@octokit/rest` or GitHub API
- `wrangler` CLI -> Cloudflare API

The Anthropic SDK pattern:
```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const message = await client.messages.create({
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 2048,
  system: systemPrompt,
  messages: [{ role: "user", content: userContent }],
});
```

## Diagnostic Steps

1. Check if the error message matches a catch block in the code
2. Look for shell execution imports in the failing module
3. Trace what binary the shell script calls — if it's a CLI tool, it won't exist on Vercel
4. Check if the corresponding SDK is already in package.json

## When to Use

- Deploying a Next.js app to Vercel that has shell script integrations
- Seeing generic "error processing request" messages after deployment
- Shell execution calls that work locally but fail in production
- Any shell-based invocations in API routes or server components

## Related Env Vars

After migrating from CLI to SDK, the env var checks may need updating:
- Before: CLAUDE_CLI_ENABLED (checked if CLI mode was on)
- After: ANTHROPIC_API_KEY (checked if API key is available)

Clean up dead env vars and gates that reference the old CLI approach.
