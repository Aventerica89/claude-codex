# shadcn Registry Sync Pattern

## Problem
When updating shadcn/ui component interfaces (adding new props or changing prop types), the registry copies under `registry/new-york/` must be kept in sync, or build fails with type errors.

## Context
Working on Renvio Companion App (Next.js 16 + React 19 with shadcn/ui components), we discovered that modifying a component's props in one location doesn't automatically update the registry.

## Solution
Maintain registry copies whenever component interfaces change:

### 1. **Identify Component Changes**
When you modify a shadcn component's props interface:
```typescript
// src/components/ui/accordion.tsx
interface AccordionItemProps {
  value: string
  title: string
  content: string
  isOpen?: boolean  // NEW PROP
}
```

### 2. **Update Registry Copies**
Sync changes to `registry/new-york/{category}/`:
```bash
# Find registry components
find registry/new-york/ -name "accordion.tsx"

# Update each copy with the same prop changes
```

### 3. **Validate Build**
```bash
npm run build
# Or for Astro: npm run build
```

### 4. **Pattern Structure**
Registry entries typically live in:
- `registry/new-york/components/` (UI components)
- `registry/new-york/blocks/` (pre-built blocks)
- `registry/new-york/example/` (examples)

Each directory may have duplicates of the same component.

## Prevention Checklist
- [ ] After adding/removing props from a component
- [ ] Search `registry/` for component filename
- [ ] Update ALL occurrences in registry
- [ ] Run build to catch type errors
- [ ] Git check that registry files are committed

## Tools
- `grep -r "ComponentName" registry/` - Find all registry copies
- Build error stack trace - Points to exact line in registry file

## Real Example
When adding `isOpen` prop to Accordion:
1. Modified `src/components/ui/accordion.tsx`
2. Found 3 registry copies (components, blocks, examples)
3. Updated all 3 with new prop
4. Build succeeded

## Related Skills
- shadcn-component-migration.md
- string-length-management.md
