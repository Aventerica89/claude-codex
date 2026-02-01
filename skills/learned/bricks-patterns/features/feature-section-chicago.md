# Bricks Builder: Feature Section Chicago

**Extracted:** 2026-01-29
**Source:** medsparanker.com
**Category:** features
**Confidence:** High
**Professional Quality:** Yes (92/100 score - Alternating feature cards with Frames intro)

## Pattern Summary

A feature section showcasing 3 main features with alternating content/media layout (zigzag pattern). Includes Frames library "Intro Echo" introduction section with accent heading, main heading, and lede text. Each feature card has dark gradient background, heading, description, and dual CTA buttons. Content and media swap sides on alternating cards using :nth-of-type(even) selector.

## When to Use

- Product feature showcases (3 main features)
- Service highlights with detailed descriptions
- Landing page feature sections
- App/software feature presentations
- Side-by-side content and media alternating layouts
- Sections requiring dual CTAs per feature
- Dark-themed feature sections
- Professional service descriptions

## Structure

```
section.feature-section-chicago
├── container.fr-intro-echo (2-col intro)
│   ├── block.fr-intro-echo__heading-wrapper
│   │   ├── heading.fr-intro-echo__heading (h2: "Intro heading")
│   │   └── text-basic.fr-accent-heading + fr-intro-echo__accent-heading ("accent heading")
│   └── block.fr-intro-echo__lede-wrapper
│       └── text-basic.fr-lede + fr-intro-echo__lede (larger body text)
└── container.feature-group-chicago (ul)
    ├── block.feature-card-chicago (li) - Card 1
    │   ├── block.feature-card-chicago__content-wrapper
    │   │   ├── heading.feature-card-chicago__heading (h3)
    │   │   ├── text-basic.feature-card-chicago__description
    │   │   └── block.feature-card-chicago__cta-wrapper
    │   │       ├── button.feature-card-chicago__button + btn--primary-light
    │   │       └── button.feature-card-chicago__button + btn--outline + btn--primary-light
    │   └── block.feature-card-chicago__media-wrapper
    │       └── image.feature-card-chicago__media (figure tag)
    ├── block.feature-card-chicago (li) - Card 2 (FLIPPED via :nth-of-type(even))
    │   └── [same structure, but media appears on left visually]
    └── block.feature-card-chicago (li) - Card 3
        └── [same structure as Card 1]
```

## Key Global Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `feature-section-chicago` | Root section wrapper | Row gap, max width (85% or content-width) |
| `fr-intro-echo` | Frames intro pattern | 2:1 grid (heading:lede), mobile: 1-col |
| `fr-intro-echo__heading-wrapper` | Heading + accent container | Row gap (half content-gap) |
| `fr-intro-echo__heading` | Main h2 heading | text-wrap: balance |
| `fr-accent-heading` | Uppercase accent label | Small, uppercase, letterspacing, order: -1 |
| `fr-intro-echo__accent-heading` | Intro accent variant | — |
| `fr-intro-echo__lede-wrapper` | Lede text container | Row gap |
| `fr-lede` | ACSS lede text style | Larger body text |
| `fr-intro-echo__lede` | Intro lede variant | — |
| `feature-group-chicago` | Card container (ul) | List-style: none, row gap |
| `feature-card-chicago` | Individual feature card | 2-col grid, dark gradient, card padding, alternating |
| `feature-card-chicago__content-wrapper` | Content side | Light text, padding, space-between |
| `feature-card-chicago__heading` | Card h3 heading | H2 font size |
| `feature-card-chicago__description` | Card body text | Muted light text |
| `feature-card-chicago__cta-wrapper` | Button container | Row gap, full-width buttons |
| `feature-card-chicago__button` | CTA button | — |
| `btn--primary-light` | ACSS button variant | Primary light theme |
| `btn--outline` | ACSS button variant | Outline style |
| `feature-card-chicago__media-wrapper` | Media container | — |
| `feature-card-chicago__media` | Image/figure | Radius, shadow, flexGrow: 1 |

## ACSS Variables Used

| Variable | Usage | Context |
|----------|-------|---------|
| `var(--content-width)` | Max width constraint | Section root |
| `var(--container-gap)` | Section vertical spacing | Between intro and cards |
| `var(--content-gap)` | Content vertical spacing | Within cards, between elements |
| `var(--grid-gap)` | Grid gap | Intro Echo grid |
| `var(--grid-2-1)` | 2:1 ratio grid | Intro Echo columns |
| `var(--grid-1)` | 1-column grid | Mobile layouts, media column |
| `var(--text-s)` | Small text | Accent heading |
| `var(--h2)` | Large heading | Card headings |
| `var(--text-light)` | Light text color | Card content |
| `var(--text-light-muted)` | Muted light text | Card descriptions |
| `var(--black)` | Black color | Gradient start |
| `var(--neutral-dark)` | Dark neutral | Gradient end |
| `var(--space-l)` | Large padding | Card content padding (desktop) |
| `var(--space-m)` | Medium padding | Card content padding (tablet) |
| `var(--radius)` | Border radius | Card media, card itself |
| `var(--box-shadow-l)` | Large shadow | Card media |
| `var(--btn-min-width)` | Button min width | Override to 100% in CTA wrapper |

### Custom CSS Variables (Card-Scoped)

```css
.feature-card-chicago {
  --card-padding: 16px;
  --content-column-width: 30ch;
}
```

- `--card-padding`: Internal card padding, used in border-radius calc
- `--content-column-width`: Fixed width for content column (30 characters)

## Layout Configuration

### Desktop (Default)

**Intro Echo:**
- Grid: 2 columns in 2:1 ratio (`var(--grid-2-1)`)
- Column 1 (2 parts): Heading + accent
- Column 2 (1 part): Lede text

**Feature Cards:**
- 2-column grid per card: `30ch` (content) + `1fr` (media)
- **Card 1 (odd):** Content left, media right
- **Card 2 (even):** Media left, content right (via `:nth-of-type(even)`)
- **Card 3 (odd):** Content left, media right
- Dark gradient background (200deg angle)
- Content padding: `var(--space-l)`

### Tablet (`:tablet_portrait`)

**Intro Echo:**
- Remains 2-column

**Feature Cards:**
- Grid: 1 column (stacked)
- Content above, media below
- Content padding: `var(--space-m)` (reduced)

### Mobile (`:mobile_landscape`)

**Intro Echo:**
- Grid: 1 column (`var(--grid-1)`)
- Heading above, lede below

**Feature Cards:**
- Remain 1 column stacked

## BEM Naming Pattern

**Blocks:**
- `feature-section-chicago` - Root section
- `fr-intro-echo` - Frames intro pattern
- `fr-accent-heading` - Frames accent pattern
- `feature-group-chicago` - Card container
- `feature-card-chicago` - Individual card

**Elements:**
- Intro Echo: `__heading-wrapper`, `__heading`, `__accent-heading`, `__lede-wrapper`, `__lede`
- Feature Card: `__content-wrapper`, `__heading`, `__description`, `__cta-wrapper`, `__button`, `__media-wrapper`, `__media`

**No modifiers used** - Single variant pattern

## Anti-Patterns Detected

✅ **Avoided:**
- All elements have global classes (100%)
- High ACSS variable usage (95%)
- Semantic HTML (`<ul>`, `<li>`, `<figure>`)
- Proper responsive breakpoints
- Consistent BEM naming
- Card-scoped CSS variables
- Frames library integration

⚠️ **Minor Considerations:**
- Media query in `_cssCustom` for alternating layout - Could be extracted to stylesheet
- SVG height override in `_cssCustom` - Consider if necessary
- Button width override via CSS instead of global class setting

**Overall:** Excellent quality with minimal anti-patterns.

## Key Techniques

### 1. Alternating Layout with :nth-of-type(even)

```css
@media (min-width: 991px) {
  .feature-card-chicago:nth-of-type(even) {
    grid-template-columns: var(--grid-1) var(--content-column-width);
  }
  .feature-card-chicago:nth-of-type(even) > *:last-child {
    order: -1;
  }
}
```

**Creates zigzag pattern:**
- Odd cards: Content left, media right
- Even cards: Flips grid columns AND moves media to front with `order: -1`

### 2. Frames Intro Echo Pattern

```json
{
  "_cssGlobalClasses": ["fr-intro-echo"],
  "_gridTemplateColumns": "var(--grid-2-1)"
}
```

Professional introduction section with:
- Accent heading (small, uppercase, appears before main heading via `order: -1`)
- Main heading (h2, text-wrap: balance)
- Lede text (larger body copy in separate column)

### 3. Card-Scoped CSS Variables

```css
.feature-card-chicago {
  --card-padding: 16px;
  --content-column-width: 30ch;
  border-radius: calc(var(--radius) + (var(--card-padding) / 2));
}
```

Variables defined on card root, used throughout card context.

### 4. Dark Gradient Card Backgrounds

```json
{
  "_gradient": {
    "colors": [
      {"color": {"raw": "var(--black)"}, "stop": "30"},
      {"color": {"raw": "var(--neutral-dark)"}}
    ],
    "angle": "200"
  }
}
```

Black (30% stop) → neutral-dark gradient at 200-degree angle.

### 5. Dual CTA Full-Width Override

```css
.feature-card-chicago__cta-wrapper > * {
  --btn-min-width: 100%;
}
```

Overrides ACSS button min-width to make both buttons full width within wrapper.

### 6. Text Wrap Balance for Headings

```css
.fr-intro-echo__heading {
  text-wrap: balance;
}
```

Modern CSS property for balanced multi-line headings.

### 7. Accent Heading Pattern

```json
{
  "_cssGlobalClasses": ["fr-accent-heading"],
  "_typography": {
    "text-transform": "uppercase",
    "letter-spacing": ".095em",
    "font-size": "var(--text-s)"
  },
  "_order": "-1"
}
```

Small uppercase label that appears **above** main heading via `order: -1`.

### 8. Section Width Constraint

```css
.feature-section-chicago > * {
  width: max(85%, var(--content-width));
}
```

Children use whichever is larger: 85% of parent or ACSS content-width variable.

## Related Patterns

- **Intro Echo** - Frames library introduction section (accent + heading + lede)
- **Accent Heading** - Frames library uppercase label pattern
- **Alternating Content/Media Layout** - Zigzag/boustrophedon layout
- **Dark Feature Cards** - Cards with gradient backgrounds
- **Dual CTA Pattern** - Primary + secondary action buttons

## Variations

Based on naming ("Chicago"), likely part of a city-themed series:
- **Chicago** - This alternating 3-card version
- Other city patterns may exist (Boston, Denver, Phoenix, etc.)

## Example JSON Structure (Simplified)

```json
{
  "content": [
    {
      "id": "section",
      "name": "section",
      "children": ["intro", "cards"],
      "settings": {
        "_cssGlobalClasses": ["feature-section-chicago"]
      }
    },
    {
      "id": "intro",
      "name": "container",
      "children": ["heading-wrapper", "lede-wrapper"],
      "settings": {
        "_cssGlobalClasses": ["fr-intro-echo"],
        "_display": "grid",
        "_gridTemplateColumns": "var(--grid-2-1)"
      }
    },
    {
      "id": "cards",
      "name": "container",
      "children": ["card-1", "card-2", "card-3"],
      "settings": {
        "_cssGlobalClasses": ["feature-group-chicago"],
        "tag": "ul"
      }
    },
    {
      "id": "card-1",
      "name": "block",
      "children": ["content", "media"],
      "settings": {
        "_cssGlobalClasses": ["feature-card-chicago"],
        "tag": "li",
        "_display": "grid",
        "_gridTemplateColumns": "var(--content-column-width) var(--grid-1)"
      }
    }
  ],
  "globalClasses": [
    {
      "name": "feature-card-chicago",
      "settings": {
        "_display": "grid",
        "_gridTemplateColumns": "var(--content-column-width) var(--grid-1)",
        "_gradient": {
          "colors": [
            {"color": {"raw": "var(--black)"}, "stop": "30"},
            {"color": {"raw": "var(--neutral-dark)"}}
          ],
          "angle": "200"
        },
        "_cssCustom": ".feature-card-chicago {\n  --card-padding: 16px;\n  --content-column-width: 30ch;\n}\n\n@media (min-width: 991px) {\n  .feature-card-chicago:nth-of-type(even) {\n    grid-template-columns: var(--grid-1) var(--content-column-width);\n  }\n  .feature-card-chicago:nth-of-type(even) > *:last-child {\n    order: -1;\n  }\n}"
      }
    }
  ]
}
```

## Implementation Checklist

When using this pattern:
- [ ] Update section prefix (change `feature-section-chicago` to your naming)
- [ ] Update intro content:
  - [ ] Accent heading text
  - [ ] Main h2 heading text
  - [ ] Lede paragraph text
- [ ] Update feature cards (3 cards):
  - [ ] Card 1: Heading, description, button labels, media image
  - [ ] Card 2: Heading, description, button labels, media image
  - [ ] Card 3: Heading, description, button labels, media image
- [ ] Configure button actions/links
- [ ] Replace placeholder images with actual media
- [ ] Adjust `--content-column-width` if needed (default: 30ch)
- [ ] Adjust `--card-padding` if needed (default: 16px)
- [ ] Test alternating layout on desktop (cards should zigzag)
- [ ] Test responsive behavior (tablet: stacked, mobile: intro 1-col)
- [ ] Verify gradient colors match brand
- [ ] Ensure Frames library is loaded (`fr-intro-echo`, `fr-accent-heading`, `fr-lede`)
- [ ] Verify ACSS button variants work (`btn--primary-light`, `btn--outline`)

## Quality Metrics

- **BEM Compliance:** 100%
- **ACSS Compliance:** 95%
- **Responsive:** Yes (2 breakpoints: tablet_portrait, mobile_landscape)
- **Semantic HTML:** Yes (`<ul>`, `<li>`, `<figure>`)
- **Labeled Elements:** 100%
- **Framework Integration:** Frames library + ACSS
- **Accessibility:** Good (semantic HTML, proper heading hierarchy)
- **Reusability:** High (modular intro + cards)
- **Complexity:** Medium (40 elements, 20 classes)
- **Overall Score:** 92/100

## Frames Library Dependencies

This component requires Frames library with:
- `fr-intro-echo` - Introduction section layout
- `fr-accent-heading` - Small uppercase label
- `fr-lede` - Large body copy style
- ACSS imports:
  - `btn--primary-light` - Light primary button
  - `btn--outline` - Outline button style

**Installation:** Ensure Frames library CSS is loaded.

## Accessibility Features

1. **Semantic HTML:**
   - `<ul>` and `<li>` for card list
   - `<figure>` for media elements
   - Proper heading hierarchy (h2 → h3)

2. **Text Wrap Balance:**
   - Improves readability of multi-line headings

3. **Sufficient Contrast:**
   - Light text on dark gradient backgrounds
   - Muted variant for descriptions

## Responsive Strategy

**3-Tier Responsive:**
1. **Desktop (991px+):** Alternating 2-column cards, 2:1 intro grid
2. **Tablet:** Stacked cards (content above media), 2:1 intro grid
3. **Mobile (< mobile_landscape):** Stacked cards, 1-column intro

**Breakpoint Strategy:** Uses min-width media query (991px) for alternating layout desktop-first approach.

## Performance Considerations

1. **Image Optimization:**
   - Ensure media images are optimized
   - Consider lazy loading for cards below fold

2. **Gradient Rendering:**
   - CSS gradient is performant
   - No additional image assets needed

3. **Layout Shift:**
   - Fixed content-column-width (30ch) prevents CLS
   - Aspect ratio for images recommended

---

**Pattern extracted from professional Frames-based template.** Ready for reuse in feature showcase sections requiring alternating content/media layouts with dark-themed cards and dual CTAs.

## Improvements for Future Use

1. **Extract media query to stylesheet:**
   - Move alternating layout CSS from `_cssCustom` to external CSS
   - Improves reusability and maintainability

2. **Add light theme variant:**
   - Create `feature-card-chicago--light` modifier
   - Use light gradient or solid backgrounds

3. **Make card count flexible:**
   - Pattern works with 2, 3, or 4+ cards
   - Alternating pattern continues naturally

4. **Add animation:**
   - Consider fade-in or slide-in on scroll
   - Intersection Observer for progressive reveal

5. **Optimize for 2-card or 4-card layouts:**
   - 2 cards: Both can be aligned same direction
   - 4 cards: Consider 2×2 grid on tablet instead of stack

6. **Video support:**
   - Media wrapper could accept video elements
   - Add play/pause controls if needed
