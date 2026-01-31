# Vercel CLI for Production Debugging

**Extracted:** 2026-01-29
**Context:** When Vercel dashboard access is problematic but CLI access works

## Problem

Sometimes you can't access the Vercel dashboard due to:
- Wrong account logged in
- Team permission issues
- 404 errors on deployment pages

But you still need to:
- See deployment status
- Check build logs
- Debug production failures
- Redeploy

## Solution

### 1. Link to Project
```bash
vercel link --yes --project <project-name>
```
This also downloads environment variables to `.env.local`

### 2. List Deployments
```bash
vercel ls
```
Shows recent deployments with status (Ready, Error, Building)

### 3. Inspect Failed Deployment
```bash
vercel inspect <deployment-url>
```
Shows deployment details and status

### 4. Build Locally with Production Config
```bash
vercel pull --yes  # Get project settings
npm run build      # See actual errors
```

### 5. Watch for Successful Deployment
```bash
for i in {1..20}; do
  sleep 15s
  vercel ls | grep "Production" | head -1
done
```

### 6. Check Logged-in Account
```bash
vercel whoami
```

## Key Insight

The Vercel CLI can access everything the dashboard can. If you're logged in with `vercel login`, you have full control even when the web dashboard is inaccessible.

## When to Use

- Vercel dashboard shows 404 or permission errors
- Need to debug production builds remotely
- Want to see deployment status without browser
- Claude Code sessions where web access is limited
