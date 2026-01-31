# Zod Record Schema Requires Two Arguments

**Extracted:** 2026-01-29
**Context:** TypeScript compilation error when using Zod validation schemas

## Problem

TypeScript error: "Expected 2-3 arguments, but got 1" when using `z.record()` in a Zod schema:

```typescript
const schema = z.object({
  config: z.record(z.unknown()).optional(),  // ❌ ERROR
});
```

**Error message:**
```
Type error: Expected 2-3 arguments, but got 1.
  config: z.record(z.unknown()).optional(),
          ^
```

## Solution

Zod's `record()` function requires **both key and value types**, not just the value type:

```typescript
const schema = z.object({
  config: z.record(z.string(), z.unknown()).optional(),  // ✅ CORRECT
});
```

## Explanation

- `z.record(valueType)` - **WRONG** (only value type)
- `z.record(keyType, valueType)` - **CORRECT** (key and value types)

The key type is typically `z.string()` for object properties, but could be other types depending on your use case.

## Example

```typescript
import { z } from "zod";

// Wrong - Missing key type
const badSchema = z.object({
  metadata: z.record(z.unknown()).optional(),
});

// Correct - Includes key type
const goodSchema = z.object({
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// More specific typing
const specificSchema = z.object({
  settings: z.record(z.string(), z.number()).optional(),
});
```

## When to Use

- Any time you see the TypeScript error: "Expected 2-3 arguments, but got 1" on a `z.record()` call
- When creating Zod schemas for objects with dynamic keys
- When validating configuration objects, metadata, or settings with arbitrary properties

## Related Patterns

- For simple string-to-string mappings: `z.record(z.string(), z.string())`
- For string-to-number mappings: `z.record(z.string(), z.number())`
- For string-to-any mappings: `z.record(z.string(), z.unknown())`
- For string-to-typed-object mappings: `z.record(z.string(), z.object({...}))`
