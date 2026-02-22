---
name: design-system
description: Generate or update a living design system playground — standalone HTML reference for tokens, components, HIG rules, and responsive behavior
---

# /design-system Command

Build the design system BEFORE building the app. The playground becomes the contract.

## Arguments

Parse arguments after `/design-system`:
- No args — full workflow (check state, generate/update playground)
- `:init` — run `/interface-design:init` to establish tokens and direction
- `:audit` — run `/interface-design:audit` against established system
- `:critique` — run `/interface-design:critique` for quality review
- `:hig` — run HIG compliance pass (`/hig-ui-pass`)
- `:open` — just open the existing playground in browser

## Workflow

### Step 1: Check Prerequisites

1. Look for `.interface-design/system.md` in project root
   - If missing: run `/interface-design:init` first (establish tokens, direction, depth)
   - If present: read it to load current design tokens

2. Look for `.claude/apple-design-context.md` in project root
   - If missing: run `/hig-project-context` to generate it
   - If present: read it for HIG compliance context

### Step 2: Locate or Create Playground

Search for existing playground file:
```
{project-name}-design-system.html
```

If found: update it with any new/changed tokens from `system.md`
If not found: generate a new one using the `/playground` skill

### Step 3: Required Sections

Every playground MUST include these sections (in order):

| # | Section | Category | Description |
|---|---------|----------|-------------|
| 1 | CSS Source of Truth | foundations | All CSS custom properties with oklch values |
| 2 | Color Palette | brand foundations | All color tokens as swatches, light + dark |
| 3 | Typography Scale | foundations | Font sizes, weights, families with specimens |
| 4 | Spacing Scale | foundations | Base-4 scale with visual blocks |
| 5 | Radius Scale | foundations | Rounded boxes at each radius value |
| 6 | Card Anatomy | components | Annotated card examples with measurement overlays |

### Step 4: Recommended Sections

Add these based on project needs:

| Section | Category | When to Include |
|---------|----------|----------------|
| Brand Signal Usage | brand | When brand color has scarcity rules |
| Text Hierarchy | brand foundations | Always (3-level: primary, secondary, tertiary) |
| Depth Model | foundations components | When project uses borders/shadows for depth |
| Component Patterns | components | When shadcn or custom components exist |
| Responsive Breakpoints | mobile | When project targets mobile |
| PWA Assets | mobile | When project is a PWA |
| More Drawer | mobile components | When mobile nav has >4 tabs |

### Step 5: Interactive Features

Every playground MUST have:
- [ ] Dark mode toggle (top-right)
- [ ] Category filter navigation (top bar with pills)
- [ ] Sidebar TOC (fixed right, scroll-spy, auto-hides on mobile)
- [ ] Back-to-top button (fixed bottom-right)
- [ ] Annotation toggle on card anatomy section
- [ ] Copy-to-clipboard for CSS variable values

### Step 6: HIG Compliance Pass

After generating/updating, run `/hig-ui-pass` to verify:
- Touch targets >= 44px
- Safe area handling
- Tab bar compliance
- Overscroll behavior
- PWA manifest completeness

### Step 7: Open in Browser

```bash
open {project-name}-design-system.html
```

## File Structure

```
project-root/
  .interface-design/
    system.md              # Design direction + tokens (source of truth)
  .claude/
    apple-design-context.md  # HIG compliance context
  {project}-design-system.html  # The playground (generated output)
```

## Skills & Agents Used

| Tool | Role |
|------|------|
| /interface-design:init | Establish tokens, direction, system.md |
| /interface-design:audit | Audit code against design system |
| /interface-design:critique | Quality critique |
| /playground | Generate standalone HTML playground |
| /hig-project-context | Apple HIG context file |
| /hig-ui-pass | Full-platform HIG compliance pass |
| Sosumi MCP | Live Apple HIG documentation |

## Anti-Patterns

- Building UI components before establishing the design system
- Hardcoding color values instead of using CSS custom properties
- Skipping the HIG pass on mobile-targeted projects
- Using shadows for depth when the system specifies borders-only
- Applying brand color decoratively when scarcity rules exist
