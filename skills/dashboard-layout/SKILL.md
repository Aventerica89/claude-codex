---
name: dashboard-layout
description: Analyze any dashboard page and generate an interactive HTML mockup with horizontal tabs. Use when reorganizing flat/scrolling dashboard pages into tabbed layouts.
---

# Dashboard Layout Skill

Analyze a dashboard page, propose tab groupings, generate an interactive HTML mockup, and provide implementation guidance.

## Invocation

`/dashboard-layout [page-path-or-description]`

## Workflow

### Step 1 -- Analyze

If a file path is given, read the page code. If a description is given, parse the described features.

**Output:** A numbered list of every content block found (cards, forms, panels, sections).

Example:
```
Content blocks found:
1. Google Calendar -- connection status + sync button
2. Plaid Banking -- connection panel with accounts
3. Todoist -- API token form + sync button
4. AI Providers -- Anthropic, Gemini, DeepSeek, Groq keys
5. About -- link card to /settings/about
6. Privacy Policy -- footer link
```

### Step 2 -- Group

Propose tab groupings based on domain affinity:

**Rules:**
- Items that share a purpose go in one tab
- Each tab should have 2-6 items (not 1, not 12)
- Tab names are short, noun-based: "Integrations", "AI", "Account"
- Present grouping to user via AskUserQuestion before generating

**Example proposal:**
| Tab | Items |
|-----|-------|
| Integrations | Google Calendar, Plaid Banking, Todoist |
| AI | Anthropic, Gemini, DeepSeek, Groq |
| Account | About, Privacy |

### Step 3 -- Generate HTML Mockup

Create a self-contained HTML file and save to `~/Desktop/{page-name}-layout.html`.

**Requirements:**
- Single file, zero external dependencies
- Dark theme: `#0f172a` background, slate palette, system-ui font
- Horizontal tab bar below page title
- Placeholder cards for each item within active tab
- Cards show: icon area, title, 1-line description, status badge placeholder
- JS tab switching (click tab to show/hide content)
- "Copy Layout Plan" button -- copies structured markdown description
- Auto-open in browser via `open` command after saving

**Visual spec:**
```
+------------------------------------------+
| Page Title                               |
| Description text                         |
|                                          |
| [Tab 1]  [Tab 2]  [Tab 3]  [Tab 4]     |
| ---------------------------------------- |
|                                          |
|  +------------------------------------+  |
|  | [icon]  Item Title     [status]    |  |
|  |         One-line description       |  |
|  +------------------------------------+  |
|                                          |
|  +------------------------------------+  |
|  | [icon]  Item Title     [status]    |  |
|  |         One-line description       |  |
|  +------------------------------------+  |
|                                          |
|          [Copy Layout Plan]              |
+------------------------------------------+
```

**Color tokens:**
- Active tab: indigo-400 (`#818cf8`) underline + white text
- Inactive tab: slate-400 (`#94a3b8`) text, hover slate-300
- Cards: `#1e293b` background, `#334155` border, rounded-lg
- Status badges: green (`#4ade80` connected), amber (`#fbbf24` pending), slate (`#64748b` not set up)
- Page background: `#0f172a`

### Step 4 -- Implementation Guidance

After user approves the mockup, output:

1. **Files to create/modify** -- list each with what changes
2. **Components to reuse** -- shadcn `Tabs`, `Card`, `Badge`, `Separator`
3. **Tab content approach** -- inline if small, extract to components if >50 lines per tab
4. **URL hash sync pattern** -- `?tab=ai` search param for deep-linking

Example output:
```
## Implementation Plan

### Modify: src/app/(dashboard)/settings/page.tsx
- Wrap content in <Tabs defaultValue="integrations">
- Add <TabsList> with triggers for each tab
- Wrap each group in <TabsContent value="...">
- Add URL search param sync via client component wrapper

### Reuse:
- Tabs, TabsList, TabsTrigger, TabsContent (shadcn)
- Existing PlaidConnectionPanel, AIProvidersPanel
- Card, Badge for status indicators

### URL Sync:
- Client component reads searchParams.tab on mount
- Updates URL via router.replace on tab change
- Default: "integrations"
```

## "Copy Layout Plan" Output Format

The copy button in the HTML mockup copies this markdown:

```markdown
## Dashboard Layout: {Page Name}

### Tab: {Tab Name}
- {Item title} -- {description} [{status}]
- {Item title} -- {description} [{status}]

### Tab: {Tab Name}
- {Item title} -- {description} [{status}]
```

## Notes

- This skill produces a mockup for review, not production code
- The mockup is a communication tool -- use it to align on layout before coding
- Always ask the user to approve groupings before generating the HTML
- For production implementation, use the project's existing component library
