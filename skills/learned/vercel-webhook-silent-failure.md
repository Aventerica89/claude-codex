# Vercel GitHub Webhook Silent Failure

**Extracted:** 2026-02-19
**Context:** When Vercel stops auto-deploying on git push with no error or notification

## Problem

You push commits to GitHub but Vercel never deploys them. The Vercel dashboard shows an older deployment as "Production" and no new deployment appears — no error, no notification, just silence.

**Symptoms:**
- `git push origin main` succeeds
- GitHub shows commits merged
- Vercel dashboard shows stale deployment (older commit SHA)
- No build running, no queue, no error

**Root cause:** Vercel's GitHub integration webhook occasionally stops triggering — usually after a webhook timeout, a GitHub outage window, or an unusual push pattern (force push, mass commits, etc.).

## Solution

Force a manual production deploy from the CLI:

```bash
cd /path/to/project
npx vercel --prod --yes
```

This bypasses the GitHub webhook entirely and deploys directly from local source.

## Diagnosis Steps

If you're unsure whether auto-deploy is broken or just slow:

```bash
# 1. Check what commit is live vs what's on main
git log --oneline -3
npx vercel ls --prod  # or: vercel inspect <deployment-url>

# 2. Compare the deployment SHA in Vercel vs current git SHA
git rev-parse --short HEAD
```

If the SHAs don't match after 2+ minutes, the webhook failed.

## Permanent Fix (if it keeps happening)

In GitHub repo → Settings → Webhooks → Vercel webhook → Recent Deliveries.
Look for failed deliveries. Re-deliver manually, or:
1. Delete the Vercel webhook from GitHub
2. Disconnect and reconnect the GitHub integration in Vercel Dashboard

## When to Use

- Production is running old code despite multiple pushes
- `vercel ls` shows no recent builds
- You pushed commits but the site behavior hasn't changed
- Any time you need to guarantee a deploy happened (demos, client launches)
