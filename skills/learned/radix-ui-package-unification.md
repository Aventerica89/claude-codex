# Learned: Radix UI Package Unification & Code Review False Positives

**Extracted:** 2026-02-05
**Session:** jb-cloud-app-tracker - Settings page tabs
**Status:** Common in shadcn/ui projects post-2024

## Background

Radix UI changed its package structure. Instead of individual scoped packages (`@radix-ui/primitive`, `@radix-ui/dialog`, etc.), they now provide a unified `radix-ui` package.

## Before (Old Pattern)

```json
{
  "dependencies": {
    "@radix-ui/primitive": "1.0.x",
    "@radix-ui/dialog": "1.1.x",
    "@radix-ui/dropdown-menu": "2.0.x"
  }
}
```

## After (Current Pattern)

```json
{
  "dependencies": {
    "radix-ui": "1.0.x"
  }
}
```

## How shadcn/ui Handles This

When you run `npx shadcn@latest add <component>`, the installation process:

1. Checks if `radix-ui` is already installed
2. If not, adds it as a dependency
3. Installs the component file(s) into `src/components/ui/`
4. Component imports from `radix-ui` internally

Example from installed component:

```tsx
// src/components/ui/tabs.tsx
import * as TabsPrimitive from "radix-ui"
// or specifically:
import { Root, List, Trigger, Content } from "radix-ui/dist/tabs"
```

## Code Review Tool False Positives

### Problem

Code review tools (Gemini, some linters, static analyzers) may flag:
```
ERROR: Package "radix-ui" does not exist
```

**Why:** These tools have outdated package knowledge databases. They were trained or configured for the old `@radix-ui/*` pattern.

### Example False Positive

From a real session (Gemini Code Assist):
```
Gemini: The package @radix-ui/tabs or radix-ui cannot be found.
File: components/ui/tabs.tsx (line 1)
Severity: Error

Package does not exist in npm registry.
```

**This is wrong.** The package DOES exist and is correctly installed.

### Verification

Always verify the package is actually installed:

```bash
npm list radix-ui
# Output: radix-ui@1.0.0+

# Or check node_modules
ls -la node_modules/radix-ui/

# Or check lock file
grep -A2 '"radix-ui"' package-lock.json
```

## Solution: Ignore False Positives

### When Code Review Flags radix-ui

1. **Verify it's actually installed:**
   ```bash
   npm list radix-ui
   npm run build  # Should succeed if package is real
   ```

2. **Acknowledge the comment but don't fix it:**
   ```
   This is a known false positive from Gemini. The radix-ui package
   is correctly installed by shadcn/ui. Radix UI unified all
   @radix-ui/* packages into a single radix-ui package.

   Verification: npm list radix-ui -> shows version installed
   ```

3. **If blocking PR merge:**
   - Comment on PR explaining the false positive
   - Ask reviewer to override if they trust the verification
   - Or suppress the error in linting config

## Prevention Strategies

### 1. CI/CD Validation

Add to GitHub Actions to prevent false blocking:

```yaml
- name: Verify radix-ui installation
  run: npm list radix-ui || npm list @radix-ui
```

### 2. ESLint Configuration

Configure ESLint to trust radix-ui:

```json
{
  "overrides": [
    {
      "files": ["src/components/ui/**"],
      "rules": {
        "import/no-unresolved": ["error", { "ignore": ["radix-ui"] }]
      }
    }
  ]
}
```

### 3. TypeScript

TypeScript should recognize the package if installed correctly:

```bash
# Verify types are available
npm list radix-ui
ls node_modules/radix-ui/types/

# If missing, reinstall
npm install radix-ui@latest
```

### 4. VSCode Configuration

If VSCode shows incorrect errors (red squiggles), update settings:

```json
{
  "eslint.validate": ["javascript", "typescript"],
  "eslint.alwaysShowStatus": true
}
```

## Related Package Changes

Other Radix UI context changes to be aware of:

| Old | New | Notes |
|-----|-----|-------|
| `@radix-ui/react-tabs` | Unified in `radix-ui` | Now via `radix-ui/dist/tabs` |
| `@radix-ui/react-dialog` | Unified in `radix-ui` | Now via `radix-ui/dist/dialog` |
| `@radix-ui/react-select` | Unified in `radix-ui` | Now via `radix-ui/dist/select` |
| `@radix-ui/react-*` | All unified | All primitives in single package |

## Timeline

- **Before 2024-Q3:** Individual `@radix-ui/*` packages
- **2024-Q3 - Present:** Unified `radix-ui` package
- **shadcn/ui adoption:** Follows Radix UI updates (usually within weeks)

## When to Use This Knowledge

- Code review flags `radix-ui` as missing
- Linter complains about radix-ui imports
- shadcn/ui component installation adds `radix-ui` dependency
- Debugging "package not found" errors in CI/CD
- Explaining to teammates why package structure changed

## Quick Reference

```bash
# Check which pattern your project uses
npm list | grep radix
# Output: Shows either radix-ui OR @radix-ui/*

# Update to latest
npm install radix-ui@latest

# Clear cache if issues persist
rm -rf node_modules package-lock.json
npm install

# Verify build works
npm run build
```

## Documentation

- [Radix UI Docs](https://www.radix-ui.com/)
- [shadcn/ui Installation Guide](https://ui.shadcn.com/docs/installation)
- [Radix GitHub - Package Migration](https://github.com/radix-ui/primitives)
