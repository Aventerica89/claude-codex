# Bricks Builder: Pricing Section Delta

**Extracted:** 2026-01-29
**Source:** medsparanker.com
**Category:** pricing
**Confidence:** High
**Professional Quality:** Yes (94/100 score - Comprehensive pricing + testimonials with 5 Frames patterns)

## Pattern Summary

A comprehensive pricing section combining multiple Frames library patterns: 2-column grid with content/features on left and pricing cards on right, followed by testimonial cards below. Includes checkmark list (List Alpha), rating badges (Badge Alpha), horizontal pricing cards (Price Card Delta), star ratings (Rating Alpha), and testimonial cards (Testimonial Card Alpha). Features data-attribute-based rating systems, clickable cards with hover effects, and full responsive layouts.

## When to Use

- SaaS pricing pages with features and social proof
- Service pricing with testimonials
- Product pricing with trust signals
- Landing pages combining pricing and testimonials
- Pages requiring rating badges (Google, Yelp, etc.)
- Multi-tier pricing presentations
- Pricing sections needing checkmark feature lists
- Testimonials with star ratings

## Structure

```
section.fr-pricing-section-delta
├── container.fr-pricing-grid-delta (2-col: content | pricing)
│   ├── block.fr-pricing-grid-delta__content-wrapper
│   │   ├── heading.fr-pricing-grid-delta__heading (h2)
│   │   ├── text-basic.fr-pricing-grid-delta__lede + fr-lede
│   │   ├── ul.fr-list-alpha (Frames checkmark list)
│   │   │   └── li.fr-list-alpha__li × 5
│   │   │       ├── icon.fr-list-alpha__icon (checkmark)
│   │   │       └── text-basic.fr-list-alpha__text
│   │   └── div.fr-badge-group-alpha
│   │       └── div.fr-badge-alpha × 2 (rating badges)
│   │           ├── div.fr-badge-alpha__icon-wrapper [data-badge-value]
│   │           │   └── icon.fr-badge-alpha__icon (star)
│   │           └── text-basic.fr-badge-alpha__label ("on Google/Yelp")
│   └── ul.fr-pricing-grid-delta__cards-wrapper + list--none
│       └── li.fr-price-card-delta × 3
│           ├── block.fr-price-card-delta__main
│           │   ├── heading.fr-price-card-delta__heading + clickable-parent
│           │   └── text-basic.fr-price-card-delta__description
│           └── block.fr-price-card-delta__price-wrapper
│               ├── text-basic.fr-price-card-delta__price ("<sup>$</sup>49")
│               └── text-basic.fr-price-card-delta__price-term ("per month")
└── ul.fr-testimonial-section-alpha__grid + list--none (3-col testimonials)
    └── li.fr-testimonial-card-alpha × 3
        ├── span.fr-rating-alpha [data-rating="4.5"]
        │   ├── icon.fr-rating-alpha__icon-half (half star - conditional)
        │   └── icon.fr-rating-alpha__icon × 5 (full stars - CSS hides extras)
        ├── block.fr-testimonial-card-alpha__body
        │   ├── text-basic.fr-testimonial-card-alpha__callout (bold excerpt)
        │   └── text-basic.fr-testimonial-card-alpha__quote (blockquote)
        └── block.fr-testimonial-card-alpha__footer
            ├── block.fr-testimonial-card-alpha__name-wrapper
            │   ├── text-basic.fr-testimonial-card-alpha__name
            │   └── text-basic.fr-testimonial-card-alpha__title
            └── image.fr-testimonial-card-alpha__avatar (circular)
```

## Key Global Classes

### Main Section Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-pricing-section-delta` | Root section | Row gap (container-gap) |
| `fr-pricing-grid-delta` | 2-column grid container | Grid-2 → Grid-1 responsive |
| `fr-pricing-grid-delta__content-wrapper` | Left column content | Width-m max, content gap |
| `fr-pricing-grid-delta__heading` | Main h2 heading | — |
| `fr-pricing-grid-delta__lede` | Lede text | — |

### List Alpha (Frames Pattern)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-list-alpha` | Checkmark list (ul) | Flex column, no bullets, .5em gap |
| `fr-list-alpha__li` | List item (li) | 2-col grid (icon | text), align start |
| `fr-list-alpha__icon` | Checkmark icon | — |
| `fr-list-alpha__text` | Item text | Span tag |

### Badge Alpha (Frames Pattern)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-badge-group-alpha` | Badge container | Flex row, wraps to column mobile |
| `fr-badge-alpha` | Individual badge | Flex, icon + label, CSS vars for styling |
| `fr-badge-alpha__icon-wrapper` | Icon + rating wrapper | ::after shows data-badge-value |
| `fr-badge-alpha__icon` | Star icon | — |
| `fr-badge-alpha__label` | Text label ("on Google") | — |

### Price Card Delta (Frames Pattern)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-pricing-grid-delta__cards-wrapper` | Cards container (ul) | Flex column, content gap |
| `fr-price-card-delta` | Pricing card (li) | Flex row, padding, bg-light, hover effect |
| `fr-price-card-delta__main` | Content area (70%) | Row gap |
| `fr-price-card-delta__heading` | Card heading | Clickable-parent link |
| `fr-price-card-delta__description` | Card description | — |
| `fr-price-card-delta__price-wrapper` | Price area (30%) | Flex column, centered, order -1 mobile |
| `fr-price-card-delta__price` | Price text | H1 size, sup for $ symbol |
| `fr-price-card-delta__price-term` | Term text ("per month") | Text-s size |

### Rating Alpha (Frames Pattern)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-rating-alpha` | Star rating container | CSS-based show/hide via data-rating |
| `fr-rating-alpha__icon` | Star icon | Primary color fill |
| `fr-rating-alpha__icon-half` | Half star icon | Shown for .5 ratings |

### Testimonial Card Alpha (Frames Pattern)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-testimonial-section-alpha__grid` | Grid container (ul) | Grid-3 → Grid-1, no bullets |
| `fr-testimonial-card-alpha` | Card (li) | Flex column, card gap, icon CSS vars |
| `fr-testimonial-card-alpha__body` | Quote area | Row gap |
| `fr-testimonial-card-alpha__callout` | Bold excerpt | Font-weight 800 |
| `fr-testimonial-card-alpha__quote` | Full quote (blockquote) | Text-m size |
| `fr-testimonial-card-alpha__footer` | Person info area | Flex row, space-s gap, margin-top auto |
| `fr-testimonial-card-alpha__name-wrapper` | Name + title container | Row gap .25em |
| `fr-testimonial-card-alpha__name` | Person name | Bold, line-height 1.2 |
| `fr-testimonial-card-alpha__title` | Person title | Line-height 1.2 |
| `fr-testimonial-card-alpha__avatar` | Photo | 4.5em circular, aspect-ratio 1, order -1 |

## ACSS Variables Used

| Variable | Usage | Context |
|----------|-------|---------|
| `var(--container-gap)` | Section spacing | Between grid and testimonials |
| `var(--content-gap)` | Content spacing | Within cards, elements |
| `var(--grid-gap)` | Grid gaps | Grid columns |
| `var(--space-s)` | Small spacing | Testimonial footer gap |
| `var(--grid-1)` | 1-column grid | Mobile layouts |
| `var(--grid-2)` | 2-column grid | Pricing grid desktop |
| `var(--grid-3)` | 3-column grid | Testimonials desktop |
| `var(--width-m)` | Medium width constraint | Content wrapper |
| `var(--text-s)` | Small text | Price term |
| `var(--text-m)` | Medium text | Quote text |
| `var(--text-l)` | Large text | Checkmark icon size |
| `var(--h1)` | Largest heading | Price amount |
| `var(--bg-light)` | Light background | Pricing cards |
| `var(--bg-ultra-light)` | Ultra-light bg | Badge icon wrapper |
| `var(--text-dark)` | Dark text | Badge text/icons |
| `var(--primary)` | Primary color | Star rating fill |
| `var(--black)` | Black color | Testimonial icon color |
| `var(--radius)` | Border radius | Cards, badge wrapper |

### Custom CSS Variables (Pattern-Scoped)

**Badge Alpha:**
```css
.fr-badge-alpha {
  --icon-size: 1.5em;
  --icon-fill-color: transparent;
  --icon-stroke-color: var(--text-dark);
  --icon-fill-color-hover: transparent;
  --icon-stroke-color-hover: var(--text-dark);
}
```

**Rating Alpha:**
```css
.fr-rating-alpha {
  --icon-size: 1.25em;
  --icon-fill-color: var(--primary);
  --icon-stroke-color: var(--primary);
  --icon-fill-color-hover: var(--primary);
  --icon-stroke-color-hover: var(--primary);
}
```

**Testimonial Card Alpha:**
```css
.fr-testimonial-card-alpha {
  --icon-size: 1.1em;
  --icon-color: var(--black);
}
```

## Layout Configuration

### Desktop (Default)

**Pricing Grid:**
- 2 columns: Content (left) | Pricing cards (right)
- Content max-width: `var(--width-m)`

**Pricing Cards:**
- Horizontal layout: 70% content | 30% price
- Stacked vertically within column

**Testimonials:**
- 3 columns: `var(--grid-3)`
- Stretch alignment

### Tablet (`:tablet_portrait`)

**Testimonials:**
- 1 column: stacked

### Mobile (`:mobile_landscape`)

**Pricing Grid:**
- 1 column: stacked (content above cards)
- Content width: 100%

**Pricing Cards:**
- Wraps to vertical: Price moves to top via `order: -1`
- Price aligns left instead of center

**Badge Group:**
- Stacks vertically (`:mobile_portrait`)

## BEM Naming Pattern

**Blocks:**
- `fr-pricing-section-delta` - Root section
- `fr-pricing-grid-delta` - Main 2-col grid
- `fr-list-alpha` - Checkmark list (Frames)
- `fr-badge-alpha` - Rating badge (Frames)
- `fr-price-card-delta` - Pricing card (Frames)
- `fr-rating-alpha` - Star rating (Frames)
- `fr-testimonial-card-alpha` - Testimonial (Frames)

**Elements:**
- Pricing Grid: `__content-wrapper`, `__heading`, `__lede`, `__cards-wrapper`
- List Alpha: `__li`, `__icon`, `__text`
- Badge Alpha: `__icon-wrapper`, `__icon`, `__label`
- Price Card: `__main`, `__heading`, `__description`, `__price-wrapper`, `__price`, `__price-term`
- Rating Alpha: `__icon`, `__icon-half`
- Testimonial: `__body`, `__callout`, `__quote`, `__footer`, `__name-wrapper`, `__name`, `__title`, `__avatar`

**No modifiers used** - Single variant pattern

## Anti-Patterns Detected

✅ **Avoided:**
- All elements have global classes (100%)
- High ACSS variable usage (95%)
- Semantic HTML (`<ul>`, `<li>`, `<blockquote>`, `<sup>`)
- Proper ARIA roles (badges use `role="img"` with `aria-label`)
- Consistent BEM naming across 5 patterns
- Pattern-scoped CSS variables
- Extensive Frames library integration

⚠️ **Minor Considerations:**
- Complex CSS logic for star ratings (could be JS-based for flexibility)
- Inline HTML in price (`<sup>$</sup>49`) - acceptable for this use case
- Very comprehensive pattern (150 elements) - consider splitting for reuse

**Overall:** Excellent quality with minimal concerns.

## Key Techniques

### 1. Data-Attribute Rating Badge

**HTML:**
```json
{
  "settings": {
    "_attributes": [
      {"name": "data-badge-value", "value": "4.8"}
    ]
  }
}
```

**CSS:**
```css
.fr-badge-alpha__icon-wrapper::after {
  content: attr(data-badge-value);
  position: relative;
  display: flex;
  color: var(--text-dark);
}
```

Rating value pulled from `data-badge-value` attribute and displayed via `::after` pseudo-element.

### 2. CSS-Based Star Rating System

**HTML:**
```json
{
  "settings": {
    "_attributes": [
      {"name": "data-rating", "value": "4.5"}
    ]
  }
}
```

**CSS Logic:**
```css
/* Hide half star by default */
.fr-rating-alpha > *:first-child {display: none;}

/* Show half star for decimal ratings */
[data-rating*="."] > *:first-child {display: flex;}

/* Hide for .0 ratings */
[data-rating*=".0"] > *:first-child {display: none !important;}

/* Show half star for .5 ratings */
[data-rating*=".5"] > *:first-child {display: flex !important;}

/* Hide stars based on rating */
[data-rating^="1"] > *:nth-child(n+3) {display: none;} /* 1-star: hide 3rd onward */
[data-rating^="2"] > *:nth-child(n+4) {display: none;} /* 2-star: hide 4th onward */
[data-rating^="3"] > *:nth-child(n+5) {display: none;} /* 3-star: hide 5th onward */
[data-rating^="4"] > *:nth-child(n+6) {display: none;} /* 4-star: hide 6th onward */
```

Complex CSS attribute selectors control which stars display based on `data-rating` value. Supports whole numbers and .5 decimals.

### 3. Pricing Card Hover Effect

```css
.fr-price-card-delta {
  _cssTransition: "all .3s ease"
}

.fr-price-card-delta:hover {
  transform: translateX(-.5em);
}
```

Cards slide left slightly on hover for interactive feedback.

### 4. Clickable Parent Card

```json
{
  "name": "heading",
  "settings": {
    "_cssGlobalClasses": ["fr-price-card-delta__heading", "acss_import_clickable-parent"],
    "link": {"type": "external", "url": "#"}
  }
}
```

ACSS `clickable-parent` class makes entire card clickable via heading link.

### 5. Checkmark List Grid Layout

```css
.fr-list-alpha__li {
  _display: "grid",
  _gridTemplateColumns: "auto minmax(0, 1fr)",
  _alignItemsGrid: "flex-start",
  _gridGap: ".5em"
}
```

Grid layout prevents icon from stretching and allows text to wrap naturally. `minmax(0, 1fr)` prevents text overflow.

### 6. Price with Superscript Dollar

```html
<sup>$</sup>49
```

Inline HTML for proper typographic styling of currency symbol at 50% font size.

### 7. Circular Avatar with Aspect Ratio

```css
.fr-testimonial-card-alpha__avatar {
  _width: "4.5em",
  _height: "4.5em",
  _border: {radius: {all: 50%}},
  _aspectRatio: "1",
  _objectFit: "cover",
  _order: "-1"
}
```

Perfect circle using aspect-ratio, object-fit cover for cropping, order -1 to appear before text.

### 8. Auto Margin Footer Alignment

```css
.fr-testimonial-card-alpha__footer {
  _margin: {top: "auto"}
}
```

In flex column layout, `margin-top: auto` pushes footer to bottom of card regardless of quote length.

## Related Patterns

- **List Alpha** (Frames) - Checkmark/icon list
- **Badge Alpha** (Frames) - Rating/trust badges with data-attributes
- **Price Card Delta** (Frames) - Horizontal pricing cards
- **Rating Alpha** (Frames) - Star rating system
- **Testimonial Card Alpha** (Frames) - Complete testimonial card
- **Clickable Parent** (ACSS) - Makes entire parent clickable

## Variations

Based on naming ("Delta" for pricing, "Alpha" for testimonials/badges/list), likely part of series:
- **Pricing Delta** - This horizontal card version
- **Testimonial Alpha** - This complete testimonial version
- **List Alpha** - This icon + text list version
- **Badge Alpha** - This data-attribute badge version
- **Rating Alpha** - This CSS-based star rating version

Other Greek letter variants may exist (Beta, Gamma, Epsilon, etc.)

## Implementation Checklist

When using this pattern:
- [ ] Update section prefix if needed
- [ ] Update main content:
  - [ ] Heading text
  - [ ] Lede text
  - [ ] Checkmark list items (5 items)
- [ ] Configure rating badges:
  - [ ] Update `data-badge-value` attributes (e.g., "4.8")
  - [ ] Update badge labels ("on Google", "on Yelp", etc.)
  - [ ] Replace star icons if needed
- [ ] Update pricing cards (3 cards):
  - [ ] Card headings and links
  - [ ] Card descriptions
  - [ ] Price amounts (update `<sup>$</sup>49` HTML)
  - [ ] Price terms ("per month", "per year", etc.)
- [ ] Update testimonial cards (3 cards):
  - [ ] Update `data-rating` attributes (e.g., "4.5", "5", "3.5")
  - [ ] Callout text (bold excerpt)
  - [ ] Full quote text
  - [ ] Person names
  - [ ] Person titles
  - [ ] Avatar images
- [ ] Test all responsive breakpoints
- [ ] Test hover effects on pricing cards
- [ ] Verify star ratings display correctly (test various values: 1, 1.5, 2, 3.5, 4, 4.5, 5)
- [ ] Test clickable-parent on pricing cards
- [ ] Ensure Frames library patterns are loaded
- [ ] Verify ARIA labels on rating badges

## Quality Metrics

- **BEM Compliance:** 100%
- **ACSS Compliance:** 95%
- **Responsive:** Yes (2 breakpoints: tablet_portrait, mobile_landscape, mobile_portrait)
- **Semantic HTML:** Yes (`<ul>`, `<li>`, `<blockquote>`, `<sup>`)
- **Labeled Elements:** 100%
- **Framework Integration:** Frames library (5 patterns) + ACSS
- **Accessibility:** High (ARIA roles, semantic tags, proper heading hierarchy)
- **Reusability:** High (modular Frames patterns)
- **Complexity:** High (150 elements, 39 classes, 5 integrated patterns)
- **Overall Score:** 94/100

## Frames Library Dependencies

This component requires Frames library with these patterns:
- `fr-list-alpha` - Icon/checkmark list
- `fr-badge-alpha` - Data-attribute rating badges
- `fr-price-card-delta` - Horizontal pricing cards
- `fr-rating-alpha` - CSS-based star rating
- `fr-testimonial-card-alpha` - Complete testimonial cards
- `fr-lede` - Large body text style (ACSS import)

Plus ACSS imports:
- `clickable-parent` - Makes parent element clickable
- `list--none` - Removes list styling

**Installation:** Ensure Frames library CSS is loaded.

## Accessibility Features

1. **ARIA Roles and Labels:**
   - Rating badges: `role="img"` with `aria-label="4.8 out of 5 stars on Google"`
   - Provides screen reader description of visual rating

2. **Semantic HTML:**
   - `<ul>` and `<li>` for all lists
   - `<blockquote>` for testimonial quotes (with custom tag)
   - `<sup>` for currency superscript
   - Proper heading hierarchy (h2 for main, h3 implied for cards)

3. **Visual Feedback:**
   - Hover effects on pricing cards
   - Clickable cards with cursor pointer (via clickable-parent)

4. **Text Alternatives:**
   - Avatar images should have alt text
   - Icon-only elements have accompanying text (badges, list items)

## Responsive Strategy

**3-Tier Responsive:**
1. **Desktop:** 2-col pricing grid, 3-col testimonials, horizontal pricing cards
2. **Tablet:** 1-col testimonials, maintains pricing grid
3. **Mobile:** 1-col everything, pricing cards stack vertically, badges stack

**Breakpoint Strategy:** Uses semantic ACSS grid variables for clean responsive transitions.

## Performance Considerations

1. **Star Rating System:**
   - Pure CSS (no JavaScript)
   - Very performant
   - Limited to whole and .5 ratings (not arbitrary decimals)

2. **Hover Effects:**
   - Uses `transform` (GPU-accelerated)
   - Smooth transitions

3. **Data Attributes:**
   - Badge ratings via `::after` content
   - No JavaScript needed
   - Updateable by changing data attribute value

---

**Pattern extracted from professional Frames-based template.** Ready for reuse in comprehensive pricing sections requiring features, trust signals, pricing tiers, and testimonials with multiple Frames library patterns integrated.

## Advanced Implementation Notes

### Dynamic Star Ratings

To make ratings dynamic (from database/custom fields):

1. Add custom field "rating" to testimonial post type
2. Inject into data attribute:
   ```json
   {
     "_attributes": [
       {"name": "data-rating", "value": "{custom_field_rating}"}
     ]
   }
   ```

### Dynamic Badge Ratings

Same approach for badge values:
```json
{
  "_attributes": [
    {"name": "data-badge-value", "value": "{custom_field_google_rating}"}
  ]
}
```

### Styling Customization

All patterns use CSS variables for easy theming:
- Adjust `--icon-size`, `--icon-color` per pattern
- Override `--primary` for star rating colors
- Override `--bg-light` for pricing card backgrounds

### Alternative Layouts

This pattern can be adapted:
- Remove testimonials section for pricing-only
- Use only testimonial grid for reviews page
- Extract List Alpha for standalone feature lists
- Extract Badge Alpha for trust signal sections
- Extract Price Card Delta for comparison tables

## Common Variations

1. **Add CTA buttons to pricing cards:**
   - Add button wrapper after price-wrapper
   - Use ACSS button classes

2. **Add "Popular" badge to pricing card:**
   - Add absolute positioned badge
   - Use ACSS badge utility classes

3. **Change pricing card to vertical layout:**
   - Remove horizontal flex
   - Stack main and price-wrapper
   - Adjust widths to 100%

4. **Add more testimonials:**
   - Pattern handles any number
   - Grid adapts automatically
   - Consider pagination for 10+

5. **Different rating scales:**
   - 5-star: Current default
   - 10-point: Would need custom CSS logic
   - Percentage: Use badge-alpha pattern instead
