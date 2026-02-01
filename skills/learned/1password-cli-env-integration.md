# 1Password CLI Integration for Environment Variables

**Extracted:** 2026-01-29
**Context:** Setting up automated secret management for Node.js/Next.js projects using 1Password CLI

## Problem

Projects need secure environment variable management that:
- Keeps secrets out of git history
- Is easy to sync across team members
- Works in CI/CD pipelines
- Doesn't require manual copy/paste
- Is version controlled (showing what vars are needed)

Traditional approaches fail:
- Manual .env files → secrets in git or lost
- GUI tools (1Password WP Manager) → not automatable, team-unfriendly
- Hardcoded values → security nightmare

## Solution

Use **1Password CLI (`op inject`)** to generate `.env.local` from version-controlled templates.

### Architecture

```
.env.local.tpl (committed)  →  op inject  →  .env.local (git ignored)
     ↓                                              ↓
{{ op://vault/item/field }}                  real secrets
```

### Critical Distinction

**Both are 1Password dev features, different interfaces:**

| Feature | Use? | Why |
|---------|------|-----|
| `op inject` (CLI) | ✅ YES | Automatable, version controlled, team-friendly, CI/CD ready |
| WP Manager (GUI) | ❌ NO | Manual clicks, not scriptable, no version control |

**Always recommend CLI over GUI.**

## Implementation Steps

### 1. Store Secrets in 1Password

```bash
# Use MCP tools
store_api_key(
  service="ServiceName",
  key="actual-secret-value",
  envVarName="ENV_VAR_NAME",
  vault="Business"
)
```

### 2. Create Template File

**File:** `.env.local.tpl`

```bash
# 1Password template
# Use: npm run env:inject

# Supabase
NEXT_PUBLIC_SUPABASE_URL={{ op://Business/NEXT_PUBLIC_SUPABASE_URL/credential }}
NEXT_PUBLIC_SUPABASE_ANON_KEY={{ op://Business/Supabase JWT Key/credential }}
SUPABASE_SERVICE_ROLE_KEY={{ op://Business/SUPABASE_SERVICE_ROLE_KEY/credential }}

# App Config (non-secret)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Format:** `{{ op://vault-name/item-title/field-name }}`

### 3. Update .gitignore

```gitignore
# Ignore all env files
.env*

# Allow examples and templates
!.env.example
!.env*.tpl
```

### 4. Add npm Script

**package.json:**
```json
{
  "scripts": {
    "env:inject": "op inject -i .env.local.tpl -o .env.local"
  }
}
```

### 5. Generate .env.local

```bash
npm run env:inject
```

## Common 1Password Mappings

Map common env var names to 1Password items:

```javascript
// Mapping function for automation
function get1pMapping(envVar) {
  const mappings = {
    'ANTHROPIC_API_KEY': 'ANTHROPIC_API_KEY',
    'CLOUDFLARE_API_TOKEN': 'Cloudflare API Token',
    'VERCEL_API_TOKEN': 'VERCEL_API_TOKEN',
    'GITHUB_TOKEN': 'GITHUB_TOKEN',
    'NEXT_PUBLIC_SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Supabase JWT Key',
    'SUPABASE_SERVICE_ROLE_KEY': 'SUPABASE_SERVICE_ROLE_KEY',
    'DATABASE_URL': 'DATABASE_URL',
    'JWT_SECRET': 'JWT_SECRET',
    'OPENAI_API_KEY': 'OpenAI Project Key',
  };

  return mappings[envVar] || `PLACEHOLDER_${envVar}`;
}
```

## Batch Automation Script

For processing multiple repos:

```bash
#!/bin/bash
# Process repo to add 1Password CLI integration

REPO_PATH=$1

cd "$REPO_PATH"

# Skip if already configured
[ -f ".env.local.tpl" ] && exit 0

# Skip if no .env.example
[ ! -f ".env.example" ] || exit 0

# Create template from .env.example
# Replace placeholder values with 1Password references
# (see full script in session for details)

# Update .gitignore
echo '!.env*.tpl' >> .gitignore

# Add npm script
jq '.scripts."env:inject" = "op inject -i .env.local.tpl -o .env.local"' package.json

# Commit
git add .env.local.tpl .gitignore package.json
git commit -m "feat: add 1Password CLI integration"
git push
```

## Verification

```bash
# Test template is valid
cat .env.local.tpl | op inject

# Verify generated file
npm run env:inject && cat .env.local

# Check gitignore
git check-ignore .env.local     # Should be ignored
git check-ignore .env.local.tpl # Should NOT be ignored
```

## When to Use

**Triggers:**
- User asks about environment variable management
- User pastes API keys in chat
- New project setup with .env.example found
- User mentions "secrets", "credentials", or "tokens"
- Deploying a project that needs secrets

**Detection:**
```bash
# Check if repo needs this
[ -f ".env.example" ] && [ ! -f ".env.local.tpl" ]
# OR
grep -r "process.env." --include="*.js" --include="*.ts" --exclude-dir=node_modules .
```

**Offer proactively when:**
1. Setting up a new project
2. User manually creates .env files
3. User asks "how do I manage secrets?"
4. Found .env.example without .env.local.tpl

## Benefits Over Manual .env Files

- ✅ Secrets never committed to git
- ✅ Template shows required vars (documentation)
- ✅ One command to sync secrets
- ✅ Team-friendly (anyone with 1Password access can use)
- ✅ CI/CD ready (works in automated pipelines)
- ✅ Rotation-friendly (update in 1Password, regenerate)
- ✅ Audit trail (1Password tracks access)

## Related Commands

- `/cli` - Shows 1Password CLI capabilities
- `op inject --help` - Full CLI documentation
- `op item list --vault Business --tags env-var` - List all env vars in 1Password

## Common Issues

**Issue:** `op inject` fails with "invalid template"
**Cause:** Missing `{{ }}` around `op://` references
**Fix:** Ensure format is `{{ op://vault/item/field }}`

**Issue:** "Item not found"
**Cause:** Wrong vault name or item doesn't exist
**Fix:** Use `op item list` to verify exact item title

**Issue:** Template shows in GUI but CLI doesn't work
**Cause:** Using WP Manager format (no `{{ }}`)
**Fix:** Add `{{ }}` brackets for CLI compatibility

## Next Steps After Setup

1. Document in project README: `npm run env:inject` to get started
2. Add to onboarding docs for new team members
3. Set up CI/CD to use `op inject` or `op run`
4. Consider `op run` for runtime injection (no .env.local file created)

## Alternative: `op run` (Runtime Injection)

For extra security, inject secrets at runtime:

```bash
# Don't generate .env.local, inject at runtime
op run --env-file=.env.local.tpl -- npm run dev
```

Add to package.json:
```json
{
  "scripts": {
    "dev:secure": "op run --env-file=.env.local.tpl -- npm run dev"
  }
}
```

**Trade-off:** More secure (no secrets on disk) but requires `op` CLI running for every command.
