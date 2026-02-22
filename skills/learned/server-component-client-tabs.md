# Server Component + Client Tabs Pattern

**Extracted:** 2026-02-22
**Context:** Adding tabbed layouts to Next.js server component pages that fetch data

## Problem

Dashboard pages are often server components (async data fetching). shadcn Tabs are client components (Radix). You can't use `useSearchParams` in a server component, but you need URL-synced tab state.

## Solution

Create a thin client wrapper that accepts tab definitions (value, label, ReactNode content) as props. The server component passes pre-rendered JSX as tab content.

```tsx
// settings-tabs.tsx ("use client")
function SettingsTabsInner({ tabs }: { tabs: Tab[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const currentTab = searchParams.get("tab") ?? tabs[0]?.value ?? ""

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === tabs[0]?.value) {
      params.delete("tab")  // clean URL for default tab
    } else {
      params.set("tab", value)
    }
    router.replace(qs ? `?${qs}` : "?", { scroll: false })
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList variant="line">...</TabsList>
      {tabs.map(tab => <TabsContent>...</TabsContent>)}
    </Tabs>
  )
}

// Wrap in Suspense for useSearchParams
export function SettingsTabs({ tabs }: { tabs: Tab[] }) {
  return <Suspense><SettingsTabsInner tabs={tabs} /></Suspense>
}
```

```tsx
// page.tsx (server component — async)
export default async function SettingsPage() {
  const data = await fetchData()
  return (
    <SettingsTabs tabs={[
      { value: "main", label: "Main", content: <MainPanel data={data} /> },
      { value: "other", label: "Other", content: <OtherPanel /> },
    ]} />
  )
}
```

## Key Details

- Suspense boundary required around useSearchParams (Next.js 14+)
- Default tab strips `?tab=` from URL for clean URLs
- `scroll: false` on router.replace prevents page jump
- Server-rendered JSX passes through as ReactNode props — no serialization issues

## When to Use

- Any server component page that needs tabbed navigation
- Replacing flat "dump everything" layouts with organized tab groups
- Pages with 2+ distinct content sections
