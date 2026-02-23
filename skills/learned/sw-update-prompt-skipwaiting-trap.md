# Service Worker Update Prompt: skipWaiting Trap

**Extracted:** 2026-02-22
**Context:** Any PWA with a service worker update banner (e.g., "App updated — tap to refresh")

## Problem

Calling `self.skipWaiting()` inside the service worker's `install` event causes the update banner to flash and disappear. The new SW activates immediately, triggers `controllerchange`, and the page reloads — before the user can even see the banner.

```javascript
// BROKEN: Banner appears for ~100ms then page reloads
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()) // <-- causes immediate activation
  )
})
```

## Solution

Remove `skipWaiting()` from the install handler. Instead, let the new SW enter the `waiting` state. The UI component shows the banner, and when the user taps "Update", it sends a message to trigger `skipWaiting()`.

**sw.js:**
```javascript
// Install: cache app shell. Do NOT call skipWaiting here.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
})

// Only skip waiting when the UI tells us to.
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
```

**React update-prompt component:**
```tsx
const reloading = useRef(false)

// Register SW, detect waiting state
navigator.serviceWorker.register(swUrl).then((reg) => {
  if (reg.waiting) { setWaitingWorker(reg.waiting); return }
  reg.addEventListener("updatefound", () => {
    const newWorker = reg.installing
    newWorker?.addEventListener("statechange", () => {
      if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
        setWaitingWorker(newWorker)
      }
    })
  })
})

// Guard against double-reload
navigator.serviceWorker.addEventListener("controllerchange", () => {
  if (reloading.current) return
  reloading.current = true
  window.location.reload()
})

// User taps "Update"
function handleUpdate() {
  waitingWorker?.postMessage("SKIP_WAITING")
}
```

**Key details:**
- Check `navigator.serviceWorker.controller` exists before showing banner (skips first install)
- Use a `reloading` ref to prevent double-reload from multiple `controllerchange` events
- Version the SW URL with commit SHA (`/sw.js?v=${commitSha}`) so Vercel deploys trigger updates

## When to Use

- Building a PWA with an "Update available" banner
- Migrating from auto-updating SW to user-controlled updates
- Debugging a banner that appears and immediately disappears
