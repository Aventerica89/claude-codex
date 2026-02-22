# Tailwind Typography: dark:prose-invert Required for Dark Mode

**Extracted:** 2026-02-22
**Context:** Any project using @tailwindcss/typography in a dark-mode interface

## Problem
When rendering markdown with Tailwind Typography's `prose` class inside a dark-themed
component or page, all formatted text (headings, bold, lists, links, code) renders with
light-mode colors — nearly invisible on dark backgrounds.

```tsx
// Markdown renders invisible on dark bg
<Markdown className="prose prose-sm">{content}</Markdown>
```

## Solution
Always add `dark:prose-invert` alongside `prose`:

```tsx
<Markdown className="prose prose-sm dark:prose-invert">{content}</Markdown>
```

`prose-invert` switches all typography tokens to light text for dark backgrounds.
Without it, the plugin uses its default light-mode palette regardless of app theme.

## When to Use
Any time you use `prose` or `prose-sm`/`prose-lg`/`prose-xl` classes:
- Chat message markdown rendering
- Blog post / article content
- README / docs displays
- AI response text areas

## Notes
- Also applies to `prose-zinc`, `prose-slate`, etc. — all need `dark:prose-invert`
- For components that are always dark (not toggled), use `prose-invert` directly
  without the `dark:` prefix
