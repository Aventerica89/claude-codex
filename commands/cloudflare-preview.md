# /cloudflare-preview — Set Up CF Workers Preview Shortlink

Set up a `go.urlstogo.cloud/{repo}--preview` shortlink that auto-updates on every non-main branch push. Designed for Cloudflare Workers projects (not CF Pages or Vercel).

## Arguments

Parse `<args>`:
- No arguments — use current repo name from `git remote`
- `<repo-name>` — override the repo name (e.g., `vaporforge`)
- `--env <name>` — CF Workers environment name (default: `preview`)

## Why This Exists

The standard URLsToGo template (`update-preview-link.yml`) auto-detects:
- Vercel (via `vercel.json`)
- Cloudflare Pages (via `wrangler.toml` + `pages.dev` pattern)
- GitHub Pages

It does NOT handle CF Workers preview environments, which have a fixed `workers.dev` URL
(not dynamic per-branch like Vercel). This command handles that case.

## Step 1: URLsToGo Admin Setup (One-Time)

Open: **go.urlstogo.cloud/admin** → API Keys → **Create New Key**

- Name: `{repo-name}-preview` (e.g., `vaporforge-preview`)
- Copy the key (`utg_xxxxxxxx...`)

Then → Admin → Links → **Create New Link**

- Short code: `{repo-name}--preview` (double dash, e.g., `vaporforge--preview`)
- Destination: `https://{worker-name}.workers.dev/` (any URL — will be overwritten by automation)
- Check **"Is Preview Link"** checkbox (allows API updates)

Store the API key in 1Password:
- Vault: App Dev
- Title: `#{repo-name} / URLSTOGO_PREVIEW_API_KEY`
- Tags: `env-var`, `urlstogo`, project tag

## Step 2: Find the Preview Workers.dev URL

Check `wrangler.toml` or `wrangler.jsonc` for the preview environment:

```bash
grep -A5 '"preview"' wrangler.jsonc || grep -A5 'env.preview' wrangler.toml
```

Look for `name` field in the `[env.preview]` / `"preview"` block.
The workers.dev URL is: `https://{name}.{account-subdomain}.workers.dev`

To find account subdomain:
```bash
npx wrangler whoami 2>/dev/null || cat wrangler.jsonc | grep subdomain
```

Or check a prior deploy output for the workers.dev URL.

## Step 3: Add GitHub Secrets

```bash
# Check which secrets already exist
gh secret list

# Add if missing (retrieve values from 1Password)
gh secret set URLSTOGO_API_KEY --body "utg_xxxxxxxx"
# CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID should already exist from deploy.yml
```

## Step 4: Create the GitHub Actions Workflow

Create `.github/workflows/update-preview-link.yml`:

```yaml
name: Deploy Preview & Update Shortlink

on:
  push:
    branches-ignore:
      - main
  workflow_dispatch:

concurrency:
  group: preview-deploy-${{ github.ref_name }}
  cancel-in-progress: true

jobs:
  deploy-and-update:
    name: Deploy Preview & Update go.urlstogo.cloud/{REPO}--preview
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to preview environment
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env preview

      - name: Update URLsToGo preview shortlink
        env:
          URLSTOGO_API_KEY: ${{ secrets.URLSTOGO_API_KEY }}
        run: |
          set -euo pipefail
          DESTINATION="https://{WORKER_PREVIEW_NAME}.{ACCOUNT_SUBDOMAIN}.workers.dev/"
          PREVIEW_CODE="{REPO}--preview"
          RESPONSE=$(curl -s -w "\n%{http_code}" \
            -X PUT \
            -H "Authorization: Bearer ${URLSTOGO_API_KEY}" \
            -H "Content-Type: application/json" \
            --data "{\"destination\":\"${DESTINATION}\"}" \
            "https://go.urlstogo.cloud/api/preview-links/${PREVIEW_CODE}")
          HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
          BODY=$(echo "$RESPONSE" | head -n-1)
          echo "Response (HTTP $HTTP_CODE): $BODY"
          if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
            echo "Preview link: https://go.urlstogo.cloud/${PREVIEW_CODE}"
          else
            echo "Failed (HTTP $HTTP_CODE)"
            exit 1
          fi
```

Replace placeholders:
- `{REPO}` — repo name (e.g., `vaporforge`)
- `{WORKER_PREVIEW_NAME}` — CF Worker name from `wrangler.jsonc` `env.preview.name` (e.g., `vaporforge-preview`)
- `{ACCOUNT_SUBDOMAIN}` — your workers.dev subdomain (e.g., `jbmd-creations`)

## Step 5: Commit and Push

```bash
git add .github/workflows/update-preview-link.yml
git commit -m "chore: GitHub Actions workflow — deploy preview + update URLsToGo shortlink"
git push origin {current-branch}
```

## How It Works After Setup

1. Push to any non-main branch
2. GitHub Actions builds + deploys to `--env preview` (same fixed workers.dev URL every time)
3. Shortlink destination is updated (even though it's the same URL — confirms the deploy succeeded)
4. `go.urlstogo.cloud/{repo}--preview` always serves the latest non-main branch code

## Key Differences from Standard Template

| | Standard URLsToGo Template | This Command |
|---|---|---|
| Platform | Vercel / CF Pages / GitHub Pages | CF Workers |
| Preview URL | Dynamic (per-branch) | Fixed (workers.dev) |
| Detection | `vercel.json` / `wrangler.toml` | Manual / `wrangler.jsonc` |
| Shortlink update | Needed (URL changes) | Optional (URL fixed, confirms deploy) |

## Verified Working

- VaporForge (`vaporforge--preview` → `vaporforge-preview.jbmd-creations.workers.dev/app/`)
- Date: 2026-02-21
- Uses `cloudflare/wrangler-action@v3` + URLsToGo `PUT /api/preview-links/:code`
