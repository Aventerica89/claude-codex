---
description: Validate environment variable security. Ensures secrets aren't hardcoded and .env files are properly configured.
---

# Environment Check

Verify environment variable security and configuration.

## Usage

```bash
/security:env-check              # Full environment audit
/security:env-check --strict     # Fail on any issue
/security:env-check --production # Check production config
```

## When to Run

| Trigger | Priority |
|---------|----------|
| Added new env var | Required |
| Before deployment | Required |
| After cloning repo | Recommended |
| Config changes | Recommended |

---

## What Gets Checked

### 1. .env Files

- `.env` not committed to git
- `.env.example` documents all required vars
- No actual secrets in `.env.example`
- Proper file naming (`.env.local`, `.env.production`)

### 2. Hardcoded Secrets

- No API keys in code
- No passwords in config files
- No tokens in frontend code
- No secrets in comments

### 3. Environment Usage

- All env vars validated at startup
- Missing vars throw clear errors
- Proper typing with zod or similar
- No fallback to insecure defaults

### 4. Production Config

- Debug mode disabled
- Secure defaults enabled
- No development URLs
- Proper SSL configuration

---

## Scan Process

### Step 1: Check .gitignore

```bash
# Verify .env files are ignored
grep -E "^\.env" .gitignore

# Should include:
# .env
# .env.local
# .env.*.local
# .env.production
```

### Step 2: Scan for Hardcoded Secrets

```bash
# Check for common patterns
grep -rn --include="*.ts" --include="*.tsx" --include="*.js" \
  -E "(password|secret|api[_-]?key|token)\s*[:=]\s*['\"][^'\"]+['\"]" \
  src/ | grep -v ".env" | grep -v "process.env"
```

### Step 3: Compare .env.example

```bash
# Get required vars from code
grep -roh "process\.env\.[A-Z_]+" src/ | sort -u

# Compare with .env.example
cat .env.example | grep -E "^[A-Z_]+="
```

### Step 4: Validate env.ts/config.ts

Check for proper validation:

```typescript
// ✅ Good - validates at startup
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(20),
  NODE_ENV: z.enum(['development', 'production', 'test'])
})

export const env = envSchema.parse(process.env)
```

### Step 5: Check for Unsafe Defaults

```typescript
// ❌ Bad - insecure fallback
const apiKey = process.env.API_KEY || 'default-key'

// ✅ Good - fail if missing
const apiKey = process.env.API_KEY
if (!apiKey) throw new Error('API_KEY required')
```

---

## Output Format

```markdown
## Environment Security Report

**Project**: {project-name}
**Time**: {timestamp}

### Summary

| Category | Status | Issues |
|----------|--------|--------|
| .gitignore | ✅ Pass | 0 |
| Hardcoded Secrets | ❌ Fail | 2 |
| .env.example | ⚠️ Warn | 3 |
| Validation | ⚠️ Warn | 1 |
| Production Config | ✅ Pass | 0 |

---

### .gitignore Status

| Pattern | Status |
|---------|--------|
| `.env` | ✅ Ignored |
| `.env.local` | ✅ Ignored |
| `.env.production` | ❌ Missing |
| `.env.*.local` | ✅ Ignored |

**Fix**: Add to .gitignore:
```
.env.production
```

---

### Hardcoded Secrets Found

#### 1. API Key in Config
**File**: `src/lib/stripe.ts:5`
**Severity**: CRITICAL

```typescript
// Line 5
const stripe = new Stripe('sk_test_xxxxx')  // ❌ Hardcoded!
```

**Fix**:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

#### 2. Database Password
**File**: `src/lib/db.ts:12`
**Severity**: CRITICAL

```typescript
// Line 12
const connectionString = 'postgres://user:password123@localhost/db'
```

**Fix**:
```typescript
const connectionString = process.env.DATABASE_URL!
```

---

### Missing from .env.example

| Variable | Used In | Action |
|----------|---------|--------|
| `ANALYTICS_KEY` | src/lib/analytics.ts | Add to .env.example |
| `WEBHOOK_SECRET` | src/app/api/webhook/route.ts | Add to .env.example |
| `REDIS_URL` | src/lib/cache.ts | Add to .env.example |

**Add to .env.example**:
```bash
# Analytics
ANALYTICS_KEY=your-analytics-key

# Webhooks
WEBHOOK_SECRET=whsec_your-webhook-secret

# Cache
REDIS_URL=redis://localhost:6379
```

---

### Environment Validation

**Current Status**: ⚠️ No validation found

**Recommendation**: Create `src/lib/env.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // External Services
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  OPENAI_API_KEY: z.string().startsWith('sk-'),

  // Optional
  ANALYTICS_KEY: z.string().optional(),

  // Runtime
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
})

export const env = envSchema.parse(process.env)
```

Then import in `src/app/layout.tsx` or entry point.

---

### Production Checklist

| Check | Status |
|-------|--------|
| NODE_ENV=production | ✅ |
| Debug mode off | ✅ |
| HTTPS URLs | ⚠️ Check manually |
| No localhost references | ✅ |

---

### Recommendations

1. **Rotate exposed credentials** - sk_test_xxxxx was in code
2. **Add env validation** - Create src/lib/env.ts
3. **Update .env.example** - Add 3 missing variables
4. **Add .env.production to .gitignore**

### Secure .env.example Template

```bash
# =================================
# Environment Variables
# =================================
# Copy to .env.local and fill in values
# NEVER commit actual secrets!

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Authentication
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# External Services
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
OPENAI_API_KEY=sk-your-key

# Optional
ANALYTICS_KEY=
SENTRY_DSN=
```
```

---

## Validation Patterns

### Zod Schema

```typescript
import { z } from 'zod'

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(20),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  DEBUG: z.string().transform(s => s === 'true').default('false'),
  ALLOWED_ORIGINS: z.string().transform(s => s.split(',')).default('')
})
```

### T3 Env

```typescript
// env.mjs (T3 Stack pattern)
import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_')
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url()
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
  }
})
```

---

## Notes

- Never commit .env files with real secrets
- Rotate any credential found in git history
- Use secret management for production (Vercel, AWS Secrets Manager)
- Validate environment at startup, not at usage time
- Different .env files for different environments
