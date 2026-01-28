# CLI-First Rule

## Core Principle

**ALWAYS check available tools and capabilities BEFORE asking the user for information.**

Claude has extensive CLI access, MCP servers, and file reading capabilities. Use them proactively.

## Before Asking, Check These

### API Keys & Secrets
```
WRONG: "What's your OpenAI API key?"
RIGHT: Check 1Password first → list_api_keys → get_api_key
```

### Project Configuration
```
WRONG: "What's your Vercel project ID?"
RIGHT: Read .vercel/project.json → extract projectId, orgId
       Or use mcp__Vercel__list_projects
```

### Platform Detection
```
WRONG: "What platform are you deploying to?"
RIGHT: Check for config files:
       - vercel.json → Vercel
       - wrangler.toml → Cloudflare
       - netlify.toml → Netlify
       - fly.toml → Fly.io
       - railway.json → Railway
```

### Environment Variables
```
WRONG: "What env vars does this project need?"
RIGHT: Scan .env.example, .env.local.example
       Grep for process.env.* in codebase
       Check package.json scripts
```

### File Contents
```
WRONG: "Can you show me what's in config.ts?"
RIGHT: Just read the file with Read tool
```

### Git Information
```
WRONG: "What branch are you on?"
RIGHT: Run git branch --show-current
```

### GitHub Information
```
WRONG: "What's the issue about?"
RIGHT: Use gh issue view <number>
```

## Decision Tree

When you need information:

```
1. Can I read a file for this?
   → Yes: Read it
   → No: Continue

2. Can I run a command for this?
   → Yes: Run it (git, gh, npm, etc.)
   → No: Continue

3. Is there an MCP tool for this?
   → Yes: Use it (1Password, Vercel, Cloudflare, etc.)
   → No: Continue

4. Can I infer from context?
   → Yes: Use inference
   → No: NOW ask the user
```

## MCP Servers Available

| Need | MCP Server | Tool |
|------|------------|------|
| API key | 1Password | `list_api_keys`, `get_api_key` |
| Vercel info | Vercel | `list_projects`, `get_project` |
| Deploy status | Vercel | `list_deployments`, `get_deployment` |
| Cloudflare resources | Cloudflare | `workers_list`, `kv_*`, `d1_*` |
| Workflow automation | n8n | `search_workflows`, `execute_workflow` |
| CRM data | HubSpot | `search_crm_objects` |
| Design assets | Figma | `get_design_context`, `get_screenshot` |

## Common Patterns

### New Project Setup
```
1. Read package.json for dependencies
2. Read .env.example for required vars
3. Check 1Password for matching keys
4. Detect platform from config files
5. THEN ask only for truly missing info
```

### Deployment
```
1. Read .vercel/project.json for IDs
2. Use Vercel MCP to check project status
3. Scan for env vars needed
4. Check 1Password for keys
5. Deploy without asking unnecessary questions
```

### Debugging
```
1. Read error logs/output
2. Read relevant source files
3. Check git diff for recent changes
4. Run diagnostic commands
5. THEN ask for clarification if still unclear
```

## Never Ask For

These should ALWAYS be retrieved automatically:

- [ ] Vercel/Cloudflare project IDs (read config files)
- [ ] Git status/branch/remote (run git commands)
- [ ] File contents (read them)
- [ ] Package dependencies (read package.json)
- [ ] API keys that might be in 1Password (check first)
- [ ] GitHub issue/PR details (use gh CLI)
- [ ] Current working directory (it's in the environment)

## Exceptions (OK to Ask)

- Confirmation before destructive actions
- Clarification on ambiguous requirements
- User preferences/opinions
- Information that truly doesn't exist anywhere
- Permission to proceed with a plan
