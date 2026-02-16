# Composable Component href Prop Pattern

## Pattern: project_specific
## Project: WP Dispatch, React/Next.js apps

## Problem

You have an existing display component (e.g., StatCard) and want to make some instances clickable/navigable without wrapping each usage in a `<Link>` at the call site.

## Solution

Add an optional `href` prop to the component. When present, the component wraps itself in a `<Link>` with hover styling:

```tsx
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  href?: string; // Optional navigation
}

export function StatCard({ title, value, icon: Icon, href }: StatCardProps) {
  const card = (
    <Card className={href ? "transition-colors hover:border-primary/50" : undefined}>
      {/* ... card content ... */}
    </Card>
  );

  if (href) {
    return <Link href={href}>{card}</Link>;
  }
  return card;
}
```

## Benefits

- Backwards compatible (existing usages without `href` unchanged)
- Hover effects only when clickable
- Clean API at usage site: `<StatCard title="Sites" value={42} href="/sites" />`
- No wrapper div or Link needed at call site

## When to Apply

- Making dashboard stat cards clickable to filtered list views
- Any display-only component that optionally needs navigation
- Cards, badges, or panels that sometimes link somewhere
