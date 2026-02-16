# React Context Provider Must Wrap ALL Consumer Layouts

**Extracted:** 2026-02-16
**Context:** Next.js App Router with multiple route groups sharing context providers

## Problem
When a component calls a context hook (e.g., `useSidebar()`), every layout that renders that component must be wrapped in the corresponding provider (`SidebarProvider`). If you add the provider to the main dashboard layout but forget secondary layouts (demo, public, etc.), those layouts crash at runtime with "Cannot read properties of null" or similar context errors.

## Solution
Audit ALL route group layouts when adding a new context provider. If any layout renders components that consume the context, wrap it in the provider.

## Example
```tsx
// src/app/(dashboard)/layout.tsx - HAS provider
import { SidebarProvider } from '@/contexts/sidebar-context'

export default function DashboardLayout({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>
}

// src/app/(demo)/layout.tsx - MISSING provider = crash
// If any page under (demo) uses useSidebar(), this layout MUST also wrap in SidebarProvider
export default function DemoLayout({ children }) {
  return <SidebarProvider>{children}</SidebarProvider>  // Add this!
}
```

## When to Use
- When adding a new React context provider to a layout
- When a build fails with context-related errors in secondary route groups
- When refactoring components to use shared hooks across multiple layouts
