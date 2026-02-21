# Component Preview: CSS Environment Mismatch in Sandboxed Iframes

**Extracted:** 2026-02-21
**Context:** Building live component preview iframes using a CDN CSS framework
that depends on CSS custom properties (design tokens) defined elsewhere.

## Problem

Components using design-token CSS classes (shadcn's `bg-muted`, `text-foreground`,
`bg-background`, `border-border`, `bg-card`, `text-primary`, etc.) render blank or
invisible in a sandboxed `srcdoc` iframe that only loads the Tailwind CDN.

Root cause: The Tailwind CDN has no knowledge of the CSS variables that define these
tokens (`--muted`, `--foreground`, etc.). They're typically injected via `globals.css`
in the host app — but the iframe is a null-origin sandbox with no access to the host
stylesheet. Classes resolve to `transparent`/`inherit` and components look empty.

## Solution

Two-part fix:

1. **Static demo wrappers** for data-dependent components: append a `*Demo` function
   to the component's code that hardcodes realistic props. Update detection logic to
   prefer `*Demo`/`*Preview`/`*Example`/`*Story` names:
   ```typescript
   const allMatches = [...code.matchAll(/(?:^|\n)\s*(?:function|const)\s+([A-Z][A-Za-z0-9_]*)/g)];
   const demoMatches = [...code.matchAll(/(?:^|\n)\s*(?:function|const)\s+([A-Z][A-Za-z0-9_]*(?:Demo|Preview|Example|Story))\b/g)];
   const componentName = demoMatches.length > 0
     ? demoMatches[demoMatches.length - 1][1]
     : allMatches.length > 0 ? allMatches[allMatches.length - 1][1] : null;
   ```

2. **AI-generated CSS-variable-free examples** via a per-card Generate button.
   Prompt the AI with explicit rules:
   - Use ONLY concrete Tailwind classes (bg-gray-100, text-gray-900, etc.)
   - NEVER use shadcn token classes: bg-muted, text-foreground, bg-background,
     border-border, text-muted-foreground, bg-card, bg-popover, bg-secondary,
     text-primary, bg-primary, bg-accent
   - Include realistic dummy data
   - No import statements (React available as global)
   - Must be visible on white (#f8fafc) background

   Store per-card as local state; iframe renders `generatedExample ?? entry.code`.

## Example

Toggle bar Generate button pattern:
```tsx
{viewMode === 'preview' && (
  <button
    onClick={handleGenerateExample}
    disabled={generating}
    className="ml-auto flex items-center gap-1 ..."
  >
    {generating
      ? <><Spinner />{' '}Generating…</>
      : <><Sparkles />{generatedExample ? ' Regenerate' : ' Generate'}</>
    }
  </button>
)}

// Iframe
<iframe srcDoc={buildPreviewHtml(generatedExample ?? entry.code)} />
```

## When to Use

- Building any component preview iframe that loads CSS via CDN (Tailwind Play CDN,
  Bootstrap CDN, etc.) for components that use the host app's design tokens
- Any sandboxed `srcdoc` iframe without access to host stylesheets
- Component registries, design system explorers, Storybook-lite features
