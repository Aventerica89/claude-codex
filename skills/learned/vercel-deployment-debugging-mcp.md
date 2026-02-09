# Vercel Deployment Debugging via MCP

## When to Use

When a Vercel deployment fails after `git push` and you need to diagnose and fix the build error without leaving the CLI.

## Workflow

### 1. Check deployment status

```
mcp__claude_ai_Vercel__list_deployments
  projectId: from .vercel/project.json or memory
  teamId: from .vercel/project.json (orgId) or memory
```

Look for `state: "ERROR"` on recent deployments. Note the deployment ID (`dpl_*`).

### 2. Get build logs

```
mcp__claude_ai_Vercel__get_deployment_build_logs
  idOrUrl: "dpl_XXXXX"
  teamId: "team_XXXXX"
  limit: 100
```

Scan for `type: "stderr"` entries with `level: "error"`. Common patterns:
- `Could not resolve "X" from "Y"` - missing import/file
- `getStaticPaths required` - dynamic route needs `prerender = false`
- `Build failed in X.XXs` - Vite compilation error (check preceding lines)

### 3. Fix locally, verify, push

```bash
npm run build > /dev/null 2>&1; echo "EXIT: $?"
```

Always verify the build passes locally before pushing. Then:
```bash
git add <files> && git commit -m "fix: ..." && git push
```

### 4. Monitor redeploy

Wait ~30s then check `list_deployments` again. Look for `state: "READY"` on the new deployment.

### 5. Verify live

```bash
curl -sI https://your-domain.com | head -20
```

Check HTTP 200 and expected headers.

## Common Build Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Could not resolve "./X"` | Missing file/component | Create the file or fix the import |
| `getStaticPaths required` | Dynamic route in hybrid mode | Add `export const prerender = false` |
| Context hook throws during SSR | React context across Astro islands | Return no-op fallback from hook |
| `Command "npm run build" exited with 1` | Any build failure | Check preceding stderr lines |

## Key IDs to Remember

Store these in MEMORY.md for quick access:
- **projectId**: from `.vercel/project.json` `projectId` field
- **teamId**: from `.vercel/project.json` `orgId` field (starts with `team_`)

## Tags

vercel, deployment, debugging, mcp, build-errors, ci-cd
