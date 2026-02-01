# Bricks Builder: Asymmetric Gallery with Split Background

**Extracted:** 2026-01-29
**Source:** gallery-heard-in-every-county.json
**Category:** gallery
**Confidence:** High
**Professional Quality:** Yes (100/100 score)

## Pattern Summary

A sophisticated gallery component featuring an asymmetric nested grid layout with a split colored background. Photos are displayed in a 2×2 grid on the left (with one tall spanning photo), while content sits on the right. The split background (60/40) creates visual interest without distracting from the content.

## When to Use

- Campaign photo galleries showcasing events across locations
- Portfolio sections with asymmetric photo layouts
- Content sections where photos need equal visual weight with text
- Designs requiring split-tone backgrounds for brand consistency
- When you need a professional, modern gallery that's not just a simple grid

## Structure

```
section.sm-gallery
├── div.sm-gallery__bg-left (absolute, 60% width, dark color)
├── div.sm-gallery__bg-right (absolute, 40% width, light color)
└── container (relative, z-index: 1)
    └── div.sm-gallery__grid (1.4fr 1fr columns)
        ├── div.sm-gallery__photos (2×2 grid)
        │   ├── div.sm-gallery__photo.sm-gallery__photo--tall (spans 2 rows)
        │   ├── div.sm-gallery__photo (top right)
        │   └── div.sm-gallery__photo (bottom right)
        └── div.sm-gallery__content
            ├── text-basic.sm-gallery__eyebrow
            ├── heading.sm-gallery__title
            ├── text-basic.sm-gallery__description
            └── div.sm-gallery__meta
                ├── div.sm-gallery__meta-item (icon + text)
                └── div.sm-gallery__meta-item (icon + text)
```

## Key Global Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `sm-gallery__bg-left` | Left split background | Absolute, 60% width, dark color |
| `sm-gallery__bg-right` | Right split background | Absolute, 40% width, light color |
| `sm-gallery__grid` | Main 2-column grid | 1.4fr 1fr, responsive |
| `sm-gallery__photos` | Photo grid container | 2×2 grid, symmetric |
| `sm-gallery__photo` | Individual photo block | Border radius, flex center |
| `sm-gallery__photo--tall` | Tall photo variant | Spans 2 rows (1/3) |
| `sm-gallery__content` | Content block | Padding, responsive |
| `sm-gallery__eyebrow` | Small label text | Uppercase, letter-spaced, primary color |
| `sm-gallery__title` | Main heading | Large, bold, uppercase |
| `sm-gallery__description` | Body text | Line-height 1.6 |
| `sm-gallery__meta` | Metadata row | Flex, wrapped |
| `sm-gallery__meta-item` | Icon + text pair | Flex, small gap |

## ACSS Variables Used

| Variable | Usage | Count |
|----------|-------|-------|
| `var(--base)` | Left background, title | 2x |
| `var(--white)` | Right background | 1x |
| `var(--base-dark)` | Photo backgrounds | 3x |
| `var(--primary)` | Eyebrow text, icons | 3x |
| `var(--neutral-dark)` | Description, meta text | 3x |
| `var(--space-xxl)` | Container padding | 2x |
| `var(--space-xl)` | Main grid gap, content padding | 2x |
| `var(--space-l)` | Meta row gap | 2x |
| `var(--space-m)` | Photo grid gap, title margin | 3x |
| `var(--space-s)` | Eyebrow margin | 1x |
| `var(--space-xs)` | Meta item gap | 2x |
| `var(--text-s)` | Eyebrow, meta text | 3x |
| `var(--text-m)` | Description text | 1x |
| `var(--h2)` | Title font size | 1x |
| `var(--radius-m)` | Photo corners | 3x |

## Layout Configuration

### Desktop (Default)
- **Main Grid:** 1.4fr 1fr (asymmetric, 58.3% / 41.7%)
- **Photo Grid:** 1fr 1fr × 1fr 1fr (2×2, symmetric)
- **Gap:** `var(--space-xl)` between columns, `var(--space-m)` between photos
- **Split Background:** 60% dark / 40% light

### Tablet (`:tablet_portrait`)
- **Main Grid:** 1fr (single column, stacked)
- **Photo Grid:** Remains 2×2
- **Split Background:** 100% width (both layers)
- **Content Padding:** Reduced to 0 on sides

### Mobile (`:mobile_portrait`)
- Uses tablet styles
- Consider adding mobile-specific adjustments if needed

## BEM Naming Pattern

**Block:** `sm-gallery` (Smith campaign Gallery)
**Elements:**
- `__bg-left`, `__bg-right` - Background decorations
- `__grid` - Main layout container
- `__photos` - Photo grid wrapper
- `__photo` - Individual photo
- `__content` - Text content wrapper
- `__eyebrow` - Small label
- `__title` - Main heading
- `__description` - Body text
- `__meta` - Metadata container
- `__meta-item` - Icon + text pair

**Modifiers:**
- `--tall` - Tall photo variant (spans 2 rows)

## Anti-Patterns Avoided

- ✅ All elements have global classes
- ✅ No hardcoded colors (100% ACSS variables)
- ✅ No hardcoded spacing (100% ACSS variables)
- ✅ No hardcoded font sizes (100% ACSS variables)
- ✅ Responsive breakpoints included
- ✅ Consistent BEM naming throughout
- ✅ All elements properly labeled
- ✅ No duplicate global classes

## Key Techniques

### 1. Split Background via Absolute Positioning
```json
{
  "settings": {
    "_position": "absolute",
    "_top": "0",
    "_bottom": "0",
    "_left": "0",
    "_width": "60%",
    "_zIndex": "0",
    "_background": {"color": {"raw": "var(--base)"}}
  }
}
```

Content sits above with `z-index: 1`.

### 2. Asymmetric Grid for Visual Interest
```json
{
  "_display": "grid",
  "_gridTemplateColumns": "1.4fr 1fr",
  "_gap": "var(--space-xl)"
}
```

1.4fr gives slightly more weight to photos side.

### 3. Tall Photo Spanning Multiple Rows
```json
{
  "_cssGlobalClasses": ["sm-gallery__photo", "sm-gallery__photo--tall"],
  "_gridRow": "1 / 3"
}
```

Creates asymmetric photo layout within symmetric grid.

### 4. Meta Information Pattern (Icon + Text)
```json
{
  "_display": "flex",
  "_gap": "var(--space-xs)",
  "_alignItems": "center"
}
```

Reusable pattern for date, photo count, location, etc.

## Related Patterns

- **Nested Grid Pattern** - Similar outer/inner grid structure
- **Split Background Pattern** - Absolute positioned background technique
- **Meta Information Blocks** - Icon + text pairs
- **Typography Hierarchy** - Eyebrow + title + description pattern

## Variations

This appears to be v3 in the series:
- **v1:** Basic gallery grid (not analyzed)
- **v2:** Improved with ACSS variables (not analyzed)
- **v3:** Current - Added split background, refined spacing

## Example JSON Structure

```json
{
  "content": [
    {
      "id": "section",
      "name": "section",
      "children": ["bg-left", "bg-right", "container"],
      "settings": {
        "_position": "relative",
        "_overflow": "hidden"
      }
    },
    {
      "id": "bg-left",
      "name": "div",
      "settings": {
        "_cssGlobalClasses": ["sm-gallery__bg-left"]
      }
    },
    {
      "id": "container",
      "name": "container",
      "children": ["grid"],
      "settings": {
        "_position": "relative",
        "_zIndex": "1",
        "_padding": {
          "top": "var(--space-xxl)",
          "bottom": "var(--space-xxl)"
        }
      }
    },
    {
      "id": "grid",
      "name": "div",
      "children": ["photos", "content"],
      "settings": {
        "_cssGlobalClasses": ["sm-gallery__grid"]
      }
    }
  ],
  "globalClasses": [
    {
      "name": "sm-gallery__grid",
      "settings": {
        "_display": "grid",
        "_gridTemplateColumns": "1.4fr 1fr",
        "_gridTemplateColumns:tablet_portrait": "1fr",
        "_gap": "var(--space-xl)"
      }
    }
  ]
}
```

## Implementation Checklist

When using this pattern:
- [ ] Update BEM prefix (change `sm-` to your project prefix)
- [ ] Adjust photo aspect ratios if needed (min-heights)
- [ ] Customize split background widths (60/40 is default)
- [ ] Replace placeholder photo blocks with actual images
- [ ] Update eyebrow text, title, and description
- [ ] Customize meta information (dates, counts, etc.)
- [ ] Test responsive behavior on tablet/mobile
- [ ] Verify ACSS variables match your theme

## Quality Metrics

- **BEM Compliance:** 100%
- **ACSS Compliance:** 100%
- **Responsive:** Yes (1 breakpoint)
- **Labeled Elements:** 100%
- **Reusability:** High
- **Complexity:** Medium
- **Overall Score:** 100/100

---

**Pattern extracted from professional template.** Ready for reuse in similar gallery components.
