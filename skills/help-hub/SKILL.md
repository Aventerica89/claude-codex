---
name: help-hub
description: Use when adding an in-app help/onboarding hub to a dashboard app. Triggers when a project needs a Getting Started page, feature guide, or in-app documentation with tabbed navigation. Also use when the existing help is buried in Settings and needs to be promoted to a first-class nav item.
---

# In-App Help Hub

## Overview

A tabbed help hub positioned as a first-class nav item (above Dashboard) with a visual divider. Three standard tabs: **Getting Started** (numbered steps), **Feature Guide** (feature cards), **Connections Guide** (how the app's integration layers work).

URL-driven tab state via `?tab=` for deep linking. Redirect old `/settings/about` → `/help`.

## When to Use

- New app needs onboarding structure
- Help is currently buried in Settings — promote it
- Users need to understand multiple integration layers (REST API / plugin / SSH etc.)
- You want a reusable docs pattern across all your apps

## Standard File Set

```
src/app/(dashboard)/help/page.tsx          ← new tabbed page
src/app/(dashboard)/settings/about/page.tsx ← replace with redirect
src/components/sidebar.tsx                  ← add entry above Dashboard
src/components/bottom-nav.tsx               ← add to More sheet (mobile)
```

## Sidebar Convention

Add **above** the main nav items array, with a separator divider below it:

```tsx
import { BookOpen } from "lucide-react";

{/* Getting Started — stands apart above main nav */}
<div className="mb-2">
  <Link
    href="/help"
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      pathname === "/help" || pathname.startsWith("/help/")
        ? "bg-slate-800 text-white"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    )}
  >
    <BookOpen className="h-5 w-5" />
    Getting Started
  </Link>
</div>
<div className="mb-3 border-t border-slate-800" />

{/* regular navItems.map() below */}
```

## Tab Page Pattern

```tsx
"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const VALID_TABS = ["getting-started", "feature-guide", "connections"] as const;
type TabId = (typeof VALID_TABS)[number];

function HelpTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab") ?? "getting-started";
  const tab: TabId = (VALID_TABS as readonly string[]).includes(rawTab)
    ? (rawTab as TabId)
    : "getting-started";

  return (
    <Tabs value={tab} onValueChange={(v) => router.replace(`/help?tab=${v}`, { scroll: false })}>
      <TabsList className="w-full justify-start">
        <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
        <TabsTrigger value="feature-guide">Feature Guide</TabsTrigger>
        <TabsTrigger value="connections">Connections Guide</TabsTrigger>
      </TabsList>
      <TabsContent value="getting-started"><GettingStartedTab /></TabsContent>
      <TabsContent value="feature-guide"><FeatureGuideTab /></TabsContent>
      <TabsContent value="connections"><ConnectionsTab /></TabsContent>
    </Tabs>
  );
}

export default function HelpPage() {
  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">{APP_NAME}</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">{ONE_LINE_DESCRIPTION}</p>
      </div>
      <Suspense><HelpTabs /></Suspense>
    </div>
  );
}
```

## Tab Content Conventions

| Tab | Content | Component type |
|-----|---------|----------------|
| Getting Started | Numbered steps (1–6 typical), Recommended badge on first 3 | `<Link>` wrapped cards |
| Feature Guide | One card per feature — icon + summary + detail + optional note | shadcn `<Card>` |
| Connections Guide | Prose sections per integration tier + summary table (Required/Recommended/Optional/Best) | shadcn `<Card>` |

## Redirect Old About Page

```tsx
// src/app/(dashboard)/settings/about/page.tsx
import { redirect } from "next/navigation";
export default function AboutPage() { redirect("/help"); }
```

## Deep Link Examples

```
/help                           → Getting Started (default)
/help?tab=feature-guide         → Feature Guide
/help?tab=connections           → Connections Guide
```

Use these in onboarding flows, tooltip "Learn more" links, and settings hub cards.

## Settings Hub Card

Update the existing About/Help card in `/settings/page.tsx` to point to `/help`:

```tsx
{ title: "About & Help", href: "/help", icon: HelpCircle, available: true }
```

## WP Dispatch Reference

Live implementation: `src/app/(dashboard)/help/page.tsx` in wp-dispatch repo.
Commit: `3f23368` — 14 features, 6 getting-started steps, connection tier table.
