---
description: Pre-deployment verification checklist. Run before deploying to catch common issues.
---

# Deploy Check

Comprehensive pre-deployment verification to catch issues before they hit production.

## Usage

```
/deploy-check              # Full checklist
/deploy-check --quick      # Essential checks only
/deploy-check --fix        # Auto-fix what's possible
```

## Arguments

Parse `$ARGUMENTS` for:
- `--quick` or `-q` - Run only critical checks
- `--fix` or `-f` - Attempt to auto-fix issues
- `--env <name>` - Check for specific environment (staging, production)

---

## Checklist Categories

### 1. Build Verification

```bash
# Clean build
npm run build

# Type checking
npx tsc --noEmit

# Lint
npm run lint
```

**Check for**:
- Build errors
- TypeScript errors
- Lint warnings/errors
- Bundle size changes

### 2. Test Suite

```bash
# Run all tests
npm test

# Coverage check
npm test -- --coverage
```

**Check for**:
- Failing tests
- Coverage below threshold (80%)
- Skipped tests that shouldn't be

### 3. Environment Variables

**Check for**:
- All required env vars documented in `.env.example`
- No secrets in code (API keys, passwords)
- Environment-specific vars set correctly
- All env vars stored in 1Password (run `/secrets-audit` to verify)

```bash
# Check for hardcoded secrets
grep -r "sk-" src/ --include="*.ts" --include="*.tsx"
grep -r "password.*=" src/ --include="*.ts" --include="*.tsx"
```

**Recommended**: Run `/secrets-audit` for comprehensive secrets check with 1Password cross-reference.

### 4. Dependencies

```bash
# Security audit
npm audit

# Outdated packages
npm outdated
```

**Check for**:
- High/critical vulnerabilities
- Significantly outdated packages
- Unused dependencies

### 5. Database

**Check for**:
- Pending migrations
- Schema changes that need migration
- Seed data for new tables

```bash
# Check migration status (Drizzle)
npm run db:push -- --dry-run

# Check migration status (Prisma)
npx prisma migrate status
```

### 6. API Contracts

**Check for**:
- Breaking API changes
- New endpoints documented
- Deprecated endpoints marked

### 7. Security

**Check for**:
- Authentication on protected routes
- CORS configuration
- Rate limiting configured
- Input validation on all endpoints
- No console.log with sensitive data

### 8. Performance

**Check for**:
- No N+1 queries
- Images optimized
- Lazy loading for heavy components
- Bundle size reasonable

### 9. Git Status

```bash
git status
git log origin/main..HEAD --oneline
```

**Check for**:
- All changes committed
- Branch is up to date with main
- No merge conflicts pending

---

## Output Format

```markdown
## Deploy Check Results

**Project**: {project-name}
**Branch**: {branch}
**Environment**: {production/staging}
**Time**: {timestamp}

### Summary
| Category | Status | Issues |
|----------|--------|--------|
| Build | ✅ Pass | 0 |
| Tests | ✅ Pass | 0 |
| Env Vars | ⚠️ Warning | 1 |
| Dependencies | ❌ Fail | 2 |
| Database | ✅ Pass | 0 |
| Security | ✅ Pass | 0 |
| Git | ✅ Pass | 0 |

### Issues Found

#### ❌ Critical (Must Fix)
1. **npm audit**: 2 high severity vulnerabilities
   - `lodash` < 4.17.21 - Prototype pollution
   - Fix: `npm audit fix`

#### ⚠️ Warnings (Should Fix)
1. **Environment**: `ANALYTICS_KEY` in code but not in `.env.example`
   - Add to `.env.example` for documentation

### Passed Checks
- Build successful (12.3s)
- All 63 tests passing
- TypeScript: No errors
- Coverage: 94% (above 80% threshold)
- No pending migrations
- No hardcoded secrets detected
- All changes committed

### Recommendation
**DO NOT DEPLOY** - Fix critical issues first

Run `/deploy-check --fix` to auto-fix where possible.
```

---

## Quick Mode (`--quick`)

Only runs essential checks:
1. Build succeeds
2. Tests pass
3. No critical vulnerabilities
4. Git status clean

---

## Auto-Fix Mode (`--fix`)

Attempts to fix:
- `npm audit fix` for vulnerabilities
- `npm run lint -- --fix` for lint issues
- Format code with Prettier
- Add missing env vars to `.env.example`

Won't auto-fix:
- Failing tests
- Build errors
- Security issues in code
- Database migrations

---

## Example

```
User: /deploy-check

Claude: Running deploy checks for my-app...

## Deploy Check Results

**Project**: my-app
**Branch**: main
**Time**: 2025-01-27 19:00

### Summary
| Category | Status | Issues |
|----------|--------|--------|
| Build | ✅ Pass | 0 |
| Tests | ✅ Pass | 0 |
| Env Vars | ✅ Pass | 0 |
| Dependencies | ✅ Pass | 0 |
| Database | ✅ Pass | 0 |
| Security | ✅ Pass | 0 |
| Git | ✅ Pass | 0 |

### All Checks Passed!

- Build: 8.2s
- Tests: 63/63 passing (94% coverage)
- No vulnerabilities
- No pending migrations

### Recommendation
**READY TO DEPLOY** ✅

Deploy with:
- Vercel: `vercel --prod`
- Manual: `npm run build && npm start`
```

---

## Notes

- Run before every production deployment
- CI/CD should include these checks
- Keep threshold configs in project (coverage, bundle size)
- Consider adding project-specific checks

## Related Commands

- `/secrets-audit` - Comprehensive secrets scan with 1Password cross-reference
- `/env-example` - Generate/update `.env.example` from 1Password
- `/security` - Full security audit suite
