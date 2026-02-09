# Live Component Previews Pattern

## Context
Building interactive mini-component previews for a marketplace/catalog UI where each card shows a functional demo of the component it represents.

## Problem
Static mockup previews (divs with CSS) don't convey interactivity. Users can't tell if a Switch toggles or a Slider drags from a screenshot-style preview.

## Solution: Three-Tier Preview Architecture

Organize previews by interactivity level:

### Tier 1: Interactive (useState + events)
Components that respond to user input:
- **Switch** - `useState(boolean)` + spring-animated thumb via framer-motion
- **Slider** - `useRef` for track + mouse/touch event handlers for dragging
- **Tabs** - `layoutId` on framer-motion background for smooth tab indicator
- **Checkbox** - Animated checkmark via motion path
- **Select/Dropdown** - `AnimatePresence` for open/close dropdown
- **Accordion** - `AnimatePresence` with height animation
- **Calendar** - Clickable grid of day buttons with selected state
- **Command** - Real `<input>` with filtered list

### Tier 2: Auto-Animated (useEffect/CSS, no interaction)
Components that animate on their own:
- **Progress** - `setInterval` incrementing percentage
- **Skeleton** - CSS `animate-pulse`
- **Shimmer** - CSS `@keyframes` gradient sweep
- **Marquee** - framer-motion `animate={{ x }}` with `repeat: Infinity`
- **Text Generate** - `setInterval` revealing characters
- **Particles** - Multiple `motion.div` with random y positions

### Tier 3: Enhanced Static
Portal-based components (dialog, sheet, popover) rendered in "open" state since they can't float inline.

## Key Patterns

### Event Isolation
Preview interactions must NOT trigger parent card selection:
```tsx
<div
  onClick={(e) => e.stopPropagation()}
  onMouseDown={(e) => e.stopPropagation()}
>
  <LiveComponentPreview componentId={id} size={size} />
</div>
```

### Viewport-Gated Animation
Only animate previews visible on screen to save CPU:
```tsx
const ref = useRef<HTMLDivElement>(null)
const inView = useInView(ref, { once: false, amount: 0.2 })

return (
  <div ref={ref}>
    {inView && <Preview />}
  </div>
)
```

### Size Scaling via Transform
Instead of building separate small/large component variants, scale the same preview:
```tsx
<div className={cn(
  size === 'compact' && 'scale-75',
  size === 'large' && 'scale-110'
)}>
  <Preview />
</div>
```

### Slider Drag Pattern (No Library)
Draggable slider without any drag library:
```tsx
const trackRef = useRef<HTMLDivElement>(null)
const dragging = useRef(false)

const handleMove = (clientX: number) => {
  if (!trackRef.current || !dragging.current) return
  const rect = trackRef.current.getBoundingClientRect()
  const pct = Math.max(0, Math.min(100,
    ((clientX - rect.left) / rect.width) * 100
  ))
  setValue(Math.round(pct))
}

// Attach mouseup/mousemove/touchend/touchmove to window
// onMouseDown on track sets dragging.current = true
```

## Card Size Toggle Pattern

Three-density grid toggle (compact/normal/large):
```tsx
const GRID_CLASSES: Record<CardSize, string> = {
  compact: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6',
  normal: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  large: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
}

const PREVIEW_HEIGHT: Record<CardSize, string> = {
  compact: 'h-14',
  normal: 'h-24',
  large: 'h-44',
}
```

Compact mode hides descriptions and metadata. Large mode shows full dependencies.

## File Organization
- `LiveComponentPreviews.tsx` - Single file with all previews + PREVIEW_MAP lookup
- `CardSizeToggle.tsx` - Standalone toggle component
- Each preview is a small function component (10-30 lines)
- Export single `LiveComponentPreview` that looks up by componentId

## When to Use
- Component library showcases / marketplaces
- Design system documentation
- Any catalog UI where static thumbnails feel lifeless

## Dependencies
- React (useState, useEffect, useRef)
- framer-motion (motion, AnimatePresence, useInView, layoutId)
- Tailwind CSS
- Zero new packages needed
