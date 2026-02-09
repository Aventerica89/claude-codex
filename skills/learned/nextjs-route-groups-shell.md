# Next.js App Router Route Groups with Shell Quoting

## Problem
Next.js App Router route groups use parentheses in directory names (e.g., `(dashboard)`), which require special handling in shell commands. Bare paths fail; proper quoting is essential.

## Context
Renvio Companion App uses Next.js 16 App Router with route groups for organizing pages. When working with files in grouped routes via shell commands, paths must be quoted to prevent shell interpretation of parentheses.

## Solution

### 1. **Route Group Directory Structure**
```
src/app/
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── patient-chart/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
└── api/
    └── route.ts
```

### 2. **Shell Command Quoting**

#### CORRECT: Single Quotes
```bash
# List files in route group
ls -la 'src/app/(dashboard)/'

# Open file in editor
code 'src/app/(dashboard)/page.tsx'

# View file contents
cat 'src/app/(dashboard)/layout.tsx'

# Search within route group
grep -r "export default" 'src/app/(dashboard)/'

# Copy file
cp 'src/app/(dashboard)/page.tsx' 'src/app/(dashboard)/page.backup.tsx'
```

#### WRONG: Unquoted Paths
```bash
# FAILS: Shell interprets ( ) as subshell
ls -la src/app/(dashboard)/
# Error: command not found: dashboard

# FAILS: Same issue
code src/app/(dashboard)/page.tsx
```

#### CORRECT: Double Quotes (also works)
```bash
# Double quotes also work
cat "src/app/(dashboard)/page.tsx"

# But single quotes are preferred for consistency
cat 'src/app/(dashboard)/page.tsx'
```

### 3. **Git Commands with Route Groups**
```bash
# Check git status for route group files
git status 'src/app/(dashboard)/'

# View diff for specific file
git diff 'src/app/(dashboard)/page.tsx'

# Commit changes in route group
git add 'src/app/(dashboard)/*'
git commit -m "feat: update dashboard layout"

# Show file history
git log --oneline 'src/app/(dashboard)/page.tsx'
```

### 4. **Common Tool Integration**

#### Node/npm Scripts
```bash
# Edit package.json scripts to use quoted paths
{
  "scripts": {
    "lint:dashboard": "eslint 'src/app/(dashboard)/**/*.tsx'",
    "format:dashboard": "prettier --write 'src/app/(dashboard)/**/*.{ts,tsx}'"
  }
}

npm run lint:dashboard
```

#### TypeScript/IDE
```bash
# Type check specific route group
tsc --noEmit 'src/app/(dashboard)/**/*.tsx'
```

#### File Operations
```bash
# Create new file in route group (must quote parent path)
touch 'src/app/(dashboard)/new-file.tsx'

# Move file between route groups
mv 'src/app/(dashboard)/old-page.tsx' 'src/app/(auth)/old-page.tsx'

# Remove file
rm 'src/app/(dashboard)/unused-page.tsx'
```

### 5. **String Length Note**
When writing route group paths in code (not shell), no quoting needed:
```typescript
// TypeScript: no quoting required
import Dashboard from '@/app/(dashboard)/page'
import { getLayout } from '@/app/(dashboard)/layout'

// File paths in code are strings
const dashboardPath = 'src/app/(dashboard)/page.tsx'
```

## Pattern Checklist
- [ ] Always quote paths with parentheses in shell
- [ ] Use single quotes for consistency
- [ ] Apply to git commands, npm scripts, file operations
- [ ] No quoting needed in TypeScript/code imports
- [ ] Test command before running on multiple files

## Common Issues

### "command not found: dashboard"
**Cause:** Unquoted path, shell interprets `()` as subshell
**Fix:** Quote the entire path
```bash
# WRONG
ls -la src/app/(dashboard)/

# RIGHT
ls -la 'src/app/(dashboard)/'
```

### Copy/paste fails in scripts
**Cause:** Command from documentation doesn't have quotes
**Fix:** Add quotes when adapting to route groups
```bash
# Generic example
cp src/app/page.tsx src/app/page.backup.tsx

# Route group version
cp 'src/app/(dashboard)/page.tsx' 'src/app/(dashboard)/page.backup.tsx'
```

## Real Example
Working on Renvio Companion App landing page:
```bash
# Check status of dashboard route group
git status 'src/app/(dashboard)/'

# View changes to dashboard layout
git diff 'src/app/(dashboard)/layout.tsx'

# Format dashboard TypeScript files
prettier --write 'src/app/(dashboard)/**/*.{ts,tsx}'

# Check TypeScript errors in dashboard
tsc --noEmit 'src/app/(dashboard)/**/*.tsx'
```

## Related Skills
- nextjs-dev-server-cleanup.md
- nextjs-security-audit-checklist.md

## References
- [Next.js App Router Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [Bash Quoting Basics](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)
