# Build-Time Code Generation for Edge Runtimes

**Extracted:** 2026-02-13
**Context:** Cloudflare Workers, Vercel Edge Functions, or any environment without shell/git access at runtime

## Problem

Edge runtimes (V8 isolates) cannot run `git`, `child_process`, or read `.git/` at runtime. You need git metadata (hash, commit log, timestamps) visible in the app.

## Solution

Generate TypeScript constants at **build time** from git, import them as regular modules.

### Pattern

1. Create `scripts/generate-build-info.mjs`:
   - Runs `git log --format='%h|%s|%ai' -N` via `execSync`
   - Parses output into structured data
   - Writes `.ts` files with `export const` declarations
   - Generate for BOTH frontend and backend if they're separate builds

2. Add to build pipeline BEFORE other build steps:
   ```json
   "build:info": "node scripts/generate-build-info.mjs",
   "build": "npm run build:info && npm run build:ui && ..."
   ```

3. Gitignore the generated files:
   ```
   */generated/
   ```

4. Import as regular TypeScript:
   ```typescript
   import { BUILD_HASH, BUILD_DATE } from './generated/build-info';
   ```

### Key Details

- Use conventional commit regex `/^(\w+)(?:\(.*?\))?:\s*/` to extract commit types
- Split on `|` delimiter (not space) since commit messages contain spaces
- Handle edge case: messages containing `|` by popping date from end, joining rest
- Generate identical files for frontend and backend paths

## When to Use

- Any serverless/edge project needing version visibility
- Cloudflare Workers, Vercel Edge, Deno Deploy, etc.
- Projects where runtime has no filesystem or shell access
- CI/CD pipelines that need build metadata embedded in artifacts

## Anti-Patterns

- Don't try to run git at runtime in edge environments
- Don't hardcode version strings manually (they drift)
- Don't use `__dirname` tricks in edge runtimes (no filesystem)
