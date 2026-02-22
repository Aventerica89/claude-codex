---
name: Design System Playground
description: Auto-activates when working on design systems, style guides, token definitions, or UI component libraries. Ensures playground-first workflow where the design system is built and visualized before app components.
version: 1.0.0
---

# Design System Playground Skill

This skill activates when you detect work related to design systems, style guides, design tokens, or UI component standards.

## Activation Triggers

Activate when the conversation involves:
- Creating or modifying design tokens (colors, spacing, typography, radius)
- Building a style guide or component library
- Establishing visual standards for a new project
- Auditing existing UI against a design system
- Working with `.interface-design/system.md` files
- References to "playground", "design system", "style guide", or "token reference"

## Core Principle

**Build the design system BEFORE building the app.** The playground becomes the contract that all components must follow.

## Workflow

When this skill activates:

1. **Check for existing system** — look for `.interface-design/system.md` in the project root
   - If missing: suggest running `/interface-design:init` to establish direction and tokens
   - If present: load it as the source of truth for all design decisions

2. **Check for playground** — look for `{project}-design-system.html` in the project root
   - If missing: suggest running `/design-system` to generate the interactive reference
   - If present: ensure any token changes are reflected in the playground

3. **Enforce token usage** — when writing or reviewing UI code:
   - Colors must reference CSS custom properties (never hardcoded)
   - Spacing must follow the base-4 scale
   - Typography must use defined sizes and weights
   - Radius must use defined scale values
   - Brand color must follow scarcity rules if defined

4. **HIG awareness** — check for `.claude/apple-design-context.md`
   - If present: apply HIG rules to all UI work
   - Key rules: 44px touch targets, safe area insets, tab bar compliance

## Available Commands

| Command | Purpose |
|---------|---------|
| `/design-system` | Full workflow — generate or update playground |
| `/design-system:init` | Establish tokens via /interface-design:init |
| `/design-system:audit` | Audit code against system |
| `/design-system:critique` | Quality critique |
| `/design-system:hig` | HIG compliance pass |
| `/design-system:open` | Open existing playground in browser |

## Required Playground Sections

Every design system playground must include at minimum:
1. CSS Source of Truth (all custom properties)
2. Color Palette (light + dark swatches)
3. Typography Scale (sizes, weights, families)
4. Spacing Scale (visual base-4 blocks)
5. Radius Scale (rounded box examples)
6. Card Anatomy (annotated measurement overlays)

## Interactive Features

Every playground must have:
- Dark mode toggle
- Category filter navigation
- Sidebar TOC with scroll-spy
- Back-to-top button
- Annotation toggles on anatomy sections

## Proven In

- **Clarity** (`~/clarity/clarity-design-system.html`) — 13 sections, full HIG, filtering, TOC, back-to-top
