---
description: Deep secrets detection in code and git history. Finds API keys, tokens, passwords, and other sensitive data.
---

# Secrets Scan

Comprehensive secrets detection to prevent credential leaks.

## Usage

```bash
/security:secrets-scan              # Full scan
/security:secrets-scan --history    # Include git history
/security:secrets-scan --fix        # Remove secrets and rotate
```

## When to Run

| Trigger | Priority |
|---------|----------|
| Before every commit | Required |
| Before deployment | Required |
| After cloning repo | Recommended |
| Weekly scheduled | Recommended |

---

## What Gets Scanned

### 1. Current Files

Patterns detected:
- API keys (OpenAI, Stripe, AWS, etc.)
- OAuth tokens and secrets
- Database connection strings
- Private keys (RSA, SSH, PGP)
- Passwords and passphrases
- JWT secrets
- Webhook secrets

### 2. Git History (with `--history`)

- All commits for leaked secrets
- Deleted files that contained secrets
- Force-pushed or amended commits

### 3. Configuration Files

- `.env` files (should be in .gitignore)
- `config.json`, `settings.json`
- CI/CD configuration
- Docker files

---

## Scan Process

### Step 1: File Pattern Scan

```bash
# Common secret patterns
grep -rn --include="*.{js,ts,tsx,json,yaml,yml,env,md}" \
  -E "(api[_-]?key|apikey|secret|password|token|auth|credential|private[_-]?key)" \
  . 2>/dev/null | grep -v node_modules | grep -v ".git"
```

### Step 2: High-Entropy String Detection

Look for strings with high randomness (likely keys):
- 32+ character alphanumeric strings
- Base64 encoded blobs
- Hex strings (64+ chars)

### Step 3: Known Provider Patterns

```bash
# AWS
grep -rn "AKIA[0-9A-Z]{16}" .

# GitHub
grep -rn "ghp_[a-zA-Z0-9]{36}" .

# OpenAI
grep -rn "sk-[a-zA-Z0-9]{48}" .

# Stripe
grep -rn "sk_live_[a-zA-Z0-9]{24}" .

# Supabase
grep -rn "eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*" .
```

### Step 4: Git History Scan (if `--history`)

```bash
# Using gitleaks (if installed)
gitleaks detect --source . --verbose

# Or trufflehog
trufflehog filesystem . --json

# Manual git log scan
git log -p | grep -i "password\|api_key\|secret\|token" | head -50
```

### Step 5: Validate .gitignore

Ensure these are ignored:
- `.env`
- `.env.local`
- `.env.*.local`
- `*.pem`
- `*.key`
- `secrets/`
- `credentials.json`

---

## Output Format

```markdown
## Secrets Scan Report

**Project**: {project-name}
**Scanned**: {file-count} files
**Git History**: {included/excluded}
**Time**: {timestamp}

### Summary

| Category | Found | Status |
|----------|-------|--------|
| API Keys | 0 | ✅ Clean |
| Tokens | 1 | ❌ Found |
| Passwords | 0 | ✅ Clean |
| Private Keys | 0 | ✅ Clean |
| High Entropy | 2 | ⚠️ Review |

### Secrets Found (CRITICAL)

#### 1. Stripe API Key
**File**: `src/lib/payments.ts:23`
**Type**: Stripe Secret Key
**Pattern**: `sk_live_...`

```typescript
// Line 23
const stripe = new Stripe("sk_live_xxxxxxxxxxxxx") // EXPOSED!
```

**Remediation**:
1. Rotate this key immediately in Stripe Dashboard
2. Replace with environment variable:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```
3. Add to `.env.local` (not committed)
4. Add to `.env.example` as placeholder

---

### Potential Secrets (Review Required)

#### 1. High Entropy String
**File**: `src/config/settings.ts:45`
**Value**: `a3f8b2c1d4e5f6...` (truncated)
**Reason**: 64-character hex string

**Action**: Verify if this is:
- [ ] A secret (move to env var)
- [ ] A hash/checksum (safe to keep)
- [ ] Test data (safe if not production)

---

### .gitignore Status

| Pattern | Status |
|---------|--------|
| `.env` | ✅ Ignored |
| `.env.local` | ✅ Ignored |
| `*.pem` | ❌ Missing |
| `*.key` | ❌ Missing |

**Add to .gitignore**:
```
*.pem
*.key
```

---

### Git History

| Commit | File | Secret Type | Status |
|--------|------|-------------|--------|
| abc123 | old-config.js | AWS Key | ⚠️ In history |

**Warning**: Secrets in git history remain accessible even after deletion.

**Full cleanup requires**:
```bash
# Remove from history (destructive!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all
git push --force
```

Or use BFG Repo Cleaner:
```bash
bfg --delete-files file-with-secrets
```
```

---

## Auto-Fix Mode (`--fix`)

When `--fix` is specified:

1. **Replace hardcoded secrets with env vars**
   - Detect the secret type
   - Create appropriate env var name
   - Update code to use `process.env.VAR_NAME`

2. **Update .env.example**
   - Add placeholder for new env var
   - Add comment explaining the variable

3. **Update .gitignore**
   - Add missing patterns

4. **Prompt for rotation**
   - List all exposed secrets
   - Provide links to rotate each one

---

## Tools Used

| Tool | Purpose | Install |
|------|---------|---------|
| grep | Pattern matching | Built-in |
| gitleaks | Git history scan | `brew install gitleaks` |
| trufflehog | Deep scan | `pip install trufflehog` |

---

## Pre-Commit Hook

Add to `.husky/pre-commit`:

```bash
#!/bin/sh
# Quick secrets check before commit
if grep -rn --include="*.{js,ts,tsx}" \
  -E "(sk_live|sk-proj|AKIA|ghp_)" . 2>/dev/null | grep -v node_modules; then
  echo "ERROR: Potential secrets detected. Run /security:secrets-scan"
  exit 1
fi
```

---

## Notes

- Run before EVERY commit
- Secrets in git history are permanent unless force-pushed
- Always rotate exposed credentials, don't just delete
- Use environment variables, never hardcode
- Add secrets scanning to CI/CD pipeline
