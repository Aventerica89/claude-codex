# ACSS Content Grid Breakouts

**Extracted:** 2025-02-01
**Context:** Bricks Builder + Automatic CSS full-bleed layouts and split sections

## Problem

Creating full-bleed (edge-to-edge) sections with column splits in Bricks Builder using ACSS, without hacky CSS like `width: 100vw; margin-left: calc(50% - 50vw)`.

## Solution

Use ACSS Content Grid with utility classes. No custom CSS needed.

### Prerequisites

In ACSS Dashboard > Layout > Content Grid:
- **Content Grid:** ON
- **Default Sections to Content Grid:** ON

This automatically applies Content Grid to all sections.

### Content Grid Zones

Content Grid creates named column tracks for breakouts:

| Zone | Class | CSS Equivalent | Use Case |
|------|-------|----------------|----------|
| Content | (default) | `grid-column: content` | Standard content width |
| Feature | `.content--feature` | `grid-column: feature` | Moderate breakout |
| Feature Max | `.content--feature-max` | `grid-column: feature-max` | Wider breakout |
| Full | `.content--full` | `grid-column: full` | Edge-to-edge |
| Full Safe | `.content--full-safe` | `grid-column: full` + gutters | Full with padding |

### Full-Bleed 50/50 Hero Pattern

**Structure:**
```
Section (auto Content Grid from ACSS)
  └── Inner Wrapper
        ├── .content--full (breaks out to edges)
        └── .grid--auto-2 (responsive 2-column)
            ├── Content Wrapper (left column)
            └── Media Wrapper (right column)
```

**Bricks Classes on Inner Wrapper:**
- `.your-bem-class` (e.g., `.vol-hero__inner-wrapper`)
- `.grid--auto-2` (ACSS 2-column auto grid)
- `.content--full` (ACSS full-bleed breakout)

### ACSS Grid Utilities

| Columns | Class | Behavior |
|---------|-------|----------|
| 2 equal | `.grid--auto-2` | Auto-responsive, stacks on mobile |
| 3 equal | `.grid--auto-3` | Auto-responsive |
| 1:2 ratio | `.grid--auto-1-2` | Unbalanced split |
| 2:1 ratio | `.grid--auto-2-1` | Unbalanced split |

### Grid Variables (for custom CSS)

```css
/* Equal columns */
var(--grid-2)  /* repeat(2, minmax(0, 1fr)) */
var(--grid-3)  /* repeat(3, minmax(0, 1fr)) */

/* Auto-responsive */
var(--grid-auto-2)  /* Uses auto-fit with minmax */
var(--grid-auto-3)
```

## Example

**Hero with full-bleed 50/50 split:**

Bricks structure:
```
SECTION: Volunteer Hero
  DIV: Inner Wrapper (Grid)
    Classes: .vol-hero__inner-wrapper .grid--auto-2 .content--full

    DIV: Content Wrapper (left)
      - Brow badge
      - Heading
      - Subheading
      - Body text
      - CTA button

    DIV: Media Wrapper (right)
      - Image
      - Stats overlay
```

**Custom CSS (only for styling, not layout):**
```css
.vol-hero__inner-wrapper {
  min-height: 80vh;
}

.vol-hero__content-wrapper {
  background: var(--base-dark);
  padding: var(--section-space-m) var(--gutter);
}

.vol-hero__media-wrapper {
  position: relative;
}
```

## When to Use

- Hero sections with image + content split
- Any full-width section needing column layouts
- Feature sections with breakout elements
- Anytime you need edge-to-edge content in Bricks + ACSS

## Anti-Pattern (Don't Do This)

```css
/* WRONG - hacky, can cause scrollbar issues */
.section {
  width: 100vw;
  margin-left: calc(50% - 50vw);
}

/* RIGHT - use ACSS utility class */
.inner-wrapper {
  /* Add .content--full class in Bricks instead */
}
```

## Related ACSS Docs

- https://docs.automaticcss.com/3.0/grids/content-grid
- https://docs.automaticcss.com/3.0/dimension/breakout-classes
- https://docs.automaticcss.com/3.0/dimension/content-width
- https://docs.automaticcss.com/3.0/dimension/content-width-safe
