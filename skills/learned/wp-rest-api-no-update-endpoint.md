# WordPress REST API Has No Plugin/Theme Update Endpoint

**Extracted:** 2026-02-16
**Context:** WordPress site management tools that need to trigger plugin/theme version updates remotely

## Problem

WordPress REST API's `/wp/v2/plugins/{slug}` endpoint only supports `{ status, auto_update }` fields. Sending `{ update: true }` returns HTTP 200 but performs no update — a "silent success" that makes the feature appear broken without any error signal.

The same applies to `/wp/v2/themes/{slug}` — no update trigger exists in the standard API.

Version updates require the `Plugin_Upgrader` / `Theme_Upgrader` PHP classes, which are only accessible through a custom REST endpoint (like a connector plugin that wraps these classes).

## Solution

1. **Never fall back to standard WP REST API for version updates** — it will silently do nothing
2. **Require a connector plugin** that exposes custom endpoints wrapping the PHP upgrader classes
3. **Use a prefixed error convention** (e.g., `CONNECTOR_REQUIRED:`) so downstream code can parse the reason machine-readably
4. **Surface connector availability in the UI** — check each site's connector status upfront and show warnings before users attempt updates

## Pattern: Prefixed Error Convention

```typescript
// In the API client — throw with a parseable prefix
throw new Error("CONNECTOR_REQUIRED: Plugin updates require the connector.");

// In the route handler — parse prefix into a typed reason field
const reason = errorMsg.startsWith("CONNECTOR_REQUIRED")
  ? "connector_required"
  : "update_failed";

// In the UI — branch on reason for actionable messaging
result.reason === "connector_required"
  ? <a href="/settings/plugin">Install connector</a>
  : <span>{result.message}</span>
```

## When to Use

- Building any WordPress management tool that triggers remote updates
- Any time you're wrapping an external API and suspect the endpoint might not support the operation you need
- When designing error handling for features that depend on optional server-side plugins/extensions
