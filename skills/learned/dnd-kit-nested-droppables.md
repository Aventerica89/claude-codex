# @dnd-kit Nested Droppables Collision Fix

**Extracted:** 2026-01-31
**Context:** Using @dnd-kit with nested drop zones where different drag types should target different zones

## Problem

When you have nested droppables (e.g., a `MonitorDropZone` containing `WorkspaceCard` components that are also droppables), the `closestCenter` collision detection finds the inner droppables instead of the outer container.

Example scenario:
- Outer zone: `MonitorDropZone` (id: `monitor:1`) - should receive workspace drags
- Inner zones: `WorkspaceCard` (id: `1`, `2`, etc.) - should receive window drags
- When dragging a workspace, it drops on a WorkspaceCard instead of the MonitorDropZone

The `handleDragEnd` logic fails because:
```typescript
// This check fails - overId is "1" not "monitor:1"
if (activeId.startsWith('ws:') && overId.startsWith('monitor:')) {
  // Never reached!
}
```

## Solution

Disable inner droppables when the drag type doesn't apply to them. Use the `disabled` prop on `useDroppable`:

```typescript
// In the inner droppable component
const { setNodeRef, isOver } = useDroppable({
  id: workspace,
  disabled: isDropDisabled,  // Disable when workspace is being dragged
})
```

Pass the drag state down from the parent:

```typescript
// In parent with DndContext
const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null)

// Pass to children
<WorkspaceCard
  isDropDisabled={activeDrag?.type === 'workspace'}
  // ... other props
/>
```

## Alternative Solutions

1. **Custom collision detection**: Write a custom collision function that filters droppables by type based on what's being dragged

2. **ID prefixing with filtering**: Prefix all droppable IDs and filter in handleDragEnd:
   ```typescript
   // workspace: -> workspace droppable
   // monitor: -> monitor droppable
   // window: -> window being dragged
   ```

3. **Separate DndContexts**: Use different DndContext providers for different drag-drop interactions (more complex)

## When to Use

- Using @dnd-kit with nested droppable zones
- Different drag types should target different levels of nesting
- Collision detection picks wrong droppable
- `handleDragEnd` receives unexpected `over.id` values

## Key Insight

The `disabled` prop on `useDroppable` removes the element from collision detection entirely, allowing outer containers to receive drops.
