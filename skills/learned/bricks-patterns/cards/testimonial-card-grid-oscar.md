# Bricks Builder: Testimonial Card Grid (Oscar Pattern)

**Extracted:** 2026-01-29
**Source:** medsparanker.com
**Category:** cards
**Confidence:** High
**Professional Quality:** Yes (92/100 score - Frames library component)

## Pattern Summary

A professional testimonial grid component featuring company testimonials in card format. Each card displays a company logo, testimonial text, and author information with avatar. Uses Frames library intro pattern for section header and custom card components. Responsive grid collapses from 2 columns to 1 on mobile.

## When to Use

- Displaying client testimonials or reviews
- Showing company partnerships and endorsements
- Case studies or success stories
- Social proof sections on landing pages
- B2B trust-building content
- Service/product review pages

## Structure

```
section.testimonial-section-oscar
├── container.fr-intro-alpha (intro section)
│   ├── heading ("Trusted By These Companies")
│   ├── text-basic.fr-accent-heading ("testimonials")
│   └── text-basic.fr-lede (description)
└── container.testimonial-grid-oscar (ul)
    ├── div.testimonial-card-oscar (li) [×4 cards]
        ├── block__header
        │   └── image__logo
        ├── block__body
        │   └── text__text
        └── block__footer (grid)
            ├── block__name-wrapper
            │   ├── text-basic__name
            │   └── text-basic__title
            └── image__avatar (circular)
```

## Key Global Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `testimonial-section-oscar` | Section wrapper | Row gap, custom width var |
| `fr-intro-alpha` | Frames intro section | Centered text, responsive align |
| `fr-intro-alpha__heading` | Main heading | Line-height 1.1, 15ch width |
| `fr-accent-heading` | Small label | Uppercase, letter-spaced, `-1` order |
| `fr-lede` | Intro paragraph | Frames standard lede |
| `testimonial-grid-oscar` | Card grid container | 2-col grid, semantic ul |
| `testimonial-card-oscar` | Individual card | Flex column, card vars, padding |
| `__header` | Logo section | (no special settings) |
| `__logo` | Company logo | 150px width |
| `__body` | Text content | (container) |
| `__text` | Testimonial text | Card text size var |
| `__footer` | Name + avatar row | Grid: 1fr auto |
| `__name-wrapper` | Name/title container | (container) |
| `__name` | Person name | Bold (700) |
| `__title` | Person title | Small text |
| `__avatar` | Person image | Circular, 75px, 1:1 ratio |

## ACSS Variables Used

| Variable | Usage | Count |
|----------|-------|-------|
| `var(--container-gap)` | Section row gap | 1x |
| `var(--content-gap)` | Intro row gap, card gap | 3x |
| `var(--grid-2)` | 2-column grid | 1x |
| `var(--grid-1)` | 1-column grid (mobile) | 2x |
| `var(--grid-gap)` | Grid spacing | 1x |
| `var(--space-l)` | Card padding | 1x |
| `var(--card-radius)` | Card border radius | 1x |
| `var(--radius)` | Fallback radius | 1x |
| `var(--card-background)` | Card bg color | 1x |
| `var(--neutral-ultra-light)` | Fallback bg | 1x |
| `var(--text-s)` | Small text | 3x |
| `var(--h1)` | Heading (mobile) | 1x |

### Card-Scoped CSS Variables
```css
.testimonial-card-oscar {
  --card-avatar-size: 75px;
  --card-gap: var(--content-gap);
  --card-padding: var(--space-l);
}

.testimonial-section-oscar {
  --content-width: 960px;
}
```

## Layout Configuration

### Desktop (Default)
- **Grid:** 2 columns (`var(--grid-2)`)
- **Gap:** `var(--grid-gap)`
- **Intro:** Center-aligned text
- **Cards:** Flex column layout

### Mobile (`:mobile_landscape`)
- **Grid:** 1 column (`var(--grid-1)`)
- **Intro:** Left-aligned text
- **Heading:** Larger font size (`var(--h1)`)

## BEM Naming Pattern

**Blocks:**
- `testimonial-section-oscar` - Main section
- `testimonial-grid-oscar` - Card container
- `testimonial-card-oscar` - Individual card
- `fr-intro-alpha` - Frames intro pattern

**Elements:**
- Card: `__header`, `__logo`, `__body`, `__text`, `__footer`, `__name-wrapper`, `__name`, `__title`, `__avatar`
- Intro: `__heading`, `__accent-heading`, `__lede`

**No modifiers used**

## Anti-Patterns Detected

✅ **Avoided:**
- All elements have global classes
- Proper responsive breakpoints
- Semantic HTML (`<ul>`, `<li>`)
- ACSS variables for spacing/colors
- Consistent BEM naming

⚠️ **Minor Issues:**
- Tailwind utility classes embedded in text content (not in Bricks settings)
- HTML in text fields has inline classes
- Could extract text styling to global classes instead

**Example of embedded classes:**
```html
<div class="text-[15px] leading-6 text-neutral-500 ...">
  <p>Testimonial text here</p>
</div>
```

**Should be:**
- Remove wrapper div
- Style via `testimonial-card-oscar__text` global class
- Use ACSS variables instead of Tailwind classes

## Key Techniques

### 1. Card-Scoped CSS Variables
```json
{
  "_cssCustom": ".testimonial-card-oscar {\n  --card-avatar-size: 75px;\n  --card-gap: var(--content-gap);\n  --card-padding: var(--space-l);\n}"
}
```

Allows easy customization without editing global classes.

### 2. Semantic List Structure
```json
{
  "name": "container",
  "settings": {"tag": "ul"},
  "children": [
    {"name": "div", "settings": {"tag": "li"}}
  ]
}
```

Proper `<ul>` and `<li>` tags for accessibility.

### 3. Footer Grid Pattern
```json
{
  "_display": "grid",
  "_gridTemplateColumns": "var(--grid-1) auto",
  "_alignItemsGrid": "center"
}
```

Name/title on left (fluid width), avatar on right (auto width).

### 4. Frames Intro Pattern Integration
Uses Frames library classes for consistent intro sections:
- `fr-intro-alpha` - Container
- `fr-accent-heading` - Small uppercase label (with negative order)
- `fr-lede` - Intro paragraph

### 5. Circular Avatar with CSS
```json
{
  "_border": {
    "radius": {
      "top": "var(--card-avatar-size, 50vw)",
      "right": "var(--card-avatar-size, 50vw)",
      "left": "var(--card-avatar-size, 50vw)",
      "bottom": "var(--card-avatar-size, 50vw)"
    }
  },
  "_width": "var(--card-avatar-size)",
  "_aspectRatio": "var(--card-avatar-aspect-ratio, 1)"
}
```

Large border-radius value creates perfect circle.

## Related Patterns

- **Card Grid Pattern** - Similar 2-column responsive grid
- **Frames Intro Pattern** - Standard section header
- **Meta Information Blocks** - Name + title + avatar pattern
- **Logo Grid** - Could adapt for logo showcase

## Variations

Based on naming ("Oscar"), likely part of a series:
- **Oscar Pattern** - This version (grid with intro)
- Other patterns may exist (Alpha, Beta, etc.)

## Example JSON Structure

```json
{
  "content": [
    {
      "id": "section",
      "name": "section",
      "children": ["intro", "grid"],
      "settings": {
        "_cssGlobalClasses": ["testimonial-section-oscar"]
      }
    },
    {
      "id": "grid",
      "name": "container",
      "children": ["card-1", "card-2", "card-3", "card-4"],
      "settings": {
        "_cssGlobalClasses": ["testimonial-grid-oscar"],
        "tag": "ul"
      }
    },
    {
      "id": "card-1",
      "name": "div",
      "children": ["header", "body", "footer"],
      "settings": {
        "_cssGlobalClasses": ["testimonial-card-oscar"],
        "tag": "li"
      }
    }
  ],
  "globalClasses": [
    {
      "name": "testimonial-grid-oscar",
      "settings": {
        "_display": "grid",
        "_gridTemplateColumns": "var(--grid-2)",
        "_gridTemplateColumns:mobile_landscape": "var(--grid-1)",
        "_gridGap": "var(--grid-gap)"
      }
    },
    {
      "name": "testimonial-card-oscar",
      "settings": {
        "_display": "flex",
        "_direction": "column",
        "_rowGap": "var(--card-gap)",
        "_padding": {"top": "var(--card-padding)"}
      }
    }
  ]
}
```

## Implementation Checklist

When using this pattern:
- [ ] Update component prefix (change `testimonial-card-oscar` to your naming)
- [ ] Replace placeholder company logos
- [ ] Update testimonial text content
- [ ] Replace placeholder avatars with real images
- [ ] Update names and titles
- [ ] Adjust card count (currently 4, can be any number)
- [ ] Customize card variables (`--card-avatar-size`, `--card-padding`)
- [ ] Clean up embedded Tailwind classes in text content
- [ ] Test responsive behavior
- [ ] Verify grid layout on different screen sizes

## Quality Metrics

- **BEM Compliance:** 100%
- **ACSS Compliance:** 95% (minor text content issues)
- **Responsive:** Yes (1 breakpoint)
- **Semantic HTML:** Yes (`<ul>`, `<li>`)
- **Labeled Elements:** 100%
- **Framework Integration:** Frames library
- **Reusability:** High
- **Complexity:** Low-Medium
- **Overall Score:** 92/100

## Frames Library Integration

This component uses Frames library patterns:
- `fr-intro-alpha` - Standard intro section
- `fr-accent-heading` - Uppercase label
- `fr-lede` - Intro paragraph
- `acss_import_fr-lede` - ACSS import reference

**Benefits:**
- Consistent styling across Frames components
- Pre-designed responsive behavior
- Typography hierarchy established
- Easy to integrate with other Frames patterns

---

**Pattern extracted from professional Frames-based template.** Ready for reuse in testimonial, review, and social proof sections.

## Improvements for Future Use

1. **Remove Tailwind classes** from text content
2. **Extract text styling** to global classes
3. **Add star rating option** (optional element in header)
4. **Add quote icon** (optional decorative element)
5. **Add card hover effects** (optional enhancement)
6. **Consider masonry layout** for varied text lengths
