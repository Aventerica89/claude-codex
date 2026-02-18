# Service Worker Cache Version Bump on Deploy

**Extracted:** 2026-02-18
**Context:** VaporForge PWA with service worker caching — deploying frontend changes without bumping the cache version causes the browser to serve stale assets

## Problem
When deploying frontend changes to a PWA with a service worker, the browser continues serving cached assets from the previous version. Users cannot see new features, verify deployments, or confirm version numbers. This is invisible to the developer — the deploy succeeds, but the user sees the old version.

## Solution
**Always bump the service worker `CACHE_VERSION` when deploying frontend changes.**

In `ui/public/sw.js`:
```javascript
// Increment the version number on every deploy with frontend changes
const CACHE_VERSION = 'vaporforge-v33';  // was v32
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
```

The service worker's `activate` event automatically deletes old caches when the version changes:
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});
```

## Checklist (VaporForge Deploy)
1. Make frontend changes
2. Bump `CACHE_VERSION` in `ui/public/sw.js`
3. Add DEV_CHANGELOG entry in `ui/src/lib/version.ts`
4. Run `npm run build` (full pipeline)
5. Deploy with `npx wrangler deploy`

## When to Use
- Every time you deploy frontend changes (JS, CSS, HTML, assets)
- Even "small" CSS tweaks — the SW caches everything
- Especially when the user needs to verify the deploy worked
- NOT needed for backend-only changes (API routes, KV logic) that don't touch `ui/`

## Why This Matters
- Users cannot hard-refresh a PWA on mobile (no Ctrl+Shift+R)
- `skipWaiting()` + `clients.claim()` only help when the SW file itself changes
- The SW file change is detected by the browser comparing byte-for-byte
- If the version string doesn't change, the browser thinks the SW is unchanged
