# Astro Hybrid Mode Dynamic Routes

## Problem

In Astro hybrid mode (`output: 'hybrid'`), dynamic routes like `[id].astro` or `[slug].astro` fail at build time with:

```
[ERROR] Failed to call getStaticPaths for src/pages/dashboard/plugins/[id].astro
```

## Root Cause

Astro hybrid mode defaults to static pre-rendering. Dynamic routes with `[param]` syntax need `getStaticPaths()` to enumerate all possible values at build time - or they need to opt out of pre-rendering.

## Solution

Add `export const prerender = false` to the frontmatter of any dynamic route:

```astro
---
export const prerender = false;

import BaseLayout from '../../../layouts/BaseLayout.astro';
const { id } = Astro.params;
---
```

This tells Astro to server-render this route on demand instead of pre-rendering at build time.

## When to Use

- Routes with `[param]` segments that pull from a database
- Routes where the full set of possible values isn't known at build time
- API routes already need this (they use `export const prerender = false` too)

## Checklist for New Dynamic Routes

1. Create the `[param].astro` file
2. Add `export const prerender = false` as first line in frontmatter
3. Access params via `Astro.params`
4. Handle missing params with redirect: `if (!id) return Astro.redirect('/fallback')`

## Related

- Astro API routes also need `export const prerender = false`
- Static dynamic routes (known values) should use `getStaticPaths()` instead

## Tags

astro, hybrid, dynamic-routes, prerender, getStaticPaths, ssr
