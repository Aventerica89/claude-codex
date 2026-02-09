# Learned: shadcn Tabs Component for Tabbed Settings Pages

**Extracted:** 2026-02-05
**Session:** jb-cloud-app-tracker - Adding tabbed navigation to Settings page
**Status:** Production-tested

## Problem

Settings pages often combine multiple feature groups (user profile, API tokens, application settings). A flat layout becomes cluttered. Tabbed interfaces organize content logically without requiring multiple pages.

## Solution

### 1. Install Tabs Component

```bash
npx shadcn@latest add tabs
```

This installs both the component AND its Radix UI dependency (now unified under `radix-ui` package, not individual `@radix-ui/*` packages).

### 2. Structure - Use in Server Component Page

```tsx
// src/app/(dashboard)/settings/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/settings/profile-form"
import { TokensForm } from "@/components/settings/tokens-form"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="tokens">API Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <ProfileForm />
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4">
          <TokensForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 3. Key Architectural Details

**Tabs Component Usage:**
- `Tabs` is a client component (has `"use client"` directive internally)
- Can be imported and used directly in Server Component pages
- `defaultValue` prop sets initial active tab
- Each `TabsTrigger` has a `value` prop that matches corresponding `TabsContent`

**StyleClassMap:**
- `TabsList` - Container for triggers, often use `grid w-full grid-cols-N`
- `TabsTrigger` - Individual tab button (clickable)
- `TabsContent` - Content panel that shows when tab is active
- Add `className="space-y-4"` to content for internal spacing

### 4. Form Component Pattern

Each form stays in its own component file:

```tsx
// src/components/settings/profile-form.tsx
"use client"

import { useFormState } from "react-dom"
import { updateProfile } from "@/lib/actions/users"

export function ProfileForm() {
  const [state, formAction] = useFormState(updateProfile, null)

  return (
    <form action={formAction} className="space-y-4">
      {/* Form fields */}
    </form>
  )
}
```

Benefits:
- Each form can independently handle `"use client"` if needed
- Server Actions still work (imported into client form)
- Clean separation of concerns
- Forms don't need to know about tab structure

### 5. Scroll Behavior & Layout

When using Tabs in a full-page layout:
- Remove scroll constraints from parent containers
- Let TabsContent handle its own overflow if needed
- Example: Changelog component inside TabsContent can have `max-h` and `overflow-y-auto`:

```tsx
<TabsContent value="changelog" className="max-h-[600px] overflow-y-auto">
  <Changelog />
</TabsContent>
```

## Common Patterns

### Dynamic Tab Display

```tsx
const tabs = [
  { value: "profile", label: "Profile" },
  { value: "tokens", label: "API Tokens" },
  { value: "changelog", label: "Changelog" }
]

<TabsList className={`grid w-full grid-cols-${tabs.length}`}>
  {tabs.map(tab => (
    <TabsTrigger key={tab.value} value={tab.value}>
      {tab.label}
    </TabsTrigger>
  ))}
</TabsList>

{tabs.map(tab => (
  <TabsContent key={tab.value} value={tab.value}>
    {/* Content for this tab */}
  </TabsContent>
))}
```

### With Icons

```tsx
import { SettingsIcon, KeyIcon } from "lucide-react"

<TabsList className="grid w-full grid-cols-2">
  <TabsTrigger value="profile" className="flex items-center gap-2">
    <SettingsIcon className="w-4 h-4" />
    Profile
  </TabsTrigger>
  <TabsTrigger value="tokens" className="flex items-center gap-2">
    <KeyIcon className="w-4 h-4" />
    API Tokens
  </TabsTrigger>
</TabsList>
```

### Controlled Tab State

If you need to control tab state from outside:

```tsx
"use client"

import { useState } from "react"
import { Tabs } from "@/components/ui/tabs"

export function TabbedSettings() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Triggers and content */}
    </Tabs>
  )
}
```

## Known Issues & Workarounds

### Issue: Radix UI Package False Positive

**Problem:** Code review tools (like Gemini) may flag `radix-ui` as non-existent package.

**Why:** Radix UI recently unified individual `@radix-ui/*` packages into single `radix-ui` package. Older tools have outdated knowledge.

**Solution:** Ignore the warning - it's a false positive. The package is correctly installed by shadcn.

```
Install confirmed: npm list radix-ui
radix-ui@1.0.0 (or higher)
```

### Issue: Form Actions Not Triggering

**Problem:** Server Action in form doesn't execute.

**Solution:** Ensure form component has `"use client"` and imports Server Action correctly:
```tsx
"use client"
import { updateProfile } from "@/lib/actions/users"  // Server Action

export function ProfileForm() {
  return <form action={updateProfile}>...</form>
}
```

## When to Use This Pattern

- Settings pages with multiple logical sections
- Admin dashboards with different config areas
- Onboarding flows with sequential steps
- Documentation with multiple sections (API docs, guides, examples)
- Any page combining 3+ form groups

## Performance Considerations

- All tab content is rendered initially (not lazy-loaded)
- For heavy components, use dynamic imports or lazy loading:

```tsx
import dynamic from "next/dynamic"

const HeavyChart = dynamic(() => import("@/components/heavy-chart"), {
  loading: () => <div>Loading...</div>
})

<TabsContent value="analytics">
  <HeavyChart />
</TabsContent>
```

## When NOT to Use

- Single-section settings pages (just use a regular layout)
- Complex multi-step workflows (use Stepper/Wizard pattern instead)
- Mobile with many tabs (> 4 tabs - use sidebar navigation or accordion instead)
