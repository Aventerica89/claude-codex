# React useCallback Declaration Order

**Extracted:** 2026-02-19
**Context:** React components with useCallback + useEffect — TypeScript strict mode

## Problem

A `useEffect` that lists a `useCallback` in its dependency array must be declared **after** the callback in the component body. Unlike regular `function` declarations (which are hoisted), `const` callbacks are not. TypeScript will error with:

```
Block-scoped variable 'callbackName' used before its declaration.ts(2448)
```

This is easy to miss because:
- The function *looks* defined in the file
- React hook rules don't warn about ordering between hooks
- The error only appears at compile time, not runtime

## Solution

Always declare callbacks **before** the useEffect that depends on them:

```typescript
// CORRECT: callback before effect
const loadFilesForComponent = useCallback(async (file: string) => {
  // ... fetch logic
}, [editingSiteId]);

const handleChange = useCallback((val: string) => {
  // ... depends on loadFilesForComponent
  saveFile(astroFile, val);
}, [saveFile, astroFile]);

// useEffect comes AFTER all callbacks it depends on
useEffect(() => {
  if (codeMode && selectedComponent?.file) {
    loadFilesForComponent(selectedComponent.file);  // works - declared above
  }
}, [codeMode, selectedComponent?.file, loadFilesForComponent]);
```

```typescript
// WRONG: useEffect before callback
useEffect(() => {
  loadFilesForComponent(file);  // TS error: used before declaration
}, [codeMode, loadFilesForComponent]);

const loadFilesForComponent = useCallback(async (file: string) => {
  // ...
}, [editingSiteId]);  // too late
```

## When to Use

- When adding new `useCallback` helpers to a component that already has `useEffect` hooks
- When refactoring: moving callbacks to different positions in a component
- When a plan places helpers after business logic (handleSubmit etc.) but effects are higher up
- **Red flag phrase:** "Block-scoped variable used before its declaration" in TSC output

## Ordering Pattern for Complex Components

```
1. State declarations (useState, useRef)
2. Simple (non-dependent) useCallbacks
3. Dependent useCallbacks (that depend on #2)
4. useEffects (depend on #2 and #3)
5. Event handlers / complex callbacks (handleSubmit, etc.)
6. return (...)
```
