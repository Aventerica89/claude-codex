# dnd-kit Sortable List Pattern

## Problem
Implementing drag-and-drop list reordering in React with @dnd-kit requires careful handling of sortable items, drag handles, and state mutations.

## Context
Renvio Companion App uses @dnd-kit/sortable for DnD checklists with JSON import/export using Zod validation. Pattern applies to lists where items can be reordered.

## Solution

### 1. **Basic Setup**
```typescript
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
```

### 2. **Parent Container**
```typescript
export function ChecklistContainer({ items, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  function handleDragEnd(event) {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(i => i.id === active.id)
      const newIndex = items.findIndex(i => i.id === over.id)

      // Use arrayMove for immutable reordering
      const newItems = arrayMove(items, oldIndex, newIndex)
      onReorder(newItems)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {items.map(item => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
```

### 3. **Individual Sortable Item**
```typescript
function SortableItem({ item }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div ref={setNodeRef} style={style} className="item">
      {/* Separate drag handle from clickable content */}
      <button
        {...attributes}
        {...listeners}
        className="drag-handle"
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>

      {/* Content remains clickable without triggering drag */}
      <input
        type="checkbox"
        defaultChecked={item.checked}
        onClick={e => e.stopPropagation()}
      />
      <span>{item.label}</span>
    </div>
  )
}
```

### 4. **Key Patterns**

#### Use arrayMove for Immutability
```typescript
// CORRECT: Immutable reordering
const newItems = arrayMove(items, oldIndex, newIndex)
onReorder(newItems)

// WRONG: Mutation
items.splice(oldIndex, 1)
items.splice(newIndex, 0, draggedItem)
```

#### Separate Drag Handle from Content
```typescript
// CORRECT: Drag handle separate
<button {...listeners} {...attributes}>⋮⋮</button>
<input onClick={e => e.stopPropagation()} />

// WRONG: Drag listeners on clickable content
<input {...listeners} {...attributes} />
```

#### Use restrictToVerticalAxis for Vertical Lists
```typescript
<DndContext
  modifiers={[restrictToVerticalAxis]}
  // ... other props
>
```

### 5. **With Zod Validation**
```typescript
const ChecklistSchema = z.object({
  id: z.string(),
  items: z.array(z.object({
    id: z.string(),
    label: z.string(),
    checked: z.boolean()
  }))
})

function importFromJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    const validated = ChecklistSchema.parse(data)
    onReorder(validated.items)
  } catch (error) {
    console.error('Invalid JSON:', error)
  }
}
```

## Checklist
- [ ] Parent uses DndContext with appropriate sensors
- [ ] SortableContext wraps all sortable items with strategy
- [ ] useSortable called per item with unique id
- [ ] arrayMove used for immutable reordering
- [ ] Drag handle listeners separate from clickable content
- [ ] restrictToVerticalAxis applied for vertical lists
- [ ] CSS.Transform.toString() used for transform style
- [ ] Zod validation applied to import/export JSON

## Common Issues

### Drag listeners fire clicks on content
**Fix:** Stop propagation on content clickables
```typescript
<input onClick={e => e.stopPropagation()} />
```

### Items jump during drag
**Fix:** Ensure useSortable hook dependencies correct, verify transform style applied

### Drag stops working after reorder
**Fix:** Verify SortableContext items array updated with new order

## Related Skills
- dnd-kit-nested-droppables.md (for nested lists)
- zod-record-two-arguments.md (validation)

## References
- [@dnd-kit/sortable docs](https://docs.dndkit.com/presets/sortable)
- [@dnd-kit/core docs](https://docs.dndkit.com)
