# React Wrapper Component for Hook Access in Free Render Function

**Extracted:** 2026-02-20
**Context:** Any time a free (non-hook) render function needs to call a React hook or access store state

## Problem

A free function (not a React component) renders UI based on data, but one of its branches needs to call a hook (e.g., `useSandboxStore`, `useAuth`, `useContext`). React rules prohibit calling hooks from non-component functions — calling them from inside a switch/if would violate the rules of hooks.

**Concrete example:** `renderPart()` in VaporForge's `MessageContent.tsx` is a free function that switches on `part.type` and `part.name`. The `ask_user_questions` branch needs `sendMessage` from `useSandboxStore`. You can't call the hook inside `renderPart` since it's not a component.

## Solution

Create a small wrapper React component that:
1. Accepts the data (props) it needs from the free function
2. Calls the hook internally
3. Passes the hook result to the real component

The free function renders the wrapper component — the wrapper handles the hook call.

```tsx
// WRONG: Calling hook inside a free function
function renderPart(part: MessagePart, index: number) {
  if (part.name === 'ask_user_questions') {
    const sendMessage = useSandboxStore((s) => s.sendMessage); // ❌ Rules of hooks violation
    return <QuestionFlow onSubmit={sendMessage} />;
  }
}

// CORRECT: Wrapper component handles the hook
function AskQuestionsBlock({ part }: { part: MessagePart }) {
  const sendMessage = useSandboxStore((s) => s.sendMessage); // ✅ Inside a component
  const input = part.input as { title?: string; questions: Question[] };
  if (!input?.questions?.length) return null;
  return (
    <QuestionFlow
      title={input.title}
      questions={input.questions}
      onSubmit={(formatted) => void sendMessage(formatted)}
    />
  );
}

function renderPart(part: MessagePart, index: number) {
  if (part.name === 'ask_user_questions') {
    return <AskQuestionsBlock key={index} part={part} />; // ✅ Renders a real component
  }
}
```

## When to Use

- Switch/if-based render function that needs hook access in one branch
- List renderer (`.map(renderItem)`) where one item type needs store state
- Any utility function that builds JSX but needs context/store data

## Naming Convention

Name the wrapper after the thing it wraps:
- `<AskQuestionsBlock>` wraps `<QuestionFlow>`
- `<PlanBlock>` would wrap `<PlanCard>`
- `<FooWrapper>` or `<FooBlock>` are good suffixes

## Trade-offs

- Adds a small component per branch that needs hooks
- Slightly more indirection, but hooks stay valid
- Alternative: convert the entire render function to a component and call hooks at the top — but this is often impractical when the function renders many different types
