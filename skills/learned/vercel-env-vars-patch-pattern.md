# Vercel Env Vars Update Pattern (PATCH, not POST)

**Extracted:** 2026-02-21
**Context:** Updating existing Vercel environment variables via API

## Problem
`POST /v10/projects/{id}/env` returns `ENV_CONFLICT` error if the variable already exists. You cannot overwrite env vars with POST — you must GET their IDs first, then PATCH each one individually.

## Solution

```bash
VERCEL_TOKEN="..."
PROJECT_ID="prj_..."
TEAM_ID="team_..."

# Step 1: GET all env vars to find their IDs
curl -s "https://api.vercel.com/v10/projects/$PROJECT_ID/env?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
for e in d.get('envs', []):
    print(f'{e[\"id\"]} {e[\"key\"]}')
"

# Step 2: PATCH each var by its ID
curl -s -X PATCH "https://api.vercel.com/v10/projects/$PROJECT_ID/env/{ENV_ID}?teamId=$TEAM_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"value":"new-value","type":"encrypted","target":["production","preview","development"]}'
```

## Notes
- Vercel API token is stored in 1Password under `#cross-app / VERCEL_API_TOKEN` (App Dev vault)
- `TEAM_ID` comes from `.vercel/project.json` as `orgId`
- `PROJECT_ID` comes from `.vercel/project.json` as `projectId`
- Use `type: "encrypted"` for secrets, `type: "plain"` for non-sensitive vars

## When to Use
- Deploying env vars to an existing Vercel project
- `mcp__1p__deploy_env_vars` fails or is unavailable
- Bulk updating env vars from 1Password values
