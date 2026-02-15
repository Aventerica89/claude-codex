# UX Polish Workflow — Plan-Driven, Not Agent-Heavy

**Extracted:** 2026-02-14
**Context:** Multi-page UX/UI overhaul of an existing app (19 tasks, 4 batches)

## Problem

UI polish work (dark mode, responsive layout, mobile UX, animations) requires many small precise changes across many files. Using lots of agents or complex orchestration adds overhead without value for this type of work.

## Solution

**Plan quality > agent quantity.** Use the brainstorming + writing-plans + executing-plans pipeline, but keep execution direct (no subagents).

### Workflow

1. **`superpowers:brainstorming`** — Design the UX changes as a coherent system (color palette, responsive breakpoints, touch targets, animation patterns). Don't skip this for "simple" UI work.

2. **`superpowers:writing-plans`** — Write tasks with EXACT specifics:
   - Exact file paths
   - Exact CSS classes to find and replace (e.g., `bg-slate-100` → `bg-primary/10`)
   - Exact responsive patterns (e.g., `grid-cols-2 lg:grid-cols-4`)
   - Exact component changes (props, state, imports)

3. **`superpowers:executing-plans`** — Execute in batches of 3-5 tasks:
   - Direct editing (Read + Edit), no subagents
   - Build verify after every task
   - Test suite between batches
   - Grep audit for patterns (e.g., hardcoded colors)

### Key Patterns That Produce Polish

| Pattern | Example |
|---------|---------|
| Mobile-first grid | `grid-cols-2 lg:grid-cols-4` (not `sm:grid-cols-2`) |
| Touch targets | `h-11 w-11 lg:h-7 lg:w-7` (44px mobile, 28px desktop) |
| Dark mode semantic | `bg-primary/10` + `text-primary` instead of `bg-slate-100` + `text-slate-600` |
| Sticky mobile headers | `sticky top-12 lg:static z-30` + `backdrop-blur-sm` |
| Always-visible mobile actions | `opacity-100 lg:opacity-0 lg:group-hover:opacity-100` |
| Collapsible sections | State toggle + ChevronDown rotation + conditional CardContent render |
| Shimmer > pulse | CSS gradient animation with `background-size: 200%` + position sweep |
| Responsive text | `text-xl lg:text-2xl` for headings, `text-xs lg:text-sm` for labels |

### Dark Mode Audit Pattern

After all edits, run:
```bash
grep -rn 'bg-slate-(?!900|800)' src/app/ src/components/
grep -rn 'text-slate-' src/app/ src/components/
grep -rn 'hover:bg-slate-' src/app/ src/components/
```

Replace with semantic alternatives:
- `bg-slate-50` → `bg-muted` or `bg-background`
- `bg-slate-100` → `bg-primary/10` or `bg-muted`
- `text-slate-600` → `text-primary` or `text-muted-foreground`
- `hover:bg-slate-50` → `hover:bg-muted`
- `bg-white` → `bg-background` or `bg-card`

### What NOT to Use

- **No subagents** for UI polish — plan is detailed enough
- **No code-reviewer** — CSS changes don't need logic review; build + test suffices
- **No TDD** — visual changes need visual verification, not test-first
- **No parallel agents** — tasks are sequential (each builds on prior responsive patterns)

## When to Use

- Multi-page UI/UX overhaul (dark mode, responsive, mobile, animations)
- Design system upgrades (color palette, typography, spacing)
- PWA conversion (manifest, service worker, install flow, touch gestures)
- Any work that's "many small precise CSS/layout changes across many files"
