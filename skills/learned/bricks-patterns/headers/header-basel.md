# Bricks Builder: Header Basel (Complete Navigation System)

**Extracted:** 2026-01-29
**Source:** medsparanker.com
**Category:** headers
**Confidence:** High
**Professional Quality:** Yes (96/100 score - Enterprise-grade navigation system)

## Pattern Summary

A complete, production-ready header and navigation system featuring multiple dropdown types (Mega Menu with 3-column grid, icon-based dropdowns with descriptions, simple text dropdowns), responsive mobile menu with full-screen slide-in animation, custom JavaScript for state management and height calculations, and extensive CSS variable theming. Includes logo visibility toggling, back button navigation, smooth transitions, and data-attribute-based state control. Built on Bricks nav-nested element with Frames library patterns.

## When to Use

- Professional websites requiring comprehensive navigation
- Sites with multiple navigation patterns (mega menus, icon dropdowns, simple dropdowns)
- Projects needing mobile-first responsive header
- Applications requiring custom navigation behaviors
- Sites with complex menu hierarchies
- Projects requiring extensive header customization via CSS variables
- Themes needing reusable navigation components
- Enterprise-level applications with polished UX

## Structure

```
div.fr-header-basel
├── nav-nested.header-basel-nav (Bricks navnested element)
│   ├── div.header-basel-nav__logo-wrapper [data-logo attribute]
│   │   └── image.header-basel-nav__logo (dynamic site_url link)
│   ├── text-link.header-basel-nav__back-button [data-back-button attribute]
│   │   └── "go back" text + arrow icon
│   ├── ul.header-basel-nav__list (nav items)
│   │   ├── dropdown.fr-mm-alpha (Mega Menu Alpha - Features)
│   │   │   └── div.fr-mm-alpha__content (3-col grid)
│   │   │       └── div.fr-mm-alpha__column × 3
│   │   │           ├── text-basic.fr-mm-alpha__heading ("Feature")
│   │   │           └── ul.fr-mm-alpha__list
│   │   │               └── li.fr-mm-alpha__list-item × 5
│   │   │                   └── text-link.fr-mm-alpha__link
│   │   ├── dropdown.fr-dropdown-bravo (Services - Icon Dropdown)
│   │   │   └── ul.fr-dropdown-bravo__list
│   │   │       └── li.fr-dropdown-bravo__list-item + focus-parent × 2
│   │   │           ├── div.fr-dropdown-bravo__content-wrapper
│   │   │           │   ├── text-link + clickable-parent ("Dropdown link 1")
│   │   │           │   └── text-basic__description
│   │   │           └── div.fr-dropdown-bravo__icon-wrapper
│   │   │               └── icon (package/crown SVG)
│   │   ├── li.header-basel-nav__list-item
│   │   │   └── text-link.header-basel-nav__link ("About us")
│   │   ├── dropdown.fr-dropdown-alpha (Company - Simple Dropdown)
│   │   │   └── ul.fr-dropdown-alpha__list
│   │   │       └── li.fr-dropdown-alpha__list-item × 3
│   │   │           └── text-link.fr-dropdown-alpha__link
│   │   └── li.header-basel-nav__list-item
│   │       └── button.header-basel-nav__cta ("Contact us")
│   └── fr-trigger.header-basel-nav__trigger (hamburger menu)
└── code (JavaScript)
    ├── Nav height calculation → --nav-height CSS variable
    ├── Logo/back button visibility toggling
    ├── Dropdown state management
    └── Mobile menu interactions
```

## Key Global Classes

### Main Header Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-header-basel` | Root wrapper | Extensive CSS vars, border, padding, bg |
| `header-basel-nav` | Nav element | Gap, desktop/mobile styling |
| `header-basel-nav__logo-wrapper` | Logo container | 3.5rem size, data-logo attribute |
| `header-basel-nav__logo` | Logo image | 100% size, site_url dynamic link |
| `header-basel-nav__back-button` | Mobile back button | data-back-button attribute, absolute position |
| `header-basel-nav__list` | Nav items container | Fit-content width, whitespace nowrap |
| `header-basel-nav__list-item` | Regular nav item | — |
| `header-basel-nav__link` | Regular nav link | — |
| `header-basel-nav__cta` | CTA button | Focus color |
| `header-basel-nav__trigger` | Hamburger menu | Frames fr-trigger, hidden on desktop |

### Mega Menu Alpha Classes (Frames)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-mm-alpha` | Mega menu dropdown | Focus color, dropdown content styling |
| `fr-mm-alpha__content` | 3-col grid container | Grid-3 → Grid-1 mobile, grid gap |
| `fr-mm-alpha__column` | Individual column | Row gap, padding |
| `fr-mm-alpha__heading` | Column heading | H3 size, ::after border, inline padding |
| `fr-mm-alpha__list` | Link list (ul) | No bullets, flex column, gap |
| `fr-mm-alpha__list-item` | List item (li) | — |
| `fr-mm-alpha__link` | Link (a) | Padding, bg, hover states, border |

### Dropdown Bravo Classes (Frames)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-dropdown-bravo` | Icon dropdown | Icon CSS vars, min-inline-size |
| `fr-dropdown-bravo__list` | Dropdown list (ul) | — |
| `fr-dropdown-bravo__list-item` + `focus-parent` | List item (li) | Flex, width 100%, gap, relative position |
| `fr-dropdown-bravo__content-wrapper` | Text container | — |
| `fr-dropdown-bravo__link` + `clickable-parent` | Link (a) | Makes parent clickable |
| `fr-dropdown-bravo__description` | Description text | Text-s, opacity .6 |
| `fr-dropdown-bravo__icon-wrapper` | Icon container | Order -1, bg, border-radius, transition |
| `fr-dropdown-bravo__icon` | Icon | — |

### Dropdown Alpha Classes (Frames)

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `fr-dropdown-alpha` | Simple dropdown | Focus color, whitespace nowrap |
| `fr-dropdown-alpha__list` | Dropdown list (ul) | — |
| `fr-dropdown-alpha__list-item` | List item (li) | — |
| `fr-dropdown-alpha__link` | Link (a) | Padding, bg, hover states |

## CSS Variables (Extensive Theming System)

### Header General

```css
.fr-header-basel {
  --header-border: .5em;
  --header-bg: var(--neutral-ultra-dark);
  --text-color: var(--text-light);
  --mm-text-color: var(--text-dark); /* Mega Menu text */
}
```

### Desktop Nav Styling

```css
/* General */
--nav-link-color: var(--text-light-muted);
--nav-item-background-color: transparent;
--nav-item-border-color: transparent;
--nav-item-block-padding: .75em;
--nav-item-inline-padding: 1em;
--nav-item-border-radius: var(--radius);
--nav-gap: var(--space-xs);

/* Hover */
--nav-link-hover-color: var(--text-light);
--nav-item-background-hover-color: var(--white-trans-10);
--nav-item-border-hover-color: var(--white-trans-10);

/* Active */
--nav-link-active-color: var(--text-light);
--nav-item-background-active-color: transparent;
--nav-item-border-active-color: var(--white-trans-10);

/* Icon */
--nav-icon-color: var(--nav-link-color);
--nav-icon-color-hover: var(--nav-link-hover-color);
--nav-icon-size: 1em;
```

### Dropdown/Mega Menu Styling

```css
--dd-bg-color: var(--white);
--dd-color: var(--text-dark-muted);
--dd-color-hover: var(--text-dark);
--dd-link-background-color: transparent;
--dd-link-background-hover-color: var(--neutral-ultra-light);
--dd-link-color: var(--text-dark-muted);
--dd-link-color-hover: var(--text-dark);
--dd-link-block-padding: .5em;
--dd-link-inline-padding: var(--space-s);
--dd-content-padding: var(--space-xs);
--dd-gap: var(--content-gap);
--dd-item-gap: var(--space-xs);

/* Icon (Dropdown Bravo) */
--dd-icon-color: var(--text-dark-muted);
--dd-icon-color-hover: var(--text-dark);
--dd-icon-bg-color: var(--neutral-trans-10);
--dd-icon-bg-color-hover: var(--neutral-trans-20);

/* Border */
--dd-box-shadow: var(--box-shadow-m);
--dd-min-inline-size: 200px;
--dd-border-width: 0;
--dd-border-radius: var(--radius);
--dd-border-color: var(--neutral-trans-10);

/* Animation */
--dd-slide-in-open: 0, 10px;
--dd-slide-in-closed: 0, 20px;
```

### Mobile Styling

```css
--m-nav-gap: 1em;
--m-nav-bg: var(--bg-dark);
--m-nav-item-block-padding: .75em;
--m-nav-item-inline-padding: 1em;
--m-nav-item-text-color: var(--text-light);
--m-nav-item-background-color: var(--black-trans-20);
--m-nav-item-border-radius: var(--radius);
--m-button-width: fit-content;
--m-icon-rotation: -90deg;
```

## JavaScript Functionality

### 1. Navigation Height Calculation

```javascript
function updateNavHeight() {
    const header = document.getElementById('brx-header');
    if (header) {
        requestAnimationFrame(() => {
            const height = header.offsetHeight;
            document.documentElement.style.setProperty('--nav-height', `${height}px`);
        });
    }
}
```

**Triggers:**
- DOMContentLoaded
- window.load
- window.resize (debounced)
- Image/font loading
- MutationObserver (header changes)

**Purpose:** Sets `--nav-height` CSS variable for accurate positioning of mobile menu.

### 2. Logo/Back Button Visibility Toggle

```javascript
document.addEventListener('click', (event) => {
    const target = event.target.closest('li[data-script-id].brxe-dropdown');
    if (!target) return;

    const isOpen = target.classList.contains('open') && target.classList.contains('active');

    if (!isOpen) {
        domElements.logo?.setAttribute('data-logo', 'hidden');
        domElements.customButton?.setAttribute('data-back-button', 'visible');
        domElements.navList?.classList.add('dropdown-open');
    }
});
```

**Behavior:**
- When mega menu/dropdown opens on mobile: Hide logo, show back button
- When back button clicked: Show logo, hide back button, close dropdown
- CSS transitions handle animations via `[data-logo]` and `[data-back-button]` attributes

### 3. Mobile Menu State Management

```javascript
if (domElements.mainNav) {
    new MutationObserver(() => {
        if (!domElements.mainNav.classList.contains('brx-open')) {
            domElements.logo?.setAttribute('data-logo', 'visible');
            domElements.customButton?.setAttribute('data-back-button', 'hidden');
            domElements.navList?.classList.remove('dropdown-open');
        }
    }).observe(domElements.mainNav, {
        attributes: true,
        attributeFilter: ['class']
    });
}
```

**Purpose:** Resets UI state when mobile menu closes.

## Layout Configuration

### Desktop (Default)

**Header:**
- Horizontal nav with logo left, items center, hamburger hidden
- Items have padding, hover backgrounds, borders

**Mega Menu Alpha:**
- 3-column grid
- Columns have headings with bottom border (::after)
- Each column has 5 link items

**Dropdown Bravo:**
- Min 200px wide
- Icon left, content right
- Icon has background color

**Dropdown Alpha:**
- Simple link list
- Min 200px wide

### Mobile (`:mobile_landscape` and below)

**Header:**
- Hamburger menu visible (top right)
- Logo visible by default

**Mobile Menu Open:**
- Full-screen overlay (100dvh height)
- Nav items stack vertically
- Logo can hide when dropdown opens
- Back button appears (absolute positioned, top left)
- Dropdown content slides in from right (100% width)
- Nav items behind dropdown fade out (opacity 0, translateX -100%)

**Mega Menu Alpha (Mobile):**
- 1-column layout (columns stack)

**Dropdown Bravo (Mobile):**
- Same as desktop (icon + content)

## Key Techniques

### 1. Data-Attribute State Management

```css
[data-logo="visible"],
[data-back-button="visible"] {
  opacity: 1;
  transform: translateX(0);
}

[data-logo="hidden"] {
  opacity: 0;
  transform: translateX(-100%);
}

[data-back-button="hidden"] {
  opacity: 0;
  transform: translateX(100%);
  pointer-events: none;
}
```

Smooth transitions controlled by data attributes, set via JavaScript.

### 2. Mobile Dropdown Slide-In

```css
.brx-open .brxe-dropdown>.brx-dropdown-content {
  transform: translateX(100%); /* Hidden off-screen right */
  opacity: 0;
  visibility: visible;
}

.brx-open .brxe-dropdown.open>.brx-dropdown-content {
  transform: translateX(0); /* Slide in from right */
  opacity: 1;
}
```

Full-screen dropdown slides in from right when opened on mobile.

### 3. Nav Items Fade Out When Dropdown Open

```css
.brx-open .brx-nav-nested-items.dropdown-open .brx-submenu-toggle,
.brx-open .brx-nav-nested-items.dropdown-open > li > a {
  opacity: 0;
  transform: translateX(-100%);
}
```

When dropdown opens, main nav items slide left and fade, revealing dropdown content.

### 4. Dynamic Nav Height with CSS Variable

JavaScript calculates header height and sets `--nav-height` variable, used for mobile menu positioning:

```css
.brx-open ul.brx-nav-nested-items {
  padding-block-start: calc(var(--nav-height, 100px) + var(--wp-admin--admin-bar--height, 0px));
}
```

Accounts for WordPress admin bar if present.

### 5. Mega Menu Heading with Bottom Border

```css
.fr-mm-alpha__heading::after {
  content: '';
  position: absolute;
  inset-inline: 0;
  inset-block-end: calc(var(--dd-gap) * -.5);
  height: 1px;
  width: 100%;
  background-color: var(--dd-border-color);
}
```

Pseudo-element creates separator between heading and links.

### 6. Clickable-Parent Pattern

```html
<li class="fr-dropdown-bravo__list-item focus-parent">
  <div>
    <a class="clickable-parent">Link</a>
    <p>Description</p>
  </div>
  <div>Icon</div>
</li>
```

ACSS `clickable-parent` makes entire `<li>` clickable via `<a>` link. `focus-parent` extends focus states to parent.

### 7. Icon Wrapper with Background Transition

```css
.fr-dropdown-bravo__icon-wrapper {
  background: var(--item-icon-bg);
  transition: var(--transition);
}

.fr-dropdown-bravo__list-item:hover .fr-dropdown-bravo__icon-wrapper {
  background: var(--item-icon-bg-hover);
}
```

Icon background changes on parent hover for visual feedback.

### 8. Responsive Grid Transformation

```css
.fr-mm-alpha__content {
  display: grid;
  grid-template-columns: var(--grid-3);
}

.brx-open .fr-mm-alpha__content {
  grid-template-columns: var(--grid-1);
}
```

Mega menu columns collapse on mobile when menu is open.

## Related Patterns

- **Frames Mega Menu Alpha** - 3-column feature list
- **Frames Dropdown Bravo** - Icon-based dropdown with descriptions
- **Frames Dropdown Alpha** - Simple text dropdown
- **Frames Trigger** - Hamburger menu button
- **Bricks nav-nested** - Native Bricks navigation element
- **ACSS Clickable Parent** - Makes parent element clickable
- **ACSS Focus Parent** - Extends focus to parent

## Implementation Checklist

When using this pattern:
- [ ] Update `fr-header-basel` prefix if needed
- [ ] Replace logo image with your brand logo
- [ ] Update logo alt text (`{site_title} Logo`)
- [ ] Configure Mega Menu Alpha:
  - [ ] Update column headings (3 columns: "Feature")
  - [ ] Update links in each column (5 per column)
  - [ ] Adjust column count if needed (change `--grid-3`)
- [ ] Configure Dropdown Bravo (Services):
  - [ ] Update dropdown trigger text ("Services")
  - [ ] Update list items (2 items: links + descriptions)
  - [ ] Replace icons (package, crown SVG)
  - [ ] Add/remove items as needed
- [ ] Configure regular nav links:
  - [ ] Update "About us" link text and URL
- [ ] Configure Dropdown Alpha (Company):
  - [ ] Update dropdown trigger text ("Company")
  - [ ] Update links (3 items: About, Team, Locations)
- [ ] Configure CTA button:
  - [ ] Update button text ("Contact us")
  - [ ] Update button link URL
  - [ ] Adjust button style if needed
- [ ] Test mobile menu:
  - [ ] Verify hamburger opens/closes menu
  - [ ] Verify logo hides when dropdown opens
  - [ ] Verify back button appears and works
  - [ ] Test all dropdown patterns on mobile
- [ ] Customize CSS variables:
  - [ ] Header background (`--header-bg`)
  - [ ] Nav link colors (`--nav-link-color`, `--nav-link-hover-color`)
  - [ ] Dropdown backgrounds (`--dd-bg-color`)
  - [ ] Mobile colors (`--m-nav-bg`, `--m-nav-item-text-color`)
- [ ] Test JavaScript functionality:
  - [ ] Verify nav height calculation works
  - [ ] Check logo/back button toggling
  - [ ] Test state resets when menu closes
- [ ] Verify on multiple breakpoints
- [ ] Test with WordPress admin bar (if applicable)
- [ ] Ensure Frames library is loaded
- [ ] Verify ACSS imports work (`clickable-parent`, `focus-parent`)

## Quality Metrics

- **BEM Compliance:** 100%
- **ACSS Compliance:** 95%
- **Responsive:** Yes (mobile_landscape breakpoint)
- **Semantic HTML:** Yes (`<nav>`, `<ul>`, `<li>`, `<a>`, `<button>`)
- **Labeled Elements:** 100%
- **Framework Integration:** Frames library + Bricks nav-nested + ACSS
- **Accessibility:** High (ARIA labels, semantic tags, focus states)
- **JavaScript:** Yes (200+ lines for state management, height calc)
- **Reusability:** High (modular dropdown patterns)
- **Complexity:** Very High (100+ elements, 34 classes, 3 dropdown types, mobile system)
- **Overall Score:** 96/100

## Frames Library Dependencies

This component requires:
- **Bricks nav-nested element** (native Bricks)
- **Frames library** with:
  - `fr-mm-alpha` - Mega Menu Alpha (3-column grid)
  - `fr-dropdown-bravo` - Icon dropdown with descriptions
  - `fr-dropdown-alpha` - Simple text dropdown
  - `fr-trigger` - Hamburger menu button
- **ACSS imports:**
  - `clickable-parent` - Makes parent element clickable
  - `focus-parent` - Extends focus states to parent

**Installation:** Ensure Frames library and ACSS are loaded.

## Accessibility Features

1. **Semantic HTML:**
   - `<nav>` element with Bricks nav-nested
   - `<ul>` and `<li>` for all menus
   - `<button>` for CTA and hamburger

2. **ARIA Labels:**
   - Hamburger: `ariaLabel: "Toggle Menu"`
   - Back button: `role="button"`

3. **Keyboard Navigation:**
   - All links and buttons are keyboard accessible
   - Focus states via ACSS `focus-parent`

4. **Screen Reader Friendly:**
   - Logo has alt text using dynamic `{site_title}`
   - Back button has visible text ("go back")

5. **Visual Feedback:**
   - Hover states on all interactive elements
   - Active page styling (`aria-current="page"`)
   - Focus indicators

## Responsive Strategy

**2-Tier Responsive:**
1. **Desktop:** Horizontal nav with multiple dropdown types, logo left
2. **Mobile (mobile_landscape):** Full-screen slide-in menu, hamburger visible, dropdowns become full-screen overlays

**Breakpoint:** Single breakpoint at `mobile_landscape` for simplified mobile experience.

## Performance Considerations

1. **JavaScript Optimization:**
   - Debounced resize handler (100ms delay)
   - requestAnimationFrame for accurate measurements
   - Event delegation for dropdown clicks

2. **CSS Optimization:**
   - Uses `transform` for animations (GPU-accelerated)
   - Minimal repaints with opacity/transform transitions

3. **MutationObserver:**
   - Efficient attribute watching
   - Only observes necessary elements

4. **Image Loading:**
   - Logo uses `loading="eager"` (above fold)
   - JavaScript watches image load for height recalc

---

**Pattern extracted from professional Frames-based header system.** Ready for reuse as a complete, production-ready navigation solution with multiple dropdown patterns, mobile menu, and extensive customization options.

## Advanced Customization

### Adding a New Dropdown Type

1. Duplicate existing dropdown (Alpha, Bravo, or MM Alpha)
2. Update BEM naming (`fr-dropdown-charlie`)
3. Customize CSS variables for unique styling
4. Add/remove elements as needed

### Changing Column Count (Mega Menu)

```css
.fr-mm-alpha__content {
  grid-template-columns: var(--grid-4); /* 4 columns */
}
```

Update `--grid-4` to `--grid-2`, `--grid-5`, etc.

### Custom Mobile Menu Width

```css
@media (max-width: 768px) {
  .fr-header-basel {
    width: 100%; /* Full width instead of content-width */
  }
}
```

### Removing JavaScript (Static Sites)

If not using mobile dropdowns or need simpler behavior:
1. Remove `<code>` element with JavaScript
2. Use pure CSS `:hover` for desktop dropdowns
3. Mobile menu will still work via Bricks nav-nested (basic toggle)

### Alternative Layouts

This pattern can be adapted:
- **Logo Center:** Move logo to center, split nav items left/right
- **Full Width:** Remove width constraints for edge-to-edge header
- **Sticky Header:** Add `position: sticky` to `#brx-header`
- **Dropdown Icons:** Add icons to Dropdown Alpha for visual consistency
- **Mega Menu Variations:** Change from 3-column to 2 or 4 columns

## Troubleshooting

### Mobile Menu Not Opening

- Verify `mobileMenu="mobile_landscape"` is set on nav-nested
- Check that fr-trigger is present and visible on mobile
- Ensure JavaScript code element is present

### Nav Height Incorrect

- Verify `#brx-header` ID exists
- Check that JavaScript is executing (no console errors)
- Ensure images have loaded (affects height calculation)

### Back Button Not Appearing

- Verify `data-back-button` attribute exists
- Check JavaScript is toggling attribute correctly
- Ensure CSS transitions are defined

### Dropdowns Not Styling Correctly

- Verify Frames library CSS is loaded
- Check that global classes match pattern documentation
- Ensure CSS variables are defined in root `.fr-header-basel` class
