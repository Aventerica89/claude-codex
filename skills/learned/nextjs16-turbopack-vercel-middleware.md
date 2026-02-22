# Next.js 16 Turbopack + Vercel: Middleware Build Fix

**Extracted:** 2026-02-21
**Context:** Deploying a Next.js 16 app with `middleware.ts` to Vercel

## Problem

Vercel production build fails with one of these errors (in sequence):

```
ENOENT: no such file or directory, open '/vercel/path0/.next/server/middleware.js.nft.json'
```

Then after creating the NFT file:
```
Error: files.forEach is not a function
```

Then after fixing NFT format:
```
ENOENT: no such file or directory, lstat '/vercel/path0/.next/server/middleware.js'
```

## Root Cause

Next.js 16 uses Turbopack by default for **production** builds (`next build`). Turbopack compiles middleware to edge chunks:

```
.next/server/edge/chunks/[root-of-the-server]__<hash>._.js
.next/server/edge/chunks/ab4a7_next_dist_esm_build_templates_edge-wrapper_<hash>.js
.next/server/middleware-manifest.json  ← what Turbopack generates
```

Webpack (previous default) generated:
```
.next/server/middleware.js             ← what Vercel expects
.next/server/middleware.js.nft.json    ← what Vercel expects
```

Vercel's post-build validation step (runs AFTER "Build Completed in /vercel/output") reads `.next/server/` expecting the webpack format. When it finds `middleware-manifest.json` but not `middleware.js` or `middleware.js.nft.json`, it fails.

**Key facts:**
- `TURBOPACK=0` does NOT disable Turbopack in Next.js 16 (the env var is ignored)
- The error occurs AFTER Next.js build succeeds and AFTER `.vercel/output/` is written
- The actual edge function executes from `.vercel/output/functions/_middleware.func/` — NOT from `middleware.js`
- A stub `middleware.js` satisfies the lstat check without affecting actual execution

## Solution

Add `scripts/postbuild.js` that creates both files when `middleware-manifest.json` exists:

```js
// scripts/postbuild.js
const fs = require('fs')
const path = require('path')

function getPaths() {
  const serverDir = path.join(process.cwd(), '.next', 'server')
  return {
    manifest: path.join(serverDir, 'middleware-manifest.json'),
    nft: path.join(serverDir, 'middleware.js.nft.json'),
    stub: path.join(serverDir, 'middleware.js'),
  }
}

function run() {
  const { manifest, nft, stub } = getPaths()

  if (fs.existsSync(nft) && fs.existsSync(stub)) return
  if (!fs.existsSync(manifest)) return

  if (!fs.existsSync(stub)) {
    fs.writeFileSync(stub, '// Turbopack middleware stub — actual code in .vercel/output\n')
  }
  if (!fs.existsSync(nft)) {
    fs.writeFileSync(nft, JSON.stringify({ version: 1, files: [] }))
  }
}

module.exports = { run, getPaths }

if (require.main === module) run()
```

Wire it up in `package.json`:

```json
{
  "scripts": {
    "build": "next build",
    "postbuild": "node scripts/postbuild.js"
  }
}
```

## NFT Format Details

The NFT file must be:
- `version: 1` (not 2)
- `files: []` (array, not object `{}`)

```json
{"version":1,"files":[]}
```

Using `files: {}` causes `files.forEach is not a function` in Vercel CLI.
Using `version: 2` with `files: {}` causes the same.

## Verification

After deploying, confirm middleware runs by checking response headers:

```bash
curl -s -D - -o /dev/null https://your-app.com/ | grep x-clerk
# x-clerk-auth-status: signed-out  ← middleware is executing
```

## When to Use

Apply immediately when you see this error pattern in a Vercel build log for a Next.js 16 app that has `middleware.ts`:

```
ENOENT: no such file or directory ... middleware.js.nft.json
```

Or:
```
lstat ... middleware.js
```

The error always appears AFTER "Build Completed in /vercel/output" — it's in Vercel CLI's post-build validation, not in the Next.js build itself.

## Related

- Clerk v6 `auth.protect()` returns **404** (not 401) for unauthenticated API requests — this is intentional to avoid leaking route existence
- Widget PIN bypass: middleware checks for `X-DevTools-Pin` header presence (not validity) — actual PIN comparison happens in the route handler
