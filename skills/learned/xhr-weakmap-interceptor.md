# Browser Network Interception: fetch + XHR WeakMap Pattern

**Extracted:** 2026-02-18
**Context:** Building browser widgets, devtools extensions, analytics trackers, or error monitors that need to capture all network traffic

## Problem

`window.fetch` patching only captures Fetch API calls. `XMLHttpRequest` is a completely separate API used by some libraries (Axios with older configs, jQuery, legacy SDKs). Naively storing XHR metadata on the XHR instance itself pollutes the prototype and can leak memory.

## Solution

Use a `WeakMap` keyed by XHR instance to store per-request metadata. Patch `XMLHttpRequest.prototype.open`, `setRequestHeader`, and `send`. Use the `loadend` event to record the completed request — `loadend` fires for ALL outcomes: 2xx success, 4xx/5xx HTTP errors, network errors (status=0), abort, and timeout.

## Example

```typescript
type XhrMeta = {
  method: string
  url: string
  requestHeaders: Record<string, string>
  requestSize: number
  startTime: number
  timestamp: number
}

function installXhrInterceptor(): void {
  const proto = XMLHttpRequest.prototype
  const originalOpen = proto.open
  const originalSetRequestHeader = proto.setRequestHeader
  const originalSend = proto.send
  const xhrMeta = new WeakMap<XMLHttpRequest, XhrMeta>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  proto.open = function (this: XMLHttpRequest, method: string, url: string, ...rest: any[]) {
    xhrMeta.set(this, {
      method: method.toUpperCase(),
      url: typeof url === 'string' ? url : String(url),
      requestHeaders: {},
      requestSize: 0,
      startTime: 0,
      timestamp: 0,
    })
    return originalOpen.call(this, method, url, ...rest)
  }

  proto.setRequestHeader = function (this: XMLHttpRequest, header: string, value: string) {
    const m = xhrMeta.get(this)
    if (m) m.requestHeaders[header] = value
    return originalSetRequestHeader.call(this, header, value)
  }

  proto.send = function (this: XMLHttpRequest, body?: Document | XMLHttpRequestBodyInit | null) {
    const m = xhrMeta.get(this)
    if (m) {
      m.requestSize = estimateBodySize(body ?? null)
      m.startTime = performance.now()
      m.timestamp = Date.now()

      this.addEventListener('loadend', () => {
        const duration = performance.now() - m.startTime

        // Parse response headers from raw string
        const responseHeaders: Record<string, string> = {}
        const rawHeaders = this.getAllResponseHeaders()
        for (const line of rawHeaders.trim().split('\r\n')) {
          const idx = line.indexOf(': ')
          if (idx !== -1) {
            responseHeaders[line.slice(0, idx).toLowerCase()] = line.slice(idx + 2)
          }
        }

        const entry = {
          method: m.method,
          url: m.url,
          status: this.status,
          statusText: this.statusText || (this.status === 0 ? 'Network Error' : ''),
          duration: Math.round(duration),
          requestHeaders: m.requestHeaders,
          responseHeaders,
          // Response size varies by responseType
          responseSize: getXhrResponseSize(this),
        }

        recordEntry(entry)
        xhrMeta.delete(this) // cleanup
      })
    }

    return originalSend.call(this, body)
  }
}

function getXhrResponseSize(xhr: XMLHttpRequest): number {
  if (!xhr.response) return 0
  if (typeof xhr.response === 'string') return xhr.response.length
  if (xhr.response instanceof Blob) return xhr.response.size
  if (xhr.response instanceof ArrayBuffer) return xhr.response.byteLength
  try { return JSON.stringify(xhr.response).length } catch { return 0 }
}
```

## Key Insights

- **WeakMap**: XHR instances are GC'd when no longer referenced — WeakMap entries are automatically cleaned up, preventing memory leaks. No manual cleanup needed except post-`loadend` for tidiness.
- **`loadend` not `onload`**: `loadend` is the only event that fires for every outcome. `onload` only fires on success; `onerror` only on network failure. `loadend` catches all of them.
- **Shadow DOM isolation**: `window` is NOT isolated by Shadow DOM. Patching `window.fetch` and `XMLHttpRequest.prototype` from inside a Shadow DOM widget affects the entire host page — which is exactly what you want for network monitoring.
- **`status: 0`**: Network errors (DNS failure, connection refused, CORS abort) result in `status: 0` with empty `statusText`. Always add a fallback: `this.statusText || (this.status === 0 ? 'Network Error' : '')`.
- **What is NOT captured**: Browser-initiated resource loads (images, scripts, CSS, navigation) happen before JS runs and cannot be intercepted by JavaScript at all.

## When to Use

- Building browser devtools widgets or extensions that monitor network traffic
- Analytics/error tracking SDKs that need full network visibility
- Any situation where `window.fetch` patching alone misses requests (Axios, jQuery, legacy code often use XHR)
- Combine with fetch patching: call `installXhrInterceptor()` at the end of `installNetworkInterceptor()` so one function installs both
