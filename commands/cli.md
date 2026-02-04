---
description: List all available CLI capabilities, MCP servers, and tools Claude can use without asking
---

# CLI Capabilities Command

Quick reference for all tools and capabilities available to Claude.

## Behavior

When invoked, output a summary of available capabilities organized by category.

## Output Format

```
## Available Capabilities

### MCP Servers (Remote APIs)

| Server | Tools | Use For |
|--------|-------|---------|
| **1Password** | `list_api_keys`, `get_api_key`, `store_api_key`, `deploy_env_vars` | API keys, secrets, env var deployment |
| **Vercel** | `list_projects`, `get_project`, `list_deployments`, `deploy_to_vercel` | Deployments, project info |
| **Cloudflare** | `workers_list`, `kv_*`, `r2_*`, `d1_*`, `hyperdrive_*` | Edge workers, storage, databases |

### Cloudflare API Tokens (in 1Password)

| Token | 1Password Item | Permissions | Use For |
|-------|---------------|-------------|---------|
| **Workers API** | `Cloudflare API Token` | Workers, D1 | Deployments via wrangler |
| **Zero Trust API** | `CF_ZERO_TRUST_TOKEN` | Access: Apps & Policies | Access bypass rules, app policies |

**Zero Trust API Usage:**
```bash
# Get token from 1Password
CF_ZT_TOKEN=$(op item get "CF_ZERO_TRUST_TOKEN" --vault Business --fields credential)
ACCOUNT_ID="e2613c1c17024c32ab14618614e2b309"

# List Access applications
curl -s "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/apps" \
  -H "Authorization: Bearer $CF_ZT_TOKEN"

# Add bypass policy (example)
curl -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/access/apps/{app_id}/policies" \
  -H "Authorization: Bearer $CF_ZT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Public Routes","decision":"bypass","include":[{"request_uri":{"path":{"starts_with":"/share/"}}}]}'
```

**Dashboard:** https://one.dash.cloudflare.com > Access > Applications
| **n8n** | `search_workflows`, `execute_workflow`, `get_workflow_details` | Workflow automation |
| **HubSpot** | `search_crm_objects`, `get_properties`, `search_owners` | CRM data |
| **Figma** | `get_screenshot`, `get_design_context`, `get_metadata` | Design assets, UI code |

### CLI Tools (via Bash)

| Tool | Commands | Use For |
|------|----------|---------|
| **git** | status, diff, log, add, commit, push | Version control |
| **gh** | issue, pr, repo, api | GitHub operations |
| **op** | inject, run, item get | 1Password secret injection, local env management |
| **vercel** | deploy, env, projects | Vercel CLI |
| **wrangler** | deploy, kv, r2, d1 | Cloudflare CLI |
| **npm/pnpm** | install, run, build | Package management |
| **curl** | API requests | HTTP calls |

### File Operations (Native Tools)

| Tool | Use For |
|------|---------|
| **Read** | Read any file content |
| **Write** | Create/overwrite files |
| **Edit** | Modify existing files |
| **Glob** | Find files by pattern |
| **Grep** | Search file contents |

### Project Detection

| File | Reveals |
|------|---------|
| `.vercel/project.json` | Vercel projectId, orgId |
| `vercel.json` | Vercel config |
| `wrangler.toml` | Cloudflare config |
| `package.json` | Dependencies, scripts |
| `.env.example` | Required env vars |
| `.env*.tpl` | 1Password template (use `op inject` to generate .env files) |
| `CLAUDE.md` | Project context |

### 1Password Dev Workflow

**CRITICAL:** For local env management, ALWAYS use `op` CLI (`op inject`), NOT the WP Manager GUI.

| Approach | Use? | Why |
|----------|------|-----|
| **`op inject`** | ✅ YES | CLI-based, automatable, version controlled, team-friendly |
| **WP Manager GUI** | ❌ NO | GUI-only, manual steps, not scriptable |

**Both are 1Password dev features** - CLI is just the professional approach.

**Setup pattern:**
1. Create `.env.local.tpl` with `{{ op://vault/item/field }}`
2. Add `"env:inject": "op inject -i .env.local.tpl -o .env.local"` to package.json
3. Run `npm run env:inject` to generate .env.local

---

**Rule**: Always check these capabilities BEFORE asking the user for information.
```

## Arguments

Parse `$ARGUMENTS`:
- `--mcp` - Show only MCP server capabilities
- `--tools` - Show only CLI tools
- `--files` - Show only file detection patterns
- No args - Show all

## Quick Examples

```bash
/cli              # Full capabilities list
/cli --mcp        # MCP servers only
/cli --tools      # CLI tools only
```
