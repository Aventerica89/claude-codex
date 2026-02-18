# Magic UI Components Install via shadcn Registry

**Extracted:** 2026-02-18
**Context:** Installing Magic UI components (animated-grid-pattern, dock, etc.) into any project using shadcn/ui

## Problem
`npx magicui@latest add animated-grid-pattern` returns a 404 error. The `magicui` package does not exist on npm. Magic UI components are distributed through the shadcn registry system, not as a standalone npm package.

## Solution
Use `npx shadcn@latest add` with the full Magic UI registry URL:

```bash
npx shadcn@latest add "https://magicui.design/r/animated-grid-pattern"
npx shadcn@latest add "https://magicui.design/r/dock"
```

The URL pattern is: `https://magicui.design/r/{component-name}`

## Additional Notes
- Magic UI components import from `motion/react` (not `framer-motion`). The `motion` package is installed automatically as a dependency.
- Components are placed in `src/components/ui/` like standard shadcn components.
- Works with Tailwind v3 and v4.

## When to Use
Whenever installing a Magic UI component. Search for component names at magicui.design, then use the registry URL pattern above.
