---
description: Audit project dependencies for security vulnerabilities, outdated packages, and unused dependencies.
---

# Dependencies Audit

Comprehensive dependency analysis covering security, updates, and cleanup.

## Usage

```
/deps-audit              # Full audit
/deps-audit --security   # Security only
/deps-audit --outdated   # Outdated packages only
/deps-audit --unused     # Unused dependencies only
/deps-audit --fix        # Auto-fix safe issues
```

## Arguments

Parse `$ARGUMENTS` for:
- `--security` or `-s` - Security vulnerabilities only
- `--outdated` or `-o` - Outdated packages only
- `--unused` or `-u` - Unused dependencies only
- `--fix` or `-f` - Auto-fix where safe
- `--json` - Output as JSON

---

## Audit Categories

### 1. Security Vulnerabilities

```bash
# npm audit
npm audit --json

# Or with pnpm
pnpm audit --json
```

**Severity Levels**:
- 🔴 **Critical** - Must fix immediately
- 🟠 **High** - Fix before deploy
- 🟡 **Moderate** - Fix soon
- ⚪ **Low** - Fix when convenient

### 2. Outdated Packages

```bash
npm outdated --json
```

**Categories**:
- **Major** - Breaking changes likely (1.x → 2.x)
- **Minor** - New features, safe to update (1.1 → 1.2)
- **Patch** - Bug fixes, safe to update (1.1.1 → 1.1.2)

### 3. Unused Dependencies

Use `depcheck` or `knip`:

```bash
npx depcheck
# or
npx knip
```

**Finds**:
- Dependencies in package.json but not imported
- devDependencies that could be dependencies (or vice versa)
- Missing dependencies (imported but not in package.json)

### 4. Duplicate Dependencies

```bash
npm ls --all | grep -E "^[├└]"
```

**Finds**:
- Same package at multiple versions
- Bloated node_modules

### 5. License Compliance

```bash
npx license-checker --summary
```

**Flags**:
- GPL licenses in commercial projects
- Unknown licenses
- Conflicting licenses

---

## Output Format

```markdown
## Dependency Audit Report

**Project**: {project-name}
**Package Manager**: npm/pnpm/yarn
**Total Dependencies**: {count}
**Time**: {timestamp}

### Summary

| Category | Status | Count |
|----------|--------|-------|
| Security | ⚠️ | 3 vulnerabilities |
| Outdated | 📦 | 12 packages |
| Unused | 🗑️ | 2 packages |
| Duplicates | 📋 | 1 package |

---

### 🔒 Security Vulnerabilities

#### Critical (0)
None

#### High (2)
| Package | Vulnerability | Fix |
|---------|---------------|-----|
| lodash@4.17.20 | Prototype Pollution | Upgrade to 4.17.21 |
| axios@0.21.0 | SSRF | Upgrade to 0.21.1+ |

#### Moderate (1)
| Package | Vulnerability | Fix |
|---------|---------------|-----|
| minimist@1.2.5 | Prototype Pollution | Upgrade to 1.2.6 |

**Auto-fix available**: `npm audit fix`

---

### 📦 Outdated Packages

#### Major Updates (Review Required)
| Package | Current | Latest | Change |
|---------|---------|--------|--------|
| next | 14.2.0 | 15.1.0 | Major version |
| react | 18.2.0 | 19.0.0 | Major version |

#### Minor/Patch (Safe to Update)
| Package | Current | Latest |
|---------|---------|--------|
| typescript | 5.3.0 | 5.4.2 |
| tailwindcss | 3.4.0 | 3.4.1 |
| eslint | 8.56.0 | 8.57.0 |

**Update safe packages**: `npm update`

---

### 🗑️ Unused Dependencies

| Package | Type | Recommendation |
|---------|------|----------------|
| moment | dependency | Remove (use date-fns instead) |
| lodash | dependency | Remove (only using one function) |

**Remove**: `npm uninstall moment lodash`

---

### 📋 Duplicate Packages

| Package | Versions | Size Impact |
|---------|----------|-------------|
| tslib | 1.14.1, 2.6.2 | +24KB |

---

### 📜 License Summary

| License | Count | Status |
|---------|-------|--------|
| MIT | 145 | ✅ OK |
| ISC | 23 | ✅ OK |
| Apache-2.0 | 12 | ✅ OK |
| BSD-3-Clause | 8 | ✅ OK |

No problematic licenses detected.

---

### Recommendations

1. **Immediate**: Fix 2 high severity vulnerabilities
2. **Soon**: Remove 2 unused dependencies (-45KB)
3. **Plan**: Review major version updates for Next.js 15

### Quick Fix Commands

```bash
# Fix security issues
npm audit fix

# Update safe packages
npm update

# Remove unused
npm uninstall moment lodash

# Full update (careful!)
npm update --save
```
```

---

## Auto-Fix Mode (`--fix`)

**Will fix**:
- Security vulnerabilities (via `npm audit fix`)
- Patch version updates
- Remove clearly unused dependencies

**Won't fix** (requires review):
- Major version updates
- Dependencies with peer dependency conflicts
- Packages that might be used dynamically

---

## Example

```
User: /deps-audit --security

Claude: Running security audit...

## Security Audit

**Project**: my-app
**Scanned**: 234 packages

### Vulnerabilities Found: 2

#### High Severity

1. **axios@0.21.0**
   - Issue: Server-Side Request Forgery
   - CVE: CVE-2021-3749
   - Fix: `npm install axios@0.21.1`

2. **lodash@4.17.20**
   - Issue: Prototype Pollution
   - CVE: CVE-2021-23337
   - Fix: `npm install lodash@4.17.21`

### Fix Command

```bash
npm audit fix
```

Or manually:
```bash
npm install axios@latest lodash@latest
```

Run `/deps-audit --fix` to auto-apply safe fixes.
```

---

## Notes

- Run weekly or before deployments
- Add to CI/CD pipeline
- Consider `npm audit --audit-level=high` for CI
- Use lockfile for reproducible audits
