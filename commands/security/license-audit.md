---
description: Check dependency licenses for compliance. Flags GPL/AGPL in commercial projects and identifies unknown licenses.
---

# License Audit

Scan dependencies for license compliance and legal risks.

## Usage

```bash
/security:license-audit              # Full license scan
/security:license-audit --strict     # Fail on any copyleft
/security:license-audit --commercial # Check for commercial use
```

## When to Run

| Trigger | Priority |
|---------|----------|
| Before release | Required |
| New dependencies added | Required |
| Quarterly audit | Recommended |
| Before open-sourcing | Required |

---

## License Categories

### ✅ Permissive (Safe for Commercial)

| License | Notes |
|---------|-------|
| MIT | Most permissive, attribution only |
| ISC | MIT-equivalent |
| BSD-2-Clause | Attribution only |
| BSD-3-Clause | Attribution + no endorsement |
| Apache-2.0 | Patent grant, attribution |
| Unlicense | Public domain |
| CC0 | Public domain |

### ⚠️ Weak Copyleft (Review Required)

| License | Notes |
|---------|-------|
| LGPL-2.1 | OK if dynamically linked |
| LGPL-3.0 | OK if dynamically linked |
| MPL-2.0 | File-level copyleft |
| EPL-1.0 | Weak copyleft |

### ❌ Strong Copyleft (Avoid in Commercial)

| License | Risk |
|---------|------|
| GPL-2.0 | Must open-source your code |
| GPL-3.0 | Must open-source + patent grant |
| AGPL-3.0 | Applies to network use too |

### ⚠️ Unknown/Custom

| Status | Action |
|--------|--------|
| No license | Contact author or avoid |
| Custom license | Legal review required |
| Multiple licenses | Check if OR (choose) or AND (all apply) |

---

## Scan Process

### Step 1: Run License Checker

```bash
# Install if needed
npm install -g license-checker

# Run scan
npx license-checker --json --out licenses.json

# Summary only
npx license-checker --summary
```

### Step 2: Categorize Results

Group by license type:
- Permissive (safe)
- Weak copyleft (review)
- Strong copyleft (flag)
- Unknown (investigate)

### Step 3: Flag Issues

Check for:
- GPL/AGPL dependencies in commercial project
- Missing license files
- Conflicting licenses
- Dependencies with "UNKNOWN" license

### Step 4: Generate Attribution

For permissive licenses requiring attribution:
- MIT: Requires copyright notice
- Apache-2.0: Requires NOTICE file if present
- BSD: Requires copyright notice

---

## Output Format

```markdown
## License Audit Report

**Project**: {project-name}
**Dependencies**: {count}
**Time**: {timestamp}

### Summary

| License | Count | Status |
|---------|-------|--------|
| MIT | 145 | ✅ Safe |
| ISC | 23 | ✅ Safe |
| Apache-2.0 | 18 | ✅ Safe |
| BSD-3-Clause | 12 | ✅ Safe |
| LGPL-3.0 | 2 | ⚠️ Review |
| GPL-3.0 | 1 | ❌ Copyleft |
| UNKNOWN | 3 | ⚠️ Investigate |

**Overall Status**: ⚠️ Issues Found

---

### ❌ Copyleft Licenses Found

#### 1. some-package@1.2.3
**License**: GPL-3.0
**Used By**: Your project directly

**Risk**: Using this package requires you to release your source code under GPL-3.0.

**Options**:
1. Remove this dependency
2. Find MIT-licensed alternative
3. Open-source your project under GPL-3.0
4. Contact author about dual licensing

**Alternatives**:
- `alternative-package` (MIT) - Similar functionality
- `other-package` (Apache-2.0) - More features

---

### ⚠️ Weak Copyleft

#### 1. another-package@2.0.0
**License**: LGPL-3.0
**Type**: Dynamic library

**Risk**: Low if using as a dependency (not modifying source)

**Requirements**:
- Allow users to replace the LGPL library
- Provide source for any modifications to the library

---

### ⚠️ Unknown Licenses

#### 1. mystery-package@0.5.0
**License**: UNKNOWN
**Repository**: https://github.com/user/mystery-package

**Action Required**:
1. Check repository for LICENSE file
2. Contact maintainer
3. Consider removing if no response

---

### Attribution Required

These packages require attribution in your LICENSE or NOTICE file:

| Package | License | Copyright |
|---------|---------|-----------|
| react | MIT | Facebook, Inc. |
| lodash | MIT | JS Foundation |
| express | MIT | TJ Holowaychuk |

---

### Recommendations

1. **Remove GPL dependency** `some-package` - use `alternative-package` instead
2. **Investigate unknown licenses** - contact maintainers
3. **Add THIRD-PARTY-LICENSES.md** - document all attributions
4. **Add license check to CI** - prevent future issues

---

### Generated Attribution File

```markdown
# Third-Party Licenses

This project uses the following third-party libraries:

## MIT License

### React
Copyright (c) Facebook, Inc. and its affiliates.
https://github.com/facebook/react

### Lodash
Copyright (c) JS Foundation and other contributors
https://github.com/lodash/lodash

[Full MIT License text...]

## Apache-2.0 License

### TypeScript
Copyright (c) Microsoft Corporation
https://github.com/microsoft/TypeScript

[Full Apache-2.0 License text...]
```
```

---

## CI Integration

```yaml
# GitHub Actions
- name: License Check
  run: |
    npx license-checker --failOn "GPL-3.0;AGPL-3.0"
```

```json
// package.json
{
  "scripts": {
    "license:check": "license-checker --failOn 'GPL-3.0;AGPL-3.0'",
    "license:summary": "license-checker --summary",
    "license:csv": "license-checker --csv --out licenses.csv"
  }
}
```

---

## Common Alternatives for GPL Packages

| GPL Package | MIT/Apache Alternative |
|-------------|------------------------|
| readline | readline-sync |
| gmp | bignumber.js |
| mysql (GPL) | mysql2 (MIT) |
| ghostscript | pdf-lib |

---

## Notes

- License compliance is a legal matter - consult legal for complex cases
- "UNKNOWN" licenses are risky - don't assume permissive
- Check transitive dependencies too (not just direct)
- Some packages offer dual licensing (GPL + commercial)
- Keep attribution file updated with releases
