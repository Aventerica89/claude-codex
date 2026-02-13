# Auto-Match Entities by Name (Avoid Manual Foreign Keys)

## Pattern Type
`workarounds` | `project_specific`

## Problem
Users are required to manually enter a foreign key ID (e.g., `basecampProjectId`) to link two entities (site <-> project). This is tedious and error-prone since users don't know numeric IDs.

## Solution
Use bidirectional case-insensitive substring matching on entity names instead of requiring a manual ID mapping.

```typescript
function autoMatchProject(siteName: string, projects: Project[]): Project | undefined {
  const siteNameLower = siteName.toLowerCase();
  return projects.find((p) =>
    p.name.toLowerCase().includes(siteNameLower) ||
    siteNameLower.includes(p.name.toLowerCase())
  );
}
```

### Why Bidirectional?
- Site name "Bernadette Smith" matches project "Bernadette Smith for U.S. Senate" (site inside project)
- Site name "Bernadette Smith for U.S. Senate" matches project "Bernadette Smith" (project inside site)

### Fallback Strategy
1. Check explicit `foreignKeyId` on the record first (user override)
2. Try auto-match by name
3. Fall back to first available entity (graceful degradation)

```typescript
let targetId = explicitId;
if (!targetId && siteName) {
  const matched = autoMatchProject(siteName, allProjects);
  if (matched) targetId = matched.id;
}
if (!targetId) {
  targetId = allProjects[0]?.id; // fallback
}
```

## When to Use
- Linking entities across different systems (CRM <-> project management)
- Situations where users name things consistently across platforms
- When the foreign key field exists but is rarely populated

## Limitations
- Fails if names are very different across systems
- Ambiguous with very short names that match multiple entities
- Should always allow explicit override via the ID field

## Source
bricks-cc: auto-matching client sites to Basecamp projects (2026-02-12)
