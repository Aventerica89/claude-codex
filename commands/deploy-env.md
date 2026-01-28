# Deploy Environment Variables

Automatically deploy environment variables from 1Password to a platform.

## Instructions

1. First, check which platforms are available:
   - Call `list_platforms` MCP tool to see installed CLIs

2. Identify which env vars are needed:
   - Look for `.env.example`, `.env.local.example`, or similar files in the project
   - Check `package.json` for common integrations (stripe, openai, supabase, etc.)
   - Ask the user only if unclear

3. Get the target platform:
   - Check if project has `vercel.json` → Vercel
   - Check if project has `netlify.toml` → Netlify
   - Check if project has `wrangler.toml` → Cloudflare
   - Check if project has `fly.toml` → Fly.io
   - Check if project has `railway.json` → Railway
   - If `.github/workflows/` exists → may need GitHub secrets
   - If multiple or unclear, ask user

4. Find matching keys in 1Password:
   - Call `list_api_keys` MCP tool
   - Match by env var name or provider tag

5. Deploy:
   - Call `deploy_env_vars` MCP tool with:
     - platform: detected or user-specified
     - envVars: array of {name, itemId} for each key
     - environment: "production" unless specified
     - project: from config file or current directory name

6. Report results:
   - Show which keys were deployed
   - Show any failures and why
   - Suggest next steps if keys are missing

## Example Flow

```
User: /deploy-env

Claude: [Reads .env.example, finds OPENAI_API_KEY, DATABASE_URL, STRIPE_SECRET_KEY]
Claude: [Detects vercel.json → Vercel project]
Claude: [Calls list_api_keys, finds matches]
Claude: [Calls deploy_env_vars]
Claude: "Deployed 3 env vars to Vercel production:
         - OPENAI_API_KEY
         - DATABASE_URL
         - STRIPE_SECRET_KEY"
```

## Arguments

- `$ARGUMENTS` - Optional: platform name or "all" for multiple platforms
  - `/deploy-env vercel` - Deploy to Vercel specifically
  - `/deploy-env github owner/repo` - Deploy to GitHub Actions
  - `/deploy-env all` - Deploy to all detected platforms
