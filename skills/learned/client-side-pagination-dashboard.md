# Client-Side Pagination for Dashboard Log Pages

**Extracted:** 2026-02-18
**Context:** Multi-page data dashboard with log entries (Console, Network, Errors, Dev Log)

## Problem

Dashboard pages dump hundreds of log entries with no pagination, making pages slow to scroll and hard to scan. Server-side pagination requires API changes. Need a zero-API-change approach.

## Solution

Fetch a capped dataset (500), filter client-side, slice into pages of 20. Five additions to any existing list page:

### 1. Constants + State

```tsx
const PAGE_SIZE = 20
// inside component:
const [page, setPage] = useState(1)
```

### 2. Compute Pages from Filtered Data

```tsx
const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
const safePage = Math.min(page, totalPages)
const paged = filtered.slice(
  (safePage - 1) * PAGE_SIZE,
  safePage * PAGE_SIZE
)
```

`safePage` prevents showing an empty page when filters reduce total pages below current page.

### 3. Reset Page on Filter Change

```tsx
useEffect(() => {
  setPage(1)
}, [filterLevel, searchQuery])
```

### 4. Render Paged Subset

Replace `{filtered.map(...)}` with `{paged.map(...)}`.

### 5. Pagination Controls

```tsx
<PaginationControls
  page={safePage}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

Reusable component: Previous / "Page X of Y" / Next. Returns null when totalPages <= 1.

### Bump Fetch Limit

Change `limit=200` to `limit=500` in fetch URL. 500 entries at ~100B each = ~50KB, well within client memory, provides 25 pages.

## Also: Project Labels on Log Entries

When log entries have a `projectId` but no human-readable name:

```tsx
const [projects, setProjects] = useState<Project[]>([])
// fetch /api/projects on mount
const projectMap = new Map(projects.map((p) => [p.id, p.name]))
// in render:
const projectName = projectMap.get(entry.projectId)
{projectName && (
  <span className="text-muted-foreground/70 text-[10px]">{projectName}</span>
)}
```

## Also: Shared Timezone Formatting

Extract `formatTime`/`formatDate` with explicit `timeZone` option to a shared utility instead of duplicating locale-dependent functions across pages:

```ts
const TZ = 'America/Phoenix'
export function formatTime(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: TZ,
  })
}
```

## When to Use

- Dashboard with any data list showing 50+ entries
- Multiple pages sharing the same log/event data shape
- Adding pagination without touching API routes
- Unifying inconsistent date formatting across pages
