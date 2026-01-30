# Bricks Builder: Pattern Learning System

**Command:** `/bricks-learn`
**Purpose:** Systematically learn from professional Bricks Builder templates to improve component generation quality

## When to Use

Run `/bricks-learn <template-path>` when you have:
- Professional Bricks Builder templates from Frames, Bricksforge, or other sources
- Working components that follow best practices
- Templates you want to extract reusable patterns from

**Do NOT use for:**
- Broken or incomplete templates
- Templates with known anti-patterns
- Quick prototypes or learning examples

## How It Works

This command guides you through analyzing a Bricks Builder template and extracting reusable patterns.

### Pattern Extraction Workflow

1. **Load Template** - Read and parse JSON structure
2. **Structural Analysis** - Analyze element hierarchy and relationships
3. **Global Classes Analysis** - Extract BEM naming patterns and class usage
4. **Layout Detection** - Identify grid/flex patterns and responsive strategies
5. **ACSS Analysis** - Document variable usage and design tokens
6. **Anti-Pattern Check** - Detect quality issues
7. **Pattern Documentation** - Create skill file with extracted patterns
8. **Library Update** - Add to pattern library index

## Usage

```bash
# Learn from a single template
/bricks-learn ~/.claude/projects/bricks-builder/campaigns/smith/sections/gallery-heard-in-every-county.json

# Specify category (helps with organization)
/bricks-learn <template-path> --category footer
/bricks-learn <template-path> --category hero
/bricks-learn <template-path> --category gallery
```

## Analysis Checklist

When analyzing a template, extract:

### 1. Structural Patterns
- [ ] Element hierarchy (parent-child relationships)
- [ ] Nesting depth
- [ ] Component wrapper patterns
- [ ] Container vs content organization

### 2. Global Classes
- [ ] BEM naming convention
- [ ] Class prefix (e.g., `sm-`, `fr-`, `acss-`)
- [ ] Block names
- [ ] Element naming patterns
- [ ] Modifier usage
- [ ] Class-to-element ratio

### 3. Layout Patterns
- [ ] Grid configurations (columns, rows, gaps)
- [ ] Flex patterns (direction, alignment, wrapping)
- [ ] Absolute positioning patterns
- [ ] Responsive breakpoints used
- [ ] Overlay patterns (split backgrounds, absolute containers)

### 4. ACSS Variables
- [ ] Color palette (primary, accent, base, neutral, etc.)
- [ ] Spacing scale (--space-xs to --space-xxxl)
- [ ] Typography scale (--text-xs to --text-xxxl, --h1 to --h6)
- [ ] Border radius values
- [ ] Custom variables

### 5. Component-Specific Patterns
**Footer:**
- Column structure
- Logo placement
- Navigation layout
- Social icons pattern
- Legal links organization

**Hero:**
- Layout type (centered, split, full-width)
- CTA placement
- Media positioning
- Text hierarchy

**Gallery:**
- Grid configuration
- Image aspect ratios
- Asymmetric layouts
- Lightbox/modal integration

**Card:**
- Image placement
- Content hierarchy
- Hover effects
- Grid/flex organization

### 6. Anti-Patterns to Check
- [ ] Missing global classes on elements
- [ ] Hardcoded hex colors (not using ACSS)
- [ ] Hardcoded pixel spacing
- [ ] Hardcoded font sizes
- [ ] Missing responsive breakpoints
- [ ] Inconsistent BEM naming
- [ ] Duplicate class definitions

## Pattern Documentation Template

When creating pattern files, use this structure:

```markdown
# Bricks Builder: [Component Name] Pattern

**Extracted:** [Date]
**Source:** [Template filename]
**Category:** [footer|hero|gallery|card|layout]
**Confidence:** [High|Medium|Low]
**Professional Quality:** [Yes|No]

## Pattern Summary

[2-3 sentence description]

## When to Use

- [Use case 1]
- [Use case 2]
- [Use case 3]

## Structure

```
section.component-name
├── background-elements (if any)
├── container
    └── grid/flex-wrapper
        ├── content-block-1
        └── content-block-2
```

## Key Global Classes

| Class | Purpose | Key Settings |
|-------|---------|--------------|
| `prefix-component` | Section wrapper | Position, padding, background |
| `prefix-component__grid` | Main layout | Grid template, gap |
| `prefix-component__item` | Content block | Typography, spacing |

## ACSS Variables Used

| Variable | Usage | Count |
|----------|-------|-------|
| `var(--space-xl)` | Main gaps | 3x |
| `var(--primary)` | Accent color | 5x |
| `var(--text-m)` | Body text | 8x |

## Layout Configuration

### Desktop
- Grid: [columns] × [rows]
- Gap: [spacing]

### Tablet
- Grid: [columns] × [rows]
- Responsive breakpoint: `:tablet_portrait`

### Mobile
- Grid: [columns] × [rows]
- Responsive breakpoint: `:mobile_portrait`

## BEM Naming Pattern

**Block:** `prefix-component`
**Elements:** `__wrapper`, `__grid`, `__item`, `__title`, etc.
**Modifiers:** `--variant`, `--size-large`, etc.

## Anti-Patterns Avoided

- ✅ All elements have global classes
- ✅ No hardcoded colors
- ✅ No hardcoded spacing
- ✅ Responsive breakpoints included
- ✅ Consistent BEM naming

## Example JSON Structure

[Abbreviated JSON showing key patterns]

## Related Patterns

- [Pattern 1](/path/to/skill.md)
- [Pattern 2](/path/to/skill.md)

## Variations

If multiple versions exist, document evolution:
- v1: [What changed]
- v2: [What improved]
- v3: [Current state]
```

## Storage Locations

Extracted patterns are saved to:

```
~/.claude/skills/learned/bricks-patterns/
├── footers/
│   └── [pattern-name].md
├── heroes/
│   └── [pattern-name].md
├── galleries/
│   └── [pattern-name].md
├── cards/
│   └── [pattern-name].md
└── layouts/
    └── [pattern-name].md
```

Pattern library index:
```
~/.claude/data/bricks-patterns/pattern-library.json
```

## Integration with /bricks Command

After learning patterns, the `/bricks` command will:
1. Auto-detect component type from request/screenshot
2. Load relevant pattern files
3. Suggest patterns: "I've learned 3 footer patterns. Would you like to use one?"
4. Generate JSON matching learned structures

## Guided Analysis Steps

### Step 1: Read Template
```
Read the template file and display summary:
- Total elements: X
- Total global classes: Y
- Component type: [detected]
- Professional quality: [assessment]
```

### Step 2: Analyze Structure
```
Element hierarchy:
section
├── div (bg-left)
├── div (bg-right)
└── container
    └── grid
        ├── photos-grid
        └── content-block

Nesting depth: 4 levels
Wrapper patterns detected: [list]
```

### Step 3: Extract Global Classes
```
Global Classes Analysis:
- Total classes: 12
- BEM compliance: 100%
- Prefix: "sm-gallery"
- Block name: "gallery"
- Elements: __grid, __photos, __photo, __content, __title, __description, __meta
- Modifiers: --tall
- Class-to-element ratio: 0.67 (good)
```

### Step 4: Analyze Layouts
```
Layout Patterns Detected:
1. Nested Grid Pattern
   - Outer: 1.4fr 1fr (2 columns, asymmetric)
   - Inner: 1fr 1fr (photo grid, 2×2)
   - Gap: var(--space-xl) outer, var(--space-m) inner

2. Split Background Pattern
   - Left div: 60% width, var(--base) color
   - Right div: 40% width, var(--white) color
   - Absolute positioning with z-index layering

3. Responsive Strategy
   - Desktop: 2-column grid
   - Tablet: Single column (:tablet_portrait breakpoint)
   - Content-first stacking
```

### Step 5: Check ACSS Usage
```
ACSS Variables:
- Colors: var(--base), var(--white), var(--primary), var(--neutral-dark)
- Spacing: var(--space-xxl), var(--space-xl), var(--space-m), var(--space-s)
- Typography: var(--text-s), var(--text-m), var(--h2)
- Radius: var(--radius-m)

Compliance: 100% (no hardcoded values)
```

### Step 6: Detect Anti-Patterns
```
Anti-Pattern Check:
✅ All elements have global classes
✅ No hardcoded colors found
✅ No hardcoded spacing found
✅ Responsive breakpoints present
✅ Consistent BEM naming
✅ No duplicate class definitions

Quality Score: 95/100 (Professional)
```

### Step 7: Generate Pattern Documentation
```
Pattern Name: "Asymmetric Gallery with Split Background"
Category: gallery
Confidence: High
Professional Quality: Yes

Key Features:
- Nested grid layout (asymmetric outer, symmetric inner)
- Split colored background via absolute positioning
- BEM naming with sm-gallery prefix
- Full ACSS compliance
- Responsive design included

Save to: ~/.claude/skills/learned/bricks-patterns/galleries/gallery-asymmetric-split-bg.md

[Y/n] to save: _
```

### Step 8: Update Pattern Library
```
Updating pattern library...
✓ Added to pattern-library.json
✓ Pattern ID: gallery-asymmetric-001
✓ Pattern now available to /bricks command

To use this pattern:
- Run /bricks and mention "gallery"
- Or reference directly: /bricks-patterns search "asymmetric"
```

## Pattern Library Structure

Pattern library JSON format:

```json
{
  "version": "1.0.0",
  "last_updated": "2026-01-29",
  "patterns": [
    {
      "id": "gallery-asymmetric-001",
      "name": "Asymmetric Gallery with Split Background",
      "category": "gallery",
      "file": "~/.claude/skills/learned/bricks-patterns/galleries/gallery-asymmetric-split-bg.md",
      "confidence": "high",
      "professional_quality": true,
      "source_template": "gallery-heard-in-every-county.json",
      "extracted_date": "2026-01-29",
      "tags": ["grid", "split-background", "nested", "asymmetric", "photos"],
      "bem_prefix": "sm-gallery",
      "total_elements": 23,
      "total_classes": 12,
      "quality_score": 95,
      "acss_compliance": 100,
      "responsive": true
    }
  ]
}
```

## Anti-Patterns Database

Anti-patterns JSON format:

```json
{
  "version": "1.0.0",
  "anti_patterns": [
    {
      "id": "no-global-class",
      "severity": "critical",
      "description": "Element missing _cssGlobalClasses",
      "detection": "element.settings._cssGlobalClasses == undefined",
      "fix": "Add BEM-named global class to element",
      "example": "_cssGlobalClasses: ['component__element']"
    },
    {
      "id": "hardcoded-color",
      "severity": "high",
      "description": "Color not using ACSS variable",
      "detection": "/#[0-9a-fA-F]{3,8}/ in color settings",
      "fix": "Replace with ACSS variable",
      "example": "color: {raw: 'var(--primary)'}"
    },
    {
      "id": "hardcoded-spacing",
      "severity": "high",
      "description": "Spacing value not using ACSS variable",
      "detection": "/\\d+px/ in padding/margin/gap",
      "fix": "Replace with ACSS spacing variable",
      "example": "padding: {top: 'var(--space-m)'}"
    }
  ]
}
```

## Success Metrics

Pattern extraction is successful when:
- ✅ Pattern documentation is complete
- ✅ All key settings are documented
- ✅ BEM naming patterns are clear
- ✅ Layout configurations are detailed
- ✅ ACSS variables are catalogued
- ✅ Anti-patterns are checked
- ✅ Pattern is added to library
- ✅ Pattern is usable by /bricks command

## Example Usage Session

```
User: /bricks-learn ~/.claude/projects/bricks-builder/campaigns/smith/sections/gallery-heard-in-every-county.json

Claude:
Reading template...
✓ Loaded: gallery-heard-in-every-county.json
✓ Valid JSON structure
✓ 23 elements, 12 global classes detected

Analyzing structure...
Component type: Gallery
Pattern detected: Asymmetric grid with split background
Nesting depth: 4 levels
Professional quality: Yes (100% BEM compliance, 100% ACSS compliance)

Global Classes:
- Prefix: "sm-gallery"
- Block: "gallery"
- Elements: grid, photos, photo, content, title, description, meta, meta-item
- Modifiers: photo--tall
- All elements properly classed ✓

Layout Patterns:
1. Nested Grid (confidence: high)
   - Outer: 1.4fr 1fr asymmetric
   - Inner: 2×2 photo grid

2. Split Background (confidence: high)
   - Absolute positioned divs
   - 60/40 split, layered with z-index

ACSS Variables:
- 15 unique variables
- Colors: --base, --white, --primary, --neutral-dark
- Spacing: --space-xxl, --space-xl, --space-m, --space-s, --space-xs
- Typography: --text-s, --text-m, --h2
- 100% compliance ✓

Anti-Pattern Check:
✅ No issues found
Quality score: 95/100

Pattern Name: "Asymmetric Gallery with Split Background"
Category: gallery
Confidence: High

Save pattern to bricks-patterns/galleries/gallery-asymmetric-split-bg.md? [Y/n]

User: Y

Claude:
✓ Pattern saved
✓ Pattern library updated
✓ Pattern now available to /bricks command

Pattern ID: gallery-asymmetric-001
File: ~/.claude/skills/learned/bricks-patterns/galleries/gallery-asymmetric-split-bg.md

Next steps:
- Run /bricks-learn on more templates to build library
- Use /bricks-patterns search "gallery" to find this pattern
- Run /bricks and mention "gallery" to auto-load this pattern
```

---

**Environment loaded.** Ready to learn from professional Bricks Builder templates.

Use `/bricks-learn <template-path>` to begin pattern extraction.
