# Bricks Builder Development Environment

**Command:** `/bricks`
**Purpose:** Load Bricks Builder context, patterns, and reference materials for component development

## When to Use

Run `/bricks` at the start of any session involving:
- Creating Bricks Builder components
- Converting designs to Bricks Builder JSON
- Debugging "paste unidentified" errors
- Working on WordPress + ACSS + Bricks projects

## What This Skill Loads

### 1. Core Patterns
This skill activates knowledge of:
- **Validation Checklist** (`~/.claude/skills/learned/bricks-builder-json-checklist.md`)
  - Top-level structure requirements
  - ACSS variable usage
  - Layout property validation
  - Common error fixes

- **Global Classes Pattern** (`~/.claude/skills/learned/bricks-builder-global-classes-pattern.md`)
  - Professional-grade component structure
  - BEM naming conventions
  - Semantic HTML with custom tags
  - Accessibility patterns

### 2. Reference Examples
Project location: `~/.claude/projects/bricks-builder/`

**Smith Campaign Components:**
- `campaigns/smith/sections/footer-bernadette-smith.json` - Inline styles approach
- `campaigns/smith/sections/gallery-heard-in-every-county.json` - Global Classes approach (reference example)

### 3. ACSS Settings
- `campaigns/smith/acss-settings.json` - Full ACSS configuration
- `campaigns/smith/acss-active-settings.json` - Active settings only

## Development Approach

### For Learning/Quick Projects (Inline Styles)
```json
{
  "id": "element",
  "settings": {
    "_display": "flex",
    "_padding": {"top": "var(--spacing-m)"},
    "_typography": {
      "color": {"raw": "var(--primary)"}
    }
  }
}
```

**Use when:**
- Rapid prototyping
- Learning Bricks Builder
- One-off components
- Simple landing pages

### For Production (Global Classes)
```json
{
  "id": "element",
  "settings": {
    "_cssGlobalClasses": ["fr-footer-delta__nav"]
  }
}

// Styles in globalClasses array
"globalClasses": [{
  "name": "fr-footer-delta__nav",
  "settings": {
    "_display": "flex",
    "_padding": {"top": "var(--spacing-m)"}
  }
}]
```

**Use when:**
- Production websites
- Reusable components
- Design systems
- Multi-page sites
- Client projects

## Quick Reference Commands

### Validation
```bash
# Find hardcoded font sizes
grep -n '"fontSize"' file.json | grep -v "var("

# Find hardcoded colors
grep -n '"hex"' file.json

# Verify layout direction
jq '.content[] | select(.id == "element-id") | .settings._flexDirection' file.json

# Validate with project script
node ~/.claude/projects/bricks-builder/scripts/validate-bricks-json.js file.json
```

### Structure Checks
```bash
# Verify top-level structure
jq 'keys' file.json
# Should show: ["content", "source", "sourceUrl", "version"]

# Count elements
jq '.content | length' file.json

# List all element IDs
jq '.content[].id' file.json

# Check for missing labels
jq '.content[] | select(.label == null) | .id' file.json
```

## Pre-Paste Checklist

Before pasting into Bricks Builder:

**Structure:**
- [ ] Has top-level wrapper with `content`, `source`, `sourceUrl`, `version`
- [ ] All elements have `id`, `name`, `parent`, `children`, `settings`, `label`
- [ ] Parent-child relationships are valid

**ACSS Variables:**
- [ ] Colors use `"raw": "var(--variable-name)"`
- [ ] Spacing uses `var(--spacing-*)`
- [ ] Typography uses `var(--text-*)`
- [ ] No hardcoded hex values
- [ ] No hardcoded pixel values

**Layout:**
- [ ] `_flexDirection` correct (`row` = horizontal, `column` = vertical)
- [ ] `_justifyContent` and `_alignItems` appropriate
- [ ] Containers have max-width and auto margins
- [ ] Gap uses ACSS variables

## Common ACSS Variables

### Colors
```
var(--primary)          # Brand red
var(--accent)           # Gold/yellow
var(--white)            # White
var(--gray-50)          # Lightest gray
var(--gray-100)         # Very light gray
var(--gray-200)         # Light gray (borders)
var(--gray-300)         # Light gray (borders)
var(--gray-400)         # Medium light gray (dividers)
var(--gray-600)         # Medium gray (text)
var(--gray-700)         # Dark gray (text)
var(--gray-800)         # Darker gray (headings)
var(--gray-900)         # Darkest gray (headings)
```

### Spacing
```
var(--spacing-xs)       # Extra small
var(--spacing-s)        # Small
var(--spacing-m)        # Medium
var(--spacing-l)        # Large
var(--spacing-xl)       # Extra large
var(--spacing-xxl)      # 2x extra large
var(--spacing-xxxl)     # 3x extra large
```

### Typography
```
var(--text-xs)          # Extra small text
var(--text-s)           # Small text
var(--text-m)           # Medium text (base)
var(--text-l)           # Large text
var(--text-xl)          # Extra large text
var(--text-xxl)         # 2x extra large
var(--text-xxxl)        # 3x extra large
var(--text-xxxxl)       # 4x extra large (hero)
```

### Border Radius
```
var(--radius-none)      # 0px (sharp)
var(--radius-s)         # Small radius
var(--radius-m)         # Medium radius
var(--radius-l)         # Large radius
var(--radius-full)      # 50% (circular)
```

## Workflow

### 1. Starting a New Component
```
1. /bricks                          # Load this skill
2. Analyze design/screenshot
3. Choose approach (inline vs global classes)
4. Create JSON structure
5. Run validation checks
6. Paste into Bricks Builder
```

### 2. Fixing "Paste Unidentified" Error
```
1. Check top-level structure (content, source, sourceUrl, version)
2. Validate element structure (id, name, parent, children, settings, label)
3. Verify ACSS variable syntax ("raw": "var(--name)")
4. Test paste again
```

### 3. Converting Design to Component
```
1. Identify sections (header, main, footer)
2. Map visual hierarchy to parent-child relationships
3. Extract colors, spacing, typography
4. Map to ACSS variables
5. Create JSON structure
6. Validate before pasting
```

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "paste unidentified" | Missing wrapper or wrong structure | Add `content`, `source`, `sourceUrl`, `version` |
| Vertical instead of horizontal | `_flexDirection: "column"` | Change to `_flexDirection: "row"` |
| Colors not matching | Hardcoded hex values | Use `"raw": "var(--primary)"` |
| Inconsistent spacing | Hardcoded pixel values | Use `var(--spacing-*)` |
| Missing elements | Forgot to add to parent's `children` | Update parent's `children` array |

## Best Practices

1. **Always use ACSS variables** - No hardcoded values
2. **Label everything** - Descriptive labels for easy identification
3. **Validate before pasting** - Run checks to catch errors early
4. **Use semantic HTML** - Consider custom tags (nav, ul, li, article)
5. **Plan parent-child relationships** - Sketch hierarchy first
6. **Start simple** - Inline styles for learning, global classes for production
7. **Reference examples** - Study working components in the project
8. **Document patterns** - Use `/learn` to capture reusable patterns

## Output Format

When creating components, follow this structure:

```json
{
  "content": [
    {
      "id": "unique-id",
      "name": "section|div|container|text-basic|button|icon",
      "parent": 0,
      "children": ["child-1", "child-2"],
      "settings": {
        // Inline styles OR _cssGlobalClasses reference
      },
      "label": "Descriptive Label"
    }
  ],
  "source": "bricksCopiedElements",
  "sourceUrl": "https://example.com",
  "version": "2.1.4",
  "globalClasses": [
    // Optional: for production components
  ]
}
```

## Success Criteria

Component is ready when:
- ✅ Passes validation checks
- ✅ Uses ACSS variables consistently
- ✅ Has proper structure with labels
- ✅ Layout properties match design
- ✅ Pastes into Bricks Builder without errors
- ✅ Renders correctly in preview

## Pattern Library System

### Learning from Professional Templates

Use `/bricks-learn <template-path>` to extract patterns from professional templates.

**Pattern storage:**
```
~/.claude/skills/learned/bricks-patterns/
├── footers/
├── heroes/
├── galleries/
├── cards/
└── layouts/
```

**Pattern database:**
```
~/.claude/data/bricks-patterns/pattern-library.json
~/.claude/data/bricks-patterns/anti-patterns.json
```

### Using Learned Patterns

When creating components, I will:
1. **Auto-detect** component type from request/screenshot
2. **Load relevant patterns** from pattern library
3. **Suggest patterns**: "I've learned 3 footer patterns. Which would you like?"
4. **Generate JSON** matching learned structures

### Pattern Commands

```bash
/bricks-learn <template-path>      # Learn from template
/bricks-patterns list              # List all patterns
/bricks-patterns search <query>    # Search patterns
```

### Building the Pattern Library

To improve component generation quality:
1. Feed me professional Bricks Builder templates
2. I'll extract reusable patterns systematically
3. Patterns become available for future components
4. Quality improves with each template learned

**Recommended:** Start with 5-10 professional templates from Frames, Bricksforge, or other sources to build a solid pattern library.

---

**Environment loaded.** Ready for Bricks Builder component development.

Use validation commands and reference materials as needed. Ask questions if clarification needed on any pattern or approach.
