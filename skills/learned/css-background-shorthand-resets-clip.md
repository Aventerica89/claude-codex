# CSS background Shorthand Resets background-clip

**Extracted:** 2026-02-17
**Context:** CSS gradient text effects with Tailwind

## Problem

CSS `background:` shorthand resets ALL background sub-properties to defaults, including `background-clip` back to `border-box`. This silently undoes Tailwind's `bg-clip-text` utility, causing gradient text to render as a solid colored rectangle instead of clipped text.

## Solution

Use `background-image:` instead of `background:` when combining with `background-clip: text`:

```css
/* WRONG: shorthand resets background-clip */
.shimmer-text {
  background: linear-gradient(90deg, #999 0%, cyan 50%, #999 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

/* CORRECT: background-image doesn't reset clip */
.shimmer-text {
  background-image: linear-gradient(90deg, #999 0%, cyan 50%, #999 100%);
  background-size: 250% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

## When to Use

- Creating animated gradient text effects
- Using `background-clip: text` with any gradient
- Debugging "solid rectangle instead of text" rendering issues
- Any CSS where `background:` shorthand appears near `background-clip`
