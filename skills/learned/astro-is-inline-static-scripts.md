# Astro: is:inline Required for Static Scripts

**Extracted:** 2026-02-18
**Context:** Injecting scripts into Astro pages that reference static files in public/

## Problem
When injecting a `<script src="/my-script.js">` tag into an Astro page (where
`my-script.js` is a static file in `public/`), Astro's Vite compiler treats it
as a module import. Since the file exists in `public/` and not in the module
graph, Vite silently drops the script tag entirely.

No error is shown — not in the build output, not in the browser console, not
anywhere. The script simply doesn't load.

## Solution
Add `is:inline` to the script tag:

```html
<!-- WRONG: Silently dropped by Astro/Vite -->
<script src="/my-script.js"></script>

<!-- CORRECT: Bypasses Vite bundling, loads as static asset -->
<script is:inline src="/my-script.js"></script>
```

`is:inline` tells Astro to leave the tag as-is in the HTML output without
attempting to bundle or resolve it through Vite.

## Example
VaporForge's agency inspector injects a script into `.astro` files via a
container-side Node script. The injection replaces `</head>` with the script
tag + `</head>`:

```javascript
// In the injection script (runs in container)
c = c.replace("</head>",
  '<script is:inline src="/vf-inspector.js"></script>\n</head>');
```

The `vf-inspector.js` file is written to `/workspace/public/` as a static file.

## When to Use
- Injecting scripts into Astro pages that reference files in `public/`
- Using Astro in iframe/preview contexts where you need runtime scripts
- Any time a `<script>` tag targeting a static asset mysteriously doesn't load
- Debugging "script not loading" in Astro with no error messages
