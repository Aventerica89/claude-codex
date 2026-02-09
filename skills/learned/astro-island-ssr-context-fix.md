# Astro Island SSR Context Fix

## Problem

When using React context hooks (e.g., `useToast`, `useAuth`) inside Astro components rendered with `client:load`, the context provider may not wrap the component during SSR. Astro renders each `client:load` island independently on the server, so a provider in a parent island doesn't wrap child islands during SSR.

**Error**: `useToast must be used within ToastProvider` (or similar context errors during build)

## Root Cause

Astro's island architecture renders `client:load` components independently during SSR. If component A provides context and component B consumes it, but both are separate islands:

```astro
<!-- Parent provides context -->
<DashboardLayout client:load>
  <!-- Child consumes context - but SSR renders this independently -->
  <PluginsPage client:load />
</DashboardLayout>
```

During SSR, `PluginsPage` renders without `DashboardLayout`'s provider wrapping it.

## Solution: No-op Fallback (Preferred)

Make the hook return a safe no-op when context is unavailable, instead of throwing:

```typescript
const noopToast: ToastContextType = {
  toasts: [],
  showToast: () => {},
  removeToast: () => {},
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext)
  return context ?? noopToast
}
```

This is better than `client:only="react"` because it preserves SSR benefits (faster initial load, SEO) while gracefully degrading on the server.

## Alternative: client:only

If the component truly can't render without the context:

```astro
<PluginsPage client:only="react" />
```

This skips SSR entirely. Use only as a last resort since it hurts initial page load.

## When This Applies

- Astro hybrid/server mode with React islands
- Any `createContext` + `useContext` pattern across island boundaries
- Toast systems, auth contexts, theme providers in dashboard layouts

## Tags

astro, react, ssr, context, islands, useContext, hydration
