# /secrets-audit - Security Secrets Audit

Comprehensive security scan for hardcoded secrets, exposed .env files, and missing 1Password entries.

## Workflow

### Step 1: Scan for Hardcoded Secrets

Search the codebase for hardcoded API keys and secrets using these patterns:

**Provider-specific patterns:**
- `sk-proj-` or `sk-` followed by alphanumeric (OpenAI)
- `ghp_` or `gho_` or `ghs_` (GitHub tokens)
- `sk_live_` or `sk_test_` or `pk_live_` or `pk_test_` (Stripe)
- `xoxb-` or `xoxp-` or `xoxa-` (Slack)
- `AKIA` followed by 16 alphanumeric (AWS)
- `SG.` followed by alphanumeric (SendGrid)
- `key-` followed by 32+ alphanumeric (generic API keys)

**Generic patterns (case-insensitive):**
- Variables containing `api_key`, `apikey`, `secret`, `token`, `password`, `credential` with string values
- Base64-encoded strings that look like keys

**Exclusions:**
- `.env*` files (checked separately)
- `node_modules/`, `.git/`, `dist/`, `build/`
- Test files with obvious mock values
- Comments explaining key formats

Use Grep to find matches, then report with `file:line` references.

### Step 2: Check .env File Security

1. Find all `.env*` files in the project:
   ```
   .env, .env.local, .env.development, .env.production, .env.*.local
   ```

2. Check if `.gitignore` exists and contains appropriate patterns:
   - `.env`
   - `.env.local`
   - `.env*.local`
   - `.env.production`

3. Flag any `.env*` files that:
   - Are NOT in `.gitignore`
   - Would be committed to git (check `git status` if in a git repo)

### Step 3: Cross-Reference with 1Password

1. Extract all environment variable references from code:
   - `process.env.VARIABLE_NAME`
   - `import.meta.env.VARIABLE_NAME`
   - `Deno.env.get("VARIABLE_NAME")`
   - `os.environ["VARIABLE_NAME"]` (Python)
   - `ENV["VARIABLE_NAME"]` (Ruby)

2. Call `list_api_keys` MCP tool to get all stored keys

3. Compare the lists:
   - Which env vars in code are NOT in 1Password?
   - Which 1Password keys are not used in code? (informational)

### Step 4: Generate Report

Format the output as:

```markdown
## Secrets Audit Report

### CRITICAL: Hardcoded Secrets Found
List any hardcoded secrets with file:line references.
If none found: "No hardcoded secrets detected."

### WARNING: .env Files Not in .gitignore
List any .env files that could be committed.
If none found: "All .env files are properly gitignored."

### INFO: Environment Variables Missing from 1Password
List env vars used in code but not stored in 1Password.
If none found: "All environment variables are stored in 1Password."

### Summary
- Critical: X
- Warning: X
- Info: X
```

## Arguments

- `/secrets-audit` - Run full audit
- `/secrets-audit --fix` - After audit, offer to store missing keys in 1Password
- `/secrets-audit --quick` - Only check for hardcoded secrets (skip 1Password check)

## MCP Tools

Use these env-var-assistant MCP tools:
- `list_api_keys` - Get all stored keys from 1Password
- `search_items` - Search for specific keys
- `store_api_key` - Store new keys (with --fix flag)

## Important

- NEVER output actual secret values in the report
- Show only first 8 characters of detected secrets: `sk-proj-abc...`
- For .env files, report the file exists but don't show contents
- Always recommend running this before commits and deployments
