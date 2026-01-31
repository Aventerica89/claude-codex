# Bricks Builder: Slider Section Indigo

**Extracted:** 2026-01-29
**Source:** medsparanker.com
**Category:** sliders
**Confidence:** High
**Professional Quality:** Yes (90/100 score - Synced slider with navigation thumbnails)

## Pattern Summary

A comprehensive slider/carousel section with synced navigation thumbnails and main content slides. Uses Frames library fr-slider element (Splide.js integration) with WordPress query loops pulling from custom "slider" post type. Features Frames Intro Alpha introduction, thumbnail navigation bar, main 2-column slides (content + image), and custom arrow controls. Navigation and main slider are synchronized via syncId.

## When to Use

- Portfolio/project showcases with thumbnails
- Product showcases with image galleries
- Case study presentations
- Team member profiles with navigation
- Feature highlights with visual content
- Testimonial sliders with thumbnails
- Any content requiring synchronized navigation and main slider
- Content managed via custom post type

## Structure

```
section.fr-slider-section-indigo
├── container.fr-intro-alpha (Frames intro pattern)
│   ├── heading.fr-intro-alpha__heading (h2)
│   ├── text-basic.fr-accent-heading + fr-intro-alpha__accent-heading
│   └── text-basic.fr-lede + fr-intro-alpha__lede
└── container.fr-slider-indigo
    ├── fr-slider.fr-slider-nav-indigo (navigation slider - nav tag)
    │   └── block.fr-slider-nav-indigo__slide (li) - Query Loop: slider CPT
    │       └── text-basic.fr-slider-navigation-indigo__title ({post_title})
    └── div.fr-slider-indigo__content
        ├── fr-slider.fr-slider-main-indigo (main slider)
        │   └── block.fr-slider-main-indigo__slide (li) - Query Loop: slider CPT
        │       ├── div.fr-slider-main-indigo__content-wrapper
        │       │   ├── heading.fr-slider-main-indigo__heading (h2: {post_title})
        │       │   └── text.fr-slider-main-indigo__lede (placeholder text)
        │       └── div.fr-slider-main-indigo__image-wrapper
        │           └── image.fr-slider-main-indigo__image ({featured_image})
        └── fr-slider-controls.fr-slider-controls-indigo (prev/next)
```

## Key Global Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-slider-section-indigo` | Root section | Flex column, container gap |
| `fr-intro-alpha` | Frames intro pattern | Centered text, responsive alignment |
| `fr-intro-alpha__heading` | Main h2 heading | 15ch width, line-height 1.1 |
| `fr-accent-heading` | Frames accent heading | Uppercase, small, order: -1 |
| `fr-intro-alpha__accent-heading` | Intro accent variant | — |
| `fr-lede` | ACSS lede style | Larger body text |
| `fr-intro-alpha__lede` | Intro lede variant | — |
| `fr-slider-indigo` | Slider container | Icon/slide CSS vars, flex column |
| `fr-slider-nav-indigo` | Navigation slider | Slide backgrounds, borders, width-l |
| `fr-slider-nav-indigo__slide` | Nav slide (li) | Button-style padding/borders, cursor pointer |
| `fr-slider-navigation-indigo__title` | Nav slide title | — |
| `fr-slider-indigo__content` | Main content wrapper | Padding, bg color, border radius |
| `fr-slider-main-indigo` | Main slider | Smooth transition timing |
| `fr-slider-main-indigo__slide` | Main slide (li) | 2-col grid, stretch alignment |
| `fr-slider-main-indigo__content-wrapper` | Slide content area | Flex column, content gap |
| `fr-slider-main-indigo__heading` | Slide h2 heading | — |
| `fr-slider-main-indigo__lede` | Slide body text | — |
| `fr-slider-main-indigo__image-wrapper` | Image container | 100% height/width |
| `fr-slider-main-indigo__image` | Slide image | Object-fit cover, 100% size |
| `fr-slider-controls-indigo` | Arrow controls | Circular borders, disabled state |

## ACSS Variables Used

| Variable | Usage | Context |
|----------|-------|---------|
| `var(--container-gap)` | Section vertical spacing | Between intro and slider |
| `var(--content-gap)` | Content vertical spacing | Within slides, elements |
| `var(--grid-gap)` | Grid gap | Main slide 2-col grid |
| `var(--grid-1)` | 1-column grid | Mobile slide layout |
| `var(--grid-2)` | 2-column grid | Desktop slide layout |
| `var(--text-s)` | Small text | Accent heading |
| `var(--h1)` | Large heading | Mobile intro heading |
| `var(--space-l)` | Large padding | Slider content padding |
| `var(--width-l)` | Large width | Nav slider width |
| `var(--neutral)` | Neutral color | Icon color, borders |
| `var(--neutral-light)` | Light neutral | Active slide bg |
| `var(--neutral-ultra-light)` | Ultra-light neutral | Slide bg, borders |
| `var(--neutral-ultra-dark)` | Ultra-dark neutral | Arrow typography |
| `var(--radius)` | Border radius | Content wrapper |
| `var(--btn-padding-block)` | Button vertical padding | Nav slides |
| `var(--btn-padding-inline)` | Button horizontal padding | Nav slides |
| `var(--btn-border-width)` | Button border width | Nav slides, controls |
| `var(--btn-border-radius)` | Button border radius | Nav slides |

### Custom CSS Variables (Slider-Scoped)

```css
.fr-slider-indigo {
  --icon-size: 2em;
  --icon-color: var(--neutral);
  --slide-bg: var(--neutral-ultra-light);
  --active-slide-bg: var(--neutral-light);
}
```

- `--icon-size`: Arrow icon dimensions
- `--icon-color`: Arrow stroke color
- `--slide-bg`: Default slide background
- `--active-slide-bg`: Active/focused slide background

## fr-slider Element Configuration

**Navigation Slider:**
```json
{
  "name": "fr-slider",
  "settings": {
    "height": "50vh",
    "speed": 300,
    "type": "slide",
    "perPage": "2",
    "focus": "1",
    "fixedWidth": "fit-content",
    "gap": "calc(var(--grid-gap)/2)",
    "isSync": true,
    "syncId": "Slider Indigo",
    "isNavigation": true,
    "sliderTag": "nav",
    "listTag": "ul",
    "ariaCarousel": "Carousel",
    "updateOnMove": "afterMove"
  }
}
```

**Main Slider:**
```json
{
  "name": "fr-slider",
  "settings": {
    "height": "50vh",
    "speed": 300,
    "type": "slide",
    "fixedHeight": "auto",
    "gap": "var(--grid-gap)",
    "isSync": true,
    "syncId": "Slider Indigo",
    "sliderTag": "div",
    "listTag": "ul",
    "ariaCarousel": "Carousel"
  }
}
```

**Shared Properties:**
- Both use `syncId: "Slider Indigo"` for synchronization
- Both use `isSync: true`
- Same speed (300ms)
- Same type ("slide")

## Layout Configuration

### Desktop (Default)

**Intro Alpha:**
- Text-align: center
- Heading width: 15ch

**Navigation Slider:**
- 2 slides visible per page (`perPage: "2"`)
- Fixed width per slide: fit-content
- Horizontal scroll with half grid-gap spacing

**Main Slider:**
- Each slide: 2-column grid (content | image)
- Grid gap between columns
- 50vh height constraint

### Mobile (`:mobile_landscape`)

**Intro Alpha:**
- Text-align: left
- Heading font-size: `var(--h1)` (larger)

**Main Slider:**
- 1-column grid (stacked)
- Content above, image below

## BEM Naming Pattern

**Blocks:**
- `fr-slider-section-indigo` - Root section
- `fr-intro-alpha` - Frames intro pattern (imported)
- `fr-slider-indigo` - Slider container
- `fr-slider-nav-indigo` - Navigation slider
- `fr-slider-main-indigo` - Main content slider
- `fr-slider-controls-indigo` - Arrow controls

**Elements:**
- Nav: `__slide`, `__title`
- Main: `__slide`, `__content-wrapper`, `__heading`, `__lede`, `__image-wrapper`, `__image`

**No modifiers used** - Single variant pattern

## Anti-Patterns Detected

✅ **Avoided:**
- All elements have global classes (100%)
- High ACSS variable usage (90%)
- Semantic HTML (`<nav>`, `<ul>`, `<li>`, `<figure>`)
- Proper ARIA labels
- Consistent BEM naming
- Slider-scoped CSS variables
- Frames library integration

⚠️ **Minor Considerations:**
- Uses `!important` in custom CSS (track padding fix, transition timing)
- Query loops require custom post type setup (not portable without CPT)
- Placeholder lede text is hardcoded (should use dynamic data)

**Overall:** Excellent quality with minor portability concerns.

## Key Techniques

### 1. Synced Slider Pattern

**Navigation Slider:**
```json
{
  "isSync": true,
  "syncId": "Slider Indigo",
  "isNavigation": true
}
```

**Main Slider:**
```json
{
  "isSync": true,
  "syncId": "Slider Indigo"
}
```

Both sliders share the same `syncId` and `isSync: true`, creating synchronized behavior. Navigation slider has `isNavigation: true` to indicate it's the thumbnail bar.

### 2. WordPress Query Loop Integration

**Both Navigation and Main slides:**
```json
{
  "hasLoop": true,
  "query": {
    "objectType": "post",
    "post_type": ["slider"]
  }
}
```

Dynamically generates slides from "slider" custom post type. Each slide displays:
- Navigation: `{post_title}`
- Main: `{post_title}`, `{featured_image}`, placeholder text

### 3. Custom Arrow Controls

```json
{
  "name": "fr-slider-controls",
  "settings": {
    "type": "nextPrev",
    "arrows": true,
    "arrowsGap": "var(--space-l)",
    "prevArrow": {
      "library": "svg",
      "svg": { /* SVG icon */ },
      "stroke": {"raw": "var(--icon-color)"},
      "height": "var(--icon-size)",
      "width": "var(--icon-size)"
    },
    "prevArrowAriaLabel": "Previous slide",
    "nextArrow": { /* Same config */ },
    "nextArrowAriaLabel": "Next slide",
    "syncId": "Slider Indigo"
  }
}
```

Custom SVG arrows with:
- Scoped sizing via `--icon-size` variable
- Scoped coloring via `--icon-color` variable
- ARIA labels for accessibility
- Synced with main slider

### 4. Disabled State Styling

```css
.fr-slider-controls-indigo :disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
```

When slider reaches first/last slide, disabled arrow becomes translucent with not-allowed cursor.

### 5. Custom Transition Timing

```css
.fr-slider-main-indigo .fr-slider__list {
  transition: transform .5s cubic-bezier(0.77, 0, 0.175, 1) 0s!important;
}
```

Custom easing function for smooth, professional slide transitions. Overrides default Splide timing with `!important`.

### 6. Focus Fix for Navigation

```css
.fr-slider-nav-indigo .splide__track {
  padding: .35em!important;
}
```

Adds padding to navigation track to prevent focus outline clipping on slides.

### 7. Responsive Intro Pattern

```json
{
  "_typography": {"text-align": "center"},
  "_typography:mobile_landscape": {"text-align": "left"},
  "_alignItems": "center",
  "_alignItems:mobile_landscape": "flex-start"
}
```

Centered on desktop, left-aligned on mobile for better small-screen UX.

### 8. Active Slide Background

```json
{
  "activeBackgroundColor": {"raw": "var(--active-slide-bg)"},
  "slideBackgroundColor": {"raw": "var(--slide-bg)"}
}
```

Navigation thumbnails change background color when active/selected, providing visual feedback.

## Related Patterns

- **Frames Intro Alpha** - Centered introduction pattern
- **Frames fr-slider** - Splide.js slider integration
- **Frames fr-slider-controls** - Custom arrow controls
- **Synced Sliders** - Navigation + main slider synchronization
- **WordPress Query Loops** - Dynamic content generation
- **Custom Post Types** - slider CPT for content management

## Variations

Based on naming ("Indigo"), likely part of a color-themed series:
- **Indigo** - This synced thumbnail + main version
- Other color patterns may exist (Ruby, Emerald, Sapphire, etc.)

## Example JSON Structure (Simplified)

```json
{
  "content": [
    {
      "name": "section",
      "children": ["intro", "slider"],
      "settings": {
        "_cssGlobalClasses": ["fr-slider-section-indigo"]
      }
    },
    {
      "name": "container",
      "children": ["heading", "accent", "lede"],
      "settings": {
        "_cssGlobalClasses": ["fr-intro-alpha"]
      }
    },
    {
      "name": "container",
      "children": ["nav-slider", "content-wrapper"],
      "settings": {
        "_cssGlobalClasses": ["fr-slider-indigo"]
      }
    },
    {
      "name": "fr-slider",
      "children": ["nav-slide-loop"],
      "settings": {
        "_cssGlobalClasses": ["fr-slider-nav-indigo"],
        "isSync": true,
        "syncId": "Slider Indigo",
        "isNavigation": true,
        "perPage": "2"
      }
    },
    {
      "name": "fr-slider",
      "children": ["main-slide-loop"],
      "settings": {
        "_cssGlobalClasses": ["fr-slider-main-indigo"],
        "isSync": true,
        "syncId": "Slider Indigo"
      }
    }
  ]
}
```

## Implementation Checklist

When using this pattern:
- [ ] Create "slider" custom post type (or adjust query to existing CPT)
- [ ] Add slider posts with:
  - [ ] Post title (displays in nav and main slide)
  - [ ] Featured image (displays in main slide)
  - [ ] Optional: Replace placeholder lede text with custom field or excerpt
- [ ] Update section prefix (change `fr-slider-section-indigo` to your naming)
- [ ] Update intro content:
  - [ ] Accent heading text
  - [ ] Main h2 heading text
  - [ ] Lede paragraph text
- [ ] Update syncId if using multiple sliders on same page (avoid conflicts)
- [ ] Replace placeholder lede text with dynamic data:
  - [ ] Use `{post_excerpt}` or custom field
  - [ ] Or keep as static placeholder
- [ ] Adjust slider settings:
  - [ ] perPage (navigation slider visibility)
  - [ ] height (50vh default)
  - [ ] speed (300ms default)
  - [ ] gap (spacing between slides)
- [ ] Upload custom arrow SVG icons (or use defaults)
- [ ] Adjust CSS variables:
  - [ ] `--icon-size` (arrow dimensions)
  - [ ] `--icon-color` (arrow color)
  - [ ] `--slide-bg` (default slide background)
  - [ ] `--active-slide-bg` (active navigation slide)
- [ ] Test synchronization (clicking nav should change main slider)
- [ ] Test responsive behavior (2-col → 1-col on mobile)
- [ ] Test keyboard navigation and ARIA labels
- [ ] Ensure Frames library and Splide.js are loaded

## Quality Metrics

- **BEM Compliance:** 100%
- **ACSS Compliance:** 90%
- **Responsive:** Yes (1 breakpoint: mobile_landscape)
- **Semantic HTML:** Yes (`<nav>`, `<ul>`, `<li>`, `<figure>`)
- **Labeled Elements:** 100%
- **Framework Integration:** Frames library + Splide.js + WordPress
- **Accessibility:** High (ARIA labels, semantic tags, disabled states)
- **Reusability:** Medium (requires custom post type setup)
- **Complexity:** High (20 elements, 21 classes, 2 synced sliders)
- **Overall Score:** 90/100

## Frames Library Dependencies

This component requires:
- **Frames library** with:
  - `fr-intro-alpha` - Centered intro pattern
  - `fr-accent-heading` - Uppercase label
  - `fr-lede` - Large body text
  - `fr-slider` - Splide.js slider element
  - `fr-slider-controls` - Custom arrow controls
- **Splide.js library** (included with Frames fr-slider)
- **Custom Post Type:** "slider" (or adjust query)

**Installation:** Ensure Frames library CSS/JS is loaded.

## WordPress Integration

### Custom Post Type Required

This pattern uses a custom "slider" post type. Register with:

```php
register_post_type('slider', [
  'label' => 'Sliders',
  'public' => true,
  'supports' => ['title', 'thumbnail', 'excerpt'],
  'show_in_rest' => true
]);
```

### Dynamic Data Used

- `{post_title}` - Post title (in nav and main slide heading)
- `{featured_image}` - Featured image (in main slide)
- **Optional:** Replace hardcoded lede with `{post_excerpt}` or custom field

### Query Configuration

```json
{
  "hasLoop": true,
  "query": {
    "objectType": "post",
    "post_type": ["slider"]
  }
}
```

Pulls all posts from "slider" CPT. Can be filtered with:
- Taxonomy filters
- Post count limits
- Custom ordering

## Accessibility Features

1. **ARIA Labels:**
   - Carousel label: `ariaCarousel: "Carousel"`
   - Arrow labels: "Previous slide", "Next slide"

2. **Semantic HTML:**
   - Navigation slider uses `<nav>` tag
   - Both sliders use `<ul>` and `<li>` structure
   - Images use `<figure>` tag

3. **Keyboard Navigation:**
   - Splide.js handles arrow key navigation
   - Tab key cycles through nav slides

4. **Disabled States:**
   - First/last slide arrows are properly disabled
   - Visual feedback via opacity and cursor

## Responsive Strategy

**2-Tier Responsive:**
1. **Desktop:** 2-column main slides, centered intro, 2 nav slides visible
2. **Mobile (< mobile_landscape):** 1-column main slides, left-aligned intro

**Breakpoint:** Single breakpoint at `mobile_landscape` for simplified responsive strategy.

## Performance Considerations

1. **Lazy Loading:**
   - Main slider images use `loading="eager"` (consider lazy for off-screen)
   - Navigation images could be smaller thumbnails

2. **Transition Performance:**
   - Uses `transform` (GPU-accelerated)
   - Custom easing function is smooth

3. **Query Optimization:**
   - Limit query results if many slider posts exist
   - Use appropriate image sizes (not full for thumbnails)

---

**Pattern extracted from professional Frames + Splide.js template.** Ready for reuse in slider sections requiring thumbnail navigation, synchronized content, and WordPress dynamic data integration.

## Improvements for Future Use

1. **Dynamic Lede Content:**
   - Replace hardcoded placeholder with `{post_excerpt}` or custom field
   - Improves content flexibility

2. **Thumbnail Images:**
   - Add thumbnail images to navigation slides (currently text-only)
   - Use smaller image size for performance

3. **Loading Strategy:**
   - Change main slider images to `loading="lazy"` except first slide
   - Improves initial page load

4. **Accessibility Enhancement:**
   - Add live region announcement when slide changes
   - Consider auto-play pause button

5. **Mobile Navigation:**
   - Consider hiding navigation on mobile (main slider only)
   - Or reduce navigation slides to 1 per page on mobile

6. **Content Management:**
   - Add custom fields for lede text instead of placeholder
   - Add slide order meta for manual sorting

7. **Alternative Layouts:**
   - Create vertical layout variant (image above content)
   - Create full-width image variant (content overlay)
