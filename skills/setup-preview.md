---
name: setup-preview
description: Set up Vercel preview subdomain with auto-sync branch and SEO protection. Creates {repo-name}-preview.jbcloud.app pattern.
---

# Setup Preview Subdomain

**Command:** `/setup-preview`
**Purpose:** Configure a stable preview subdomain on Vercel with automatic branch sync and search engine blocking.

## Pattern

```
{repo-name}-preview.jbcloud.app
```

Examples:
- `claude-codex` repo → `claudecodex-preview.jbcloud.app`
- `jb-cloud-docs` repo → `jbclouddocs-preview.jbcloud.app`
- `HDFlowsheet-Cloud` repo → `hdflowsheetcloud-preview.jbcloud.app`

## What This Skill Does

### 1. Detects Project Framework

| Framework | Detection | Config File |
|-----------|-----------|-------------|
| Next.js | `next.config.*` | `next.config.js` |
| Astro | `astro.config.*` | `astro.config.mjs` |
| Remix | `remix.config.*` | `remix.config.js` |
| SvelteKit | `svelte.config.*` | `svelte.config.js` |
| Static | None of above | `vercel.json` only |

### 2. Creates/Updates Files

#### vercel.json (All Frameworks)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "{repo-name}-preview.jbcloud.app"
        }
      ],
      "headers": [
        {
          "key": "X-Robots-Tag",
          "value": "noindex, nofollow"
        }
      ]
    }
  ]
}
```

#### robots.txt Handler

**Next.js** (`app/robots.ts`):
```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const isProduction = process.env.VERCEL_GIT_COMMIT_REF === 'main'

  return isProduction
    ? { rules: { userAgent: '*', allow: '/' } }
    : { rules: { userAgent: '*', disallow: '/' } }
}
```

**Astro** (`src/pages/robots.txt.ts`):
```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const isProduction = process.env.VERCEL_GIT_COMMIT_REF === 'main';

  const robotsTxt = isProduction
    ? `User-agent: *\nAllow: /`
    : `User-agent: *\nDisallow: /`;

  return new Response(robotsTxt, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

#### GitHub Actions Workflow (`.github/workflows/preview.yml`)
```yaml
name: Sync Preview Branch

on:
  push:
    branches-ignore:
      - preview

jobs:
  sync-preview:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Sync to preview branch
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git fetch origin preview || git checkout -b preview
          git checkout preview
          git reset --hard ${{ github.sha }}
          git push -f origin preview
```

## Manual Steps (Vercel Dashboard)

After running this skill, complete these in Vercel:

1. **Add Domain**
   - Project Settings → Domains
   - Add: `{repo-name}-preview.jbcloud.app`

2. **Assign to Branch**
   - Click Edit on the new domain
   - Set Git Branch: `preview`
   - Save

3. **Enable System Environment Variables**
   - Project Settings → Environment Variables
   - Enable: "Automatically expose System Environment Variables"

4. **DNS (if not already configured)**
   - Add wildcard CNAME for `*.jbcloud.app` → `cname.vercel-dns.com`

## Usage

```bash
# In any project directory
/setup-preview

# With custom subdomain (overrides default pattern)
/setup-preview --subdomain myapp-staging
```

## How It Works

```
Any branch push
      │
      ▼
GitHub Actions workflow
      │
      ▼
Force-push to `preview` branch
      │
      ▼
Vercel auto-deploys `preview` branch
      │
      ▼
{repo-name}-preview.jbcloud.app updated
```

## Benefits

- **Stable URL**: Third-party integrations always hit the same URL
- **SEO Safe**: Preview never indexed by search engines
- **Auto-Sync**: Every push updates preview automatically
- **Framework Agnostic**: Works with any Vercel-compatible framework

## Verification

After setup, verify:

1. Push to any branch
2. Check GitHub Actions ran successfully
3. Visit `{repo-name}-preview.jbcloud.app`
4. Check response headers include `X-Robots-Tag: noindex, nofollow`
5. Check `/robots.txt` returns `Disallow: /`

## Reference

Based on: https://jonrh.is/preview-subdomain-nextj-vercel

---

**Ready to set up preview subdomain.** Provide project path or run in project directory.
