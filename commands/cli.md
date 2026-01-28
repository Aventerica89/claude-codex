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
| **n8n** | `search_workflows`, `execute_workflow`, `get_workflow_details` | Workflow automation |
| **HubSpot** | `search_crm_objects`, `get_properties`, `search_owners` | CRM data |
| **Figma** | `get_screenshot`, `get_design_context`, `get_metadata` | Design assets, UI code |

### CLI Tools (via Bash)

| Tool | Commands | Use For |
|------|----------|---------|
| **git** | status, diff, log, add, commit, push | Version control |
| **gh** | issue, pr, repo, api | GitHub operations |
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
| `CLAUDE.md` | Project context |

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
