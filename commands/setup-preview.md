---
description: Set up Vercel preview subdomain with auto-sync branch and SEO protection. Pattern: {repo-name}-preview.jbcloud.app
---

# Setup Preview Subdomain

Configure a stable preview subdomain on Vercel with automatic branch sync and search engine blocking.

## Usage

```
/setup-preview                           # Auto-detect repo name
/setup-preview --subdomain custom-name   # Custom subdomain
/setup-preview --dry-run                 # Show what would be created
```

## Arguments

Parse `$ARGUMENTS` for:
- `--subdomain <name>` or `-s` - Override the auto-generated subdomain name
- `--dry-run` or `-d` - Preview changes without creating files
- `--branch <name>` - Use a different branch name (default: `preview`)

---

## Subdomain Pattern

```
{repo-name}-preview.jbcloud.app
```

The repo name is sanitized:
- Lowercase
- Remove hyphens and special characters
- Examples:
  - `claude-codex` → `claudecodex-preview.jbcloud.app`
  - `HDFlowsheet-Cloud` → `hdflowsheetcloud-preview.jbcloud.app`
  - `jb-cloud-docs` → `jbclouddocs-preview.jbcloud.app`

---

## Execution Steps

### 1. Detect Framework

Check for config files:

| Framework | Config File | robots.txt Location |
|-----------|-------------|---------------------|
| Next.js | `next.config.*` | `app/robots.ts` |
| Astro | `astro.config.*` | `src/pages/robots.txt.ts` |
| Remix | `remix.config.*` | `app/routes/robots[.]txt.ts` |
| SvelteKit | `svelte.config.*` | `src/routes/robots.txt/+server.ts` |
| Static | None | Skip robots handler |

### 2. Get Repo Name

```bash
# From git remote
git remote get-url origin | sed 's/.*\/\([^/]*\)\.git/\1/' | tr -d '-' | tr '[:upper:]' '[:lower:]'
```

### 3. Create/Update vercel.json

Merge headers config with existing vercel.json:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "host",
          "value": "{sanitized-repo-name}-preview.jbcloud.app"
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

### 4. Create robots.txt Handler

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

### 5. Create GitHub Actions Workflow

Create `.github/workflows/preview.yml`:

```yaml
name: Sync Preview Branch

on:
  push:
    branches-ignore:
      - preview

permissions:
  contents: write

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

---

## Output Format

```markdown
## Preview Subdomain Setup

**Repository**: {repo-name}
**Framework**: {Next.js/Astro/etc}
**Subdomain**: {sanitized-name}-preview.jbcloud.app

### Files Created/Modified

| File | Action |
|------|--------|
| `vercel.json` | Updated (added headers) |
| `app/robots.ts` | Created |
| `.github/workflows/preview.yml` | Created |

### Manual Steps Required

Complete these in Vercel Dashboard:

1. **Add Domain**
   - Go to: Project Settings → Domains
   - Add: `{subdomain}-preview.jbcloud.app`

2. **Assign to Branch**
   - Click Edit on the domain
   - Set Git Branch: `preview`
   - Save

3. **Enable System Env Vars**
   - Go to: Project Settings → Environment Variables
   - Enable: "Automatically expose System Environment Variables"

### Verification

After completing manual steps:
1. Push to any branch
2. Check GitHub Actions completed
3. Visit: https://{subdomain}-preview.jbcloud.app
4. Verify `X-Robots-Tag: noindex` in response headers

### Ready!

Production: https://{production-domain}
Preview: https://{subdomain}-preview.jbcloud.app
```

---

## Example

```
User: /setup-preview

Claude: Detecting project configuration...

## Preview Subdomain Setup

**Repository**: claude-codex
**Framework**: Astro
**Subdomain**: claudecodex-preview.jbcloud.app

### Files Created/Modified

| File | Action |
|------|--------|
| `landing/vercel.json` | Updated (added headers) |
| `landing/src/pages/robots.txt.ts` | Created |
| `.github/workflows/preview.yml` | Created |

### Manual Steps Required

1. **Add Domain** in Vercel: `claudecodex-preview.jbcloud.app`
2. **Assign to Branch**: `preview`
3. **Enable System Env Vars**: "Automatically expose System Environment Variables"

Ready! Push to any branch to trigger the preview sync.
```

---

## How It Works

```
Developer pushes to any branch
         │
         ▼
GitHub Actions triggers
         │
         ▼
Force-pushes commit to `preview` branch
         │
         ▼
Vercel detects push to `preview`
         │
         ▼
Deploys to {repo}-preview.jbcloud.app
         │
         ▼
Headers block search indexing
```

---

## Notes

- The `preview` branch is auto-managed - don't commit directly to it
- Works with monorepos (specify root directory in Vercel)
- Third-party integrations can use the stable preview URL
- SEO remains protected - only production is indexed

---

## Verified Working Setup (claude-codex)

This command was successfully tested on the claude-codex project:

| Component | Value |
|-----------|-------|
| Production | `codex.jbcloud.app` |
| Preview | `claudecodex-preview.jbcloud.app` |
| Framework | Astro |
| Branch | `preview` (auto-synced) |

**Files created:**
- `landing/vercel.json` - noindex headers for preview host
- `landing/src/pages/robots.txt.ts` - Dynamic robots based on branch
- `.github/workflows/preview.yml` - Auto-sync workflow

---

## DNS Configuration

For `*.jbcloud.app` subdomains to work with Vercel:

**Cloudflare DNS (if using Cloudflare for jbcloud.app):**
```
Type: CNAME
Name: *
Target: cname.vercel-dns.com
Proxy: DNS only (gray cloud)
```

**Or per-subdomain:**
```
Type: CNAME
Name: claudecodex-preview
Target: cname.vercel-dns.com
```

---

## Troubleshooting

### "Branch preview not found"
The workflow creates the branch on first push. Either:
1. Push any commit to main to trigger the workflow
2. Or manually create: `git checkout -b preview && git push -u origin preview`

### "Permission denied" in GitHub Actions
The workflow needs `contents: write` permission. Verify the workflow includes:
```yaml
permissions:
  contents: write
```

### Preview not updating
1. Check GitHub Actions completed: `gh run list --workflow="Sync Preview Branch"`
2. Check Vercel deployment: Project → Deployments tab
3. Verify domain is assigned to `preview` branch in Vercel

### Headers not applied
Vercel headers only apply when the `has` condition matches. Verify:
- Domain exactly matches `vercel.json` headers config
- Deployment completed after `vercel.json` was updated

---

## Related

- `/deploy-check` - Pre-deployment verification
- `/setup-github-actions` - Configure other workflows
- `/jbdocs` - Sync documentation (includes preview setup option)

## Reference

Based on: https://jonrh.is/preview-subdomain-nextj-vercel
