# shadcn Component Migration - Backwards Compatibility Pattern

**Extracted:** 2026-01-29
**Context:** When updating shadcn/ui components, existing code may break due to API changes

## Problem

When running `npx shadcn@latest add <component>`, the new component versions may:
1. Remove custom variants you've added (e.g., `warning`, `success` for Badge)
2. Change component APIs entirely (e.g., Breadcrumb `items` prop vs compositional API)
3. Remove custom props (e.g., `rows` prop on SkeletonTable)
4. Remove custom skeleton components (SkeletonCard, SkeletonChart, SkeletonSiteCard)

This causes build failures like:
```
Type '"warning"' is not assignable to type '"default" | "destructive" | "outline"...'
Property 'items' does not exist on type 'IntrinsicAttributes'
```

## Solution

### 1. Badge - Add Custom Variants Back
```tsx
// In src/components/ui/badge.tsx variants object:
variants: {
  variant: {
    default: "...",
    secondary: "...",
    destructive: "...",
    warning: "bg-yellow-500 text-white [a&]:hover:bg-yellow-600",
    success: "bg-green-500 text-white [a&]:hover:bg-green-600",
    outline: "...",
    // ... rest
  },
},
```

### 2. Breadcrumb - Support Both APIs
```tsx
interface BreadcrumbItemData {
  label: string
  href?: string
}

interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  items?: BreadcrumbItemData[]
}

function Breadcrumb({ items, children, ...props }: BreadcrumbProps) {
  if (items) {
    return (
      <nav aria-label="breadcrumb" {...props}>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {item.href ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </nav>
    )
  }
  return <nav aria-label="breadcrumb" {...props}>{children}</nav>
}
```

### 3. Skeleton - Add Custom Components
```tsx
function SkeletonCard() { /* ... */ }
function SkeletonChart() { /* ... */ }
function SkeletonSiteCard() { /* ... */ }
function SkeletonTable({ rows = 4 }: { rows?: number }) { /* ... */ }

export { Skeleton, SkeletonCard, SkeletonChart, SkeletonSiteCard, SkeletonTable }
```

## Prevention Strategy

Before running shadcn updates:
1. Check what custom variants/props exist: `grep -rn "variant=" src/`
2. Note all custom skeleton exports
3. After update, run `npm run build` locally before pushing
4. Re-add custom variants/props as needed

## When to Use

- Before/after running `npx shadcn@latest add`
- When build fails with type errors about missing variants
- When component props suddenly don't exist
- When migrating to new shadcn component versions
