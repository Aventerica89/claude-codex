# Supabase CLI as MCP Fallback

**Extracted:** 2026-02-21
**Context:** When Supabase MCP shows "Needs authentication" in Claude Code

## Problem
The Supabase MCP (`plugin:supabase:supabase`) requires OAuth authentication and sometimes shows "Needs authentication" even when previously configured. This blocks project creation and management operations.

## Solution
The Supabase CLI (`npx supabase`) uses its own auth store (separate from Claude Code MCP auth) and is often already authenticated from previous CLI use. Use it as a direct fallback.

```bash
# Check if already logged in + list projects
npx supabase projects list

# Create a new project
npx supabase projects create "project-name" \
  --org-id <ORG_ID> \
  --region us-east-1 \
  --db-password "$(openssl rand -base64 32 | tr -d '=/+' | head -c 32)"

# Link local directory to project
npx supabase --workdir /path/to/project link --project-ref <REF_ID>

# Get API keys
npx supabase projects api-keys --project-ref <REF_ID>

# Push migrations
npx supabase --workdir /path/to/project db push --linked --password "<DB_PASSWORD>"
```

## Where to Find Org ID
From `npx supabase projects list` output — the `ORG ID` column on any existing project.

## When to Use
- Supabase MCP shows "! Needs authentication" in `claude mcp list`
- Any Supabase project creation, migration, or API key retrieval task
- User says "set up Supabase" or "create a Supabase project"
