---
name: help-hub
description: Use when adding an in-app help/onboarding hub to a dashboard app. Triggers when a project needs a Getting Started page, feature guide, or in-app documentation with tabbed navigation. Also use when the existing help is buried in Settings and needs to be promoted to a first-class nav item.
---

# In-App Help Hub

## Commands

- `/help-hub` — run this skill to add an in-app help hub to a project
- `/help-hub:sync` — sync an existing help hub with the latest template (see `help-hub-sync` skill)

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

### Getting Started Cards — Exact Spacing (CRITICAL)

Use `space-y-3` between cards and `p-4` padding inside. **Do not use `space-y-6` or `gap-6`** — it creates excessive visual gaps between steps.

```tsx
function GettingStartedTab() {
  return (
    <div className="space-y-3 mt-6">
      {gettingStarted.map((item) => (
        <Link key={item.step} href={item.href}>
          <div className="flex gap-4 p-4 rounded-lg border hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer group">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {item.step}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-medium">{item.title}</p>
                {item.step <= 3 && (
                  <Badge variant="secondary" className="text-xs">Recommended</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>
      ))}
    </div>
  );
}
```

**Key classes:**
- Container: `space-y-3 mt-6` — 12px gap, not 24px
- Card: `p-4 rounded-lg border` — compact internal padding
- Step circle: `h-7 w-7 rounded-full` — 28px circle

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

---

## Settings Deep Links (From Help Content)

**Always link from help content directly to the relevant settings panel** so users can act on instructions immediately rather than hunting for the right page.

### Next.js Apps (Standard Pattern)

Settings tabs are real routes — use `<Link>`:

```tsx
// In Getting Started steps or Connections Guide cards:
<Link href="/settings/api-keys" className="text-primary underline">
  Settings → API Keys
</Link>
<Link href="/settings/git-sync">
  Settings → Git Sync
</Link>
```

### Single-Page Apps / CF Workers (Hash Routing)

When the app is served from a single route (e.g., Cloudflare Workers serving `/admin`), real routes aren't available. Use `#` fragment routing instead.

**Pattern:** `/{app-path}#settings/{tab}` and `/{app-path}#help/{tab}`

**Implementation:**

```javascript
// 1. Update hash when navigating to settings
function showSettingsView(tab) {
  // ... show/hide views ...
  history.replaceState(null, '', '/admin#settings/' + tab);
  switchSettingsTab(tab);
}

// 2. Update hash when navigating to help
function showHelpView(tab) {
  // ... show/hide views ...
  history.replaceState(null, '', '/admin#help/' + (tab || 'getting-started'));
  switchHelpTab(tab || 'getting-started');
}

// 3. Clear hash when navigating to main view
function showMainView() {
  // ...
  history.replaceState(null, '', '/admin');
}

// 4. Handle hashchange for <a href> link clicks
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('settings/')) {
    showSettingsView(hash.slice('settings/'.length) || 'default-tab');
  } else if (hash.startsWith('help/')) {
    showHelpView(hash.slice('help/'.length) || 'getting-started');
  } else if (!hash) {
    showMainView();
  }
});

// 5. Read hash on init for direct deep links / bookmarks
async function init() {
  await loadData();
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('settings/')) {
    showSettingsView(hash.slice('settings/'.length));
  } else if (hash.startsWith('help/')) {
    showHelpView(hash.slice('help/'.length));
  }
}
```

**Key rule:** Use `history.replaceState` (not `location.hash =`) in view functions — avoids triggering the `hashchange` listener during programmatic navigation, preventing feedback loops.

**Link from help content in SPA:**

```javascript
// In Getting Started steps or Connections Guide cards:
'<a href="/admin#settings/api-keys">Settings → API Keys</a>'
'<a href="/admin#settings/git-sync">Settings → Git Sync</a>'
```

### Deep Link Reference Table

| Target | Next.js route | SPA/CF Workers hash |
|--------|--------------|---------------------|
| API Keys settings | `/settings/api-keys` | `/admin#settings/api-keys` |
| Git Sync settings | `/settings/git-sync` | `/admin#settings/git-sync` |
| Help: Getting Started | `/help?tab=getting-started` | `/admin#help/getting-started` |
| Help: Connections | `/help?tab=connections` | `/admin#help/connections` |

---

## WP Dispatch Reference

Live implementation: `src/app/(dashboard)/help/page.tsx` in wp-dispatch repo.
Commit: `3f23368` — 14 features, 6 getting-started steps, connection tier table.

## URLsToGo Reference (SPA/Hash Routing)

Live implementation: `src/index.js` in URLsToGo repo (Cloudflare Workers single-file SPA).
Commit: `4863d06` — hash deep links + repo search/pagination/favorites in Git Sync settings.
