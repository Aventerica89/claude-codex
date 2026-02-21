---
name: help-hub-sync
description: Use when syncing a project's help hub implementation with the latest help-hub skill standards. Audits the help page for incorrect card spacing, missing deep links to settings panels, and outdated Connections Guide links. Run after updating the help-hub skill or when a project's help page was built before the latest standards were in place.
---

# Help Hub Sync

Audits and updates the current project's help hub implementation to match the latest standards from the help-hub skill.

## What This Checks

1. **Card spacing** — Getting Started tab must use `space-y-3` (not `space-y-4`, `space-y-6`, or `gap-*`)
2. **Settings deep links** — Getting Started steps that mention Settings must have `href="/settings/..."` links
3. **Connections Guide links** — REST API card links to API keys settings; CI/CD card links to git-sync or equivalent
4. **Redirect** — `/settings/about` redirects to `/help`

## Workflow

### Step 1: Find the Help Page

```bash
find src -name "*.tsx" | xargs grep -l "Getting Started\|GettingStarted\|gettingStarted" 2>/dev/null
```

Read the file. For SPA apps (Cloudflare Workers), search for the help tab render function in the main worker file.

### Step 2: Check Card Spacing

In the `GettingStartedTab` function, find the container div/element:

- PASS: `space-y-3`
- FAIL: `space-y-4`, `space-y-6`, `space-y-8`, `gap-4`, `gap-6`, `gap-8`

**Fix:** Replace with `space-y-3 mt-6`

### Step 3: Check Settings Deep Links

Scan the `gettingStarted` data array and each `<Link href=...>`. Flag any step whose `detail` text mentions "Settings", "API key", or specific settings pages but whose `href` points to a generic location (`/`, `#`, empty, or a non-settings path).

**Expected patterns:**

| Step mentions | Expected href |
|--------------|---------------|
| API keys | `/settings/api-keys` or `/admin#settings/api-keys` |
| Git Sync / preview links | `/settings/git-sync` or `/admin#settings/git-sync` |
| Basecamp | `/settings/basecamp` |
| Profile | `/settings/profile` |
| Notifications | `/settings/notifications` |

### Step 4: Check Connections Guide

Find the Connections Guide tab content. Look for:

- **REST API section**: Should include a link to the API keys settings page
- **CI/CD section**: Should include a link to the git-sync settings page (if applicable)
- **Getting Started link**: The Connections Guide should reference `/help?tab=getting-started` or equivalent

**Flag** any card that describes an API key or integration setup step without an actionable link.

### Step 5: Check Redirect

```bash
cat src/app/\(dashboard\)/settings/about/page.tsx 2>/dev/null
```

Should contain: `redirect("/help")`

If the file doesn't exist or doesn't redirect, note it.

### Step 6: Apply Fixes

For each issue found:

1. **Spacing**: Update the container className
2. **Missing href**: Update the `gettingStarted` data object's `href` field, or the card content
3. **Missing Connections link**: Add `<Link href="...">` to the relevant card
4. **Missing redirect**: Create `src/app/(dashboard)/settings/about/page.tsx` with redirect

### Step 7: Report

```
Help Hub Sync complete.

Fixed:
- [x] Card spacing: space-y-6 → space-y-3
- [x] Step 5 href: "/settings" → "/settings/api-keys"
- [x] Connections Guide: added API keys link to REST API card

No action needed:
- [x] Redirect: /settings/about → /help already present
- [x] Connections Guide CI/CD card: link already correct

Skipped (not applicable):
- Git Sync section: no git-sync settings in this app
```

## Reference

Correct Getting Started card pattern (from help-hub skill):

```tsx
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
```

## Live Reference Implementations

- **WP Dispatch** (`src/app/(dashboard)/help/page.tsx`, commit `3f23368`) — Next.js, 6 steps, all with deep links
- **URLsToGo** (`src/index.js`, commit `4863d06`) — CF Workers SPA, hash routing
