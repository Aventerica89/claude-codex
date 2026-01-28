---
description: Comprehensive security audit suite. Run all security checks or specific audits. Use before deployments, after adding auth/API code, or on schedule.
---

# Security Audit Suite

Orchestrates all security checks for comprehensive project security analysis.

## Usage

```bash
/security                    # Full security audit (all checks)
/security --quick            # Critical checks only
/security secrets            # Secrets detection only
/security secrets-1p         # Secrets audit with 1Password cross-check
/security headers            # HTTP headers check only
/security licenses           # License compliance only
/security api                # API security audit only
/security env                # Environment variables check only
/security deps               # Dependency vulnerabilities only
```

## Arguments

Parse `$ARGUMENTS` for mode:
- (none) - Run full audit
- `--quick` or `-q` - Critical checks only (secrets + deps)
- `secrets` - Run `/security:secrets-scan`
- `secrets-1p` - Run `/secrets-audit` (includes 1Password cross-check)
- `headers` - Run `/security:headers`
- `licenses` - Run `/security:license-audit`
- `api` - Run `/security:api-security`
- `env` - Run `/security:env-check`
- `deps` - Run `/deps-audit --security`

---

## When to Run Security Audits

### Run IMMEDIATELY (Before Every Commit)

| Check | Trigger |
|-------|---------|
| `/security secrets` | Any code change |
| `/security env` | Added/changed env vars |

### Run Before EVERY Deployment

| Check | Why |
|-------|-----|
| `/security --quick` | Catch critical issues |
| `/deploy-check` | Full pre-deploy verification |

### Run WEEKLY (Scheduled)

| Check | Why |
|-------|-----|
| `/security` (full) | Comprehensive audit |
| `/deps-audit` | New CVEs discovered daily |
| `/security licenses` | License changes in updates |

### Run When CODE CHANGES

| Code Changed | Run These |
|--------------|-----------|
| Auth/login code | `/security api`, `/security secrets` |
| API endpoints | `/security api`, `/security headers` |
| User input handling | `/security api` |
| Environment config | `/security env` |
| Dependencies added | `/deps-audit`, `/security licenses` |
| Payment/financial | Full `/security` |

### Run After INCIDENTS

| Incident | Run These |
|----------|-----------|
| Security breach | Full `/security` + git history scan |
| Dependency CVE | `/deps-audit --security` |
| Secret exposed | `/security secrets` + rotate credentials |
| User report | Targeted audit based on report |

---

## Full Audit Workflow

When running full `/security`:

### Phase 1: Secrets Detection (Critical)
```
Running secrets scan...
- Scanning current files for API keys, tokens, passwords
- Checking git history for leaked secrets
- Validating .gitignore covers sensitive files
```

### Phase 2: Dependency Security (Critical)
```
Running dependency audit...
- npm audit for known vulnerabilities
- Checking for outdated packages with CVEs
- Flagging critical/high severity issues
```

### Phase 3: Environment Check (High)
```
Running environment check...
- Verifying .env.example is complete
- Checking no secrets in code
- Validating production config
```

### Phase 4: API Security (High)
```
Running API security audit...
- Checking auth on all endpoints
- Validating input sanitization
- Verifying rate limiting
- Testing CORS configuration
```

### Phase 5: Security Headers (Medium)
```
Running headers check...
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
```

### Phase 6: License Compliance (Low)
```
Running license audit...
- Scanning all dependencies
- Flagging GPL/AGPL in commercial code
- Checking for unknown licenses
```

---

## Output Format

```markdown
# Security Audit Report

**Project**: {project-name}
**Date**: {timestamp}
**Auditor**: Claude Code Security Suite

## Summary

| Category | Status | Critical | High | Medium | Low |
|----------|--------|----------|------|--------|-----|
| Secrets | ✅ Pass | 0 | 0 | 0 | 0 |
| Dependencies | ⚠️ Warn | 0 | 2 | 3 | 1 |
| Environment | ✅ Pass | 0 | 0 | 0 | 0 |
| API Security | ❌ Fail | 1 | 0 | 2 | 0 |
| Headers | ⚠️ Warn | 0 | 1 | 1 | 0 |
| Licenses | ✅ Pass | 0 | 0 | 0 | 0 |

**Overall Risk**: 🔴 HIGH (1 critical issue)

---

## Critical Issues (Fix Immediately)

### 1. Missing Authentication on /api/admin/*
**Category**: API Security
**Severity**: CRITICAL
**Location**: `src/app/api/admin/route.ts`

**Issue**: Admin endpoints accessible without authentication

**Fix**:
```typescript
import { requireAdmin } from '@/lib/auth'

export async function GET(req: Request) {
  await requireAdmin(req) // Add this
  // ...
}
```

---

## High Issues (Fix Before Deploy)

[Details...]

---

## Recommendations

1. Add pre-commit hook for secrets scanning
2. Enable Dependabot for automatic CVE alerts
3. Implement CSP headers
4. Add rate limiting middleware

---

## Next Steps

- [ ] Fix 1 critical issue
- [ ] Address 3 high issues
- [ ] Run `/security` again after fixes
- [ ] Schedule weekly security audits
```

---

## Quick Mode (`--quick`)

Only runs critical checks:
1. Secrets detection
2. Dependency vulnerabilities (high/critical only)
3. Environment variables

Use for: Pre-commit, quick validation

---

## CI/CD Integration

Add to your pipeline:

```yaml
# GitHub Actions
- name: Security Audit
  run: |
    npm audit --audit-level=high
    npx gitleaks detect --source . --verbose

# Pre-commit hook
#!/bin/sh
claude "/security --quick"
```

---

## Scheduling Recommendations

### Daily (Automated)
```bash
# Add to cron or CI
0 9 * * * cd /project && npm audit
```

### Weekly (Manual Review)
```
Every Monday:
1. Run /security (full audit)
2. Review and prioritize findings
3. Create issues for non-critical items
4. Fix critical/high immediately
```

### Before Release
```
Release checklist:
1. /security (full audit)
2. /deploy-check
3. Manual penetration testing for major releases
4. Third-party audit for v1.0 or financial features
```

---

## Sub-Commands Reference

| Command | Purpose | Frequency |
|---------|---------|-----------|
| `/security:secrets-scan` | Find leaked secrets | Every commit |
| `/secrets-audit` | Secrets + 1Password cross-check | Before deploy |
| `/security:headers` | Check HTTP headers | Before deploy |
| `/security:license-audit` | License compliance | Weekly |
| `/security:api-security` | API endpoint audit | After API changes |
| `/security:env-check` | Environment security | After config changes |

Run individual commands with:
```bash
/security secrets
/security secrets-1p    # Includes 1Password integration
/security headers
/security licenses
/security api
/security env
```

---

## Notes

- Security is not optional, especially for production apps
- Critical issues block deployment
- High issues should block deployment for financial apps
- Schedule regular audits, don't wait for incidents
- Rotate credentials immediately if secrets are exposed
