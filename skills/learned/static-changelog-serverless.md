# Static Changelog for Serverless Deployments

## Pattern: project_specific
## Project: WP Dispatch, Vercel apps

## Problem

Git history is not available at runtime on serverless platforms (Vercel, Cloudflare Workers). You can't dynamically generate changelogs from `git log`.

## Solution

Use a hardcoded changelog data structure in a dedicated page component:

```typescript
interface ChangelogEntry {
  version: string;
  date: string;
  tag: "major" | "minor" | "patch";
  changes: { type: "feat" | "fix" | "refactor" | "chore"; text: string }[];
}

const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.2.0",
    date: "2026-02-16",
    tag: "minor",
    changes: [
      { type: "feat", text: "User-facing description of change" },
    ],
  },
];
```

## Key Details

- Curate entries from git history into user-facing language (not raw commit messages)
- Group by semantic version, not by date
- Color-code change types with badges (feat=green, fix=amber, refactor=blue)
- Include a breadcrumb back to settings/parent page
- Must update manually each release

## When to Apply

- Any Vercel or Cloudflare Workers deployed app that needs a changelog
- When `git log` is unavailable at runtime
- When you want a polished, user-friendly changelog (not raw commits)
