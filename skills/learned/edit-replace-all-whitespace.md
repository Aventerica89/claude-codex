# Edit replace_all Is Whitespace-Sensitive

## Pattern: workaround
## Project: All (Claude Code)

## Problem

The `Edit` tool's `replace_all: true` flag matches strings exactly, including indentation. The same semantic pattern at different indentation levels will NOT be matched by a single `replace_all` call.

## Example

Replacing `bg-slate-800` with `bg-background` across a file where the string appears at different indentation levels:

```tsx
// At 6-space indent
      <div className="bg-slate-800">

// At 10-space indent
          <span className="bg-slate-800">
```

A single `replace_all` with `old_string: "bg-slate-800"` works fine because it matches the exact substring regardless of surrounding whitespace. But if your `old_string` includes surrounding context (like full lines with indentation), you need separate Edit calls for each indentation level.

## Solution

- When using `replace_all`, keep the `old_string` as minimal as possible (just the token being replaced)
- If you must include surrounding context for uniqueness, make separate Edit calls per indentation level
- Test with `tsc` or linting after bulk replacements to catch any misses

## When to Apply

- Bulk renaming/replacing across files with `replace_all`
- Replacing CSS class names, variable names, or any tokens that appear at varying indentation
- Step 10 (B2) type semantic token migrations
