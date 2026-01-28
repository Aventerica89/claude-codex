# Environment Variable Automation

## Automatic Detection Triggers

PROACTIVELY offer to deploy env vars when you detect:

1. **New project setup** - User runs `/new-project` or creates a new app
2. **Deployment preparation** - User mentions deploying, pushing to production, or setting up hosting
3. **Missing env vars** - Build fails due to missing environment variables
4. **`.env.example` creation** - User creates or modifies `.env.example`
5. **Platform config files** - User creates `vercel.json`, `netlify.toml`, `wrangler.toml`, etc.

## Automatic Actions

When any trigger is detected:

1. **Scan for required env vars:**
   ```
   - .env.example
   - .env.local.example
   - README mentions of required keys
   - Import statements (e.g., process.env.OPENAI_API_KEY)
   ```

2. **Check 1Password for matches:**
   - Call `list_api_keys` MCP tool
   - Match by name or provider

3. **Offer to deploy:**
   ```
   "I found 3 env vars needed for this project and matching keys in 1Password:
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - DATABASE_URL

   Deploy to Vercel production? [Y/n]"
   ```

4. **If user confirms (or doesn't object), deploy automatically**

## Silent Mode

For these scenarios, deploy WITHOUT asking:

- User explicitly says "set up", "deploy", or "configure" env vars
- User runs `/deploy-env` command
- User says "yes" or "do it" after being offered

## Missing Keys

If required env vars don't exist in 1Password:

1. List which are missing
2. Offer to store them: "Paste your OpenAI API key and I'll save it to 1Password and deploy it"

## Platform Detection Priority

1. Explicit user request ("deploy to Vercel")
2. Config file present (`vercel.json` → Vercel)
3. Git remote URL (vercel.com, netlify.app in origin)
4. Ask user if unclear

## MCP Tools to Use

| Tool | When |
|------|------|
| `list_platforms` | Check which CLIs are available |
| `list_api_keys` | Find matching keys in 1Password |
| `get_api_key` | Retrieve specific key value |
| `store_api_key` | Save new key user provides |
| `deploy_env_vars` | Push keys to platform |
