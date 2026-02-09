# Cloudflare Sandbox: Large RPC Payload + Shell Escaping

**Extracted:** 2026-02-08
**Context:** Cloudflare Workers + Sandbox (Durable Objects) -- file uploads, image handling

## Problem (Two Stacked Bugs)

**Bug 1 — Large RPC crashes container:**
Calling `sandbox.writeFile(path, content)` with large payloads (>~500KB) crashes the Durable Object container silently. All subsequent operations fail with "Session is not ready or shell has died."

**Bug 2 — Shell escaping in execInSandbox:**
`execInSandbox` joins array commands with spaces: `['node', '-e', script, arg1]` becomes `node -e script arg1`. If the script contains semicolons, bash interprets them as command separators, crashing the shell (exit code 2). This bug was hidden by Bug 1 -- the container died before reaching the decode step.

## Root Cause

1. `@cloudflare/sandbox` SDK methods use DO RPC. Large single-message payloads overwhelm the container.
2. `execInSandbox` does `Array.isArray(cmd) ? cmd.join(' ') : cmd` -- no shell quoting.

## Solution

**Chunked writes (8KB)** + **`base64 -d` decode** (no shell escaping issues):

```typescript
const CHUNK_SIZE = 8 * 1024; // 8KB per chunk
const tmpPath = `/tmp/upload-${Date.now()}.b64`;

// Step 1: Write base64 in small chunks
for (let i = 0; i < data.length; i += CHUNK_SIZE) {
  const chunk = data.slice(i, i + CHUNK_SIZE);
  const op = i === 0 ? '>' : '>>';
  await sandboxManager.execInSandbox(
    sessionId,
    `printf '%s' '${chunk}' ${op} ${tmpPath}`
  );
}

// Step 2: Decode with base64 CLI tool (NOT node -e)
await sandboxManager.execInSandbox(
  sessionId,
  `base64 -d < ${tmpPath} > '${filePath}' && rm -f ${tmpPath}`
);
```

## Key Details

- `sandbox.writeFile()` = single RPC = crashes on large payloads
- 8KB chunks are conservative and reliable (128KB can also crash)
- Base64 chars (`A-Za-z0-9+/=`) are safe in single-quoted bash strings
- `base64 -d` is a native Linux tool -- no quoting/escaping complexity
- NEVER use `node -e` with inline JS via execInSandbox arrays -- semicolons break
- Always pass commands as a single string to execInSandbox, not arrays

## Debugging Story

This was a two-bug stack where each bug masked the other:
1. `writeFile()` crashed silently on large payloads -- container just dies
2. Fixing #1 with chunking exposed #2: the `node -e` decode script's semicolons were interpreted by bash as command separators
3. Every `wrangler deploy` resets all DOs, killing test sessions (red herring)
4. Text-only messages worked fine, masking the real trigger

The breakthrough: wrangler tail showed "all 4 chunks written, decoding..." then "Shell terminated unexpectedly (exit code: 2)" -- confirming chunks worked but decode crashed.

## When to Use

- Any time you send data > 100KB through a Cloudflare Sandbox SDK method
- File uploads, image handling, large config writes
- Any writeFile with large inline data
- NEVER pass inline scripts with semicolons via execInSandbox arrays
- Consider R2 as intermediary for very large files (>5MB)
