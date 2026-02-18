# Astro Dev Toolbar: Disable in Iframe/Sandboxed Contexts

**Extracted:** 2026-02-18
**Context:** Running Astro dev server inside an iframe (VaporForge agency editor) where the built-in Dev Toolbar interferes

## Problem
Astro's built-in Dev Toolbar (added in Astro 4+) appears in dev mode with:
- An "Inspect" mode that conflicts with custom inspectors
- External links (to Astro docs, etc.) that break in sandboxed iframes
- UI overlays that cover the bottom of the page

When running an Astro site inside an iframe for visual editing, the toolbar is unusable and blocks interaction with the actual page content.

## Solution
Set the `ASTRO_DISABLE_DEV_OVERLAY` environment variable before starting the dev server:

```bash
export ASTRO_DISABLE_DEV_OVERLAY=true
npm run dev -- --host 0.0.0.0
```

Or inline:
```bash
ASTRO_DISABLE_DEV_OVERLAY=true npx astro dev --host 0.0.0.0
```

## Example
VaporForge's agency setup script disables the toolbar before launching the Astro dev server inside a Cloudflare Sandbox container:

```typescript
// In the setup bash script
'export ASTRO_DISABLE_DEV_OVERLAY=true',
'cd /workspace && npm run dev -- --host 0.0.0.0 --port $DEV_PORT &',
```

## When to Use
- Running Astro dev server inside an iframe or WebView
- Building visual editors that overlay Astro previews
- Any sandboxed context where external navigation should be blocked
- When implementing custom inspector/selection tools that conflict with Astro's Inspect mode
