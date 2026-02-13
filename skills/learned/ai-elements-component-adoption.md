# AI Elements Component Adoption Pattern

**Extracted:** 2026-02-12
**Context:** Evaluating and adopting AI Elements (elements.ai-sdk.dev) components into existing React + Tailwind codebases like VaporForge

## Problem

Building interactive AI UI from scratch is slow and inconsistent. AI Elements provides 30+ production-ready components for AI interfaces, but they're designed for Vercel AI SDK useChat flow. Need to adopt them into custom architectures (Zustand stores, custom SSE, Hono backends).

## Solution

AI Elements components are copy-paste, not an npm install. They use shadcn/ui primitives + Tailwind + Radix UI — all compatible with standard React projects. The key is understanding what each component needs and mapping it to your data flow.

### Component Catalog (grouped by VaporForge relevance)

**High Priority — Direct replacements/upgrades:**
- Reasoning: auto-open/close thinking panel (replaces our ChainOfThought)
- Tool: collapsible tool call display with status badges
- Suggestion: horizontal scrollable prompt chips (empty state)
- Message: compound message with markdown, actions, attachments, branching
- PromptInput: auto-resize, drag-drop files, speech, toolbar
- Terminal: ANSI 256 colors, streaming cursor, copy/clear
- Code Block: Shiki syntax highlighting, copy, line numbers

**Medium Priority — New features:**
- ChainOfThought: step-by-step agent reasoning with search results
- Task: task lists with status icons and progress counter
- Commit: git commit display with file changes and +/- lines
- TestResults: test suite with pass/fail/skip, progress bar
- StackTrace: clickable error traces, dimmed internal frames
- Sandbox: code + output tabs with execution status

**Lower Priority — Future features:**
- Agent: agent config inspector (model, tools, instructions)
- Artifact: structured content container with actions
- FileTree: hierarchical file/folder tree
- JSXPreview: live JSX rendering (streaming, auto-tag-completion)
- WebPreview: iframe preview with console, URL input, responsive modes
- SchemaDisplay: Zod/JSON schema visualization
- Sources: RAG source attribution links

### Adoption Strategy

1. **Don't install a package** — Copy component source from elements.ai-sdk.dev
2. **Check dependencies** — Most only need Radix UI (likely already have via shadcn)
3. **Map data flow** — Components expect useChat message parts; adapt to your store
4. **Start with leaf components** — Tool, Reasoning, Suggestion don't need useChat
5. **Graduate to useChat** — Eventually migrate Quick Chat to useChat for full integration

### Compound Component Pattern

All AI Elements use the same pattern we already use for Message:

```tsx
<Tool>
  <ToolHeader />
  <ToolContent>
    <ToolInput />
    <ToolOutput />
  </ToolContent>
</Tool>
```

Each sub-component accepts className + standard HTML props. Compose freely.

### Data Mapping Example

```typescript
// AI Elements Tool expects ToolUIPart from AI SDK:
interface ToolUIPart {
  type: 'tool-invocation' | 'tool-result';
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
}

// Map from our SSE events:
function mapToolEvent(event: SSEEvent): ToolUIPart {
  return {
    type: event.type === 'tool-call' ? 'tool-invocation' : 'tool-result',
    toolName: event.toolName,
    args: event.args,
    result: event.result,
    state: event.status,
  };
}
```

## When to Use

- Building any AI chat, agent, or code interface
- Need consistent, accessible UI for tool calls, reasoning, code display
- Want to upgrade from basic markdown rendering to rich interactive components
- Planning to eventually migrate to useChat (components are designed for it)

## Key Dependencies by Component

| Component | Extra Dep | Notes |
|-----------|-----------|-------|
| Reasoning | react-markdown | We have via ChatMarkdown |
| Terminal | ansi-to-react | Alternative to xterm.js |
| CodeBlock | shiki | Alternative to Monaco |
| ChainOfThought | @radix-ui/react-collapsible | Likely have |
| JSXPreview | react-jsx-parser | New dep |
| StackTrace | Custom parser | No extra dep |

## Key Insight

AI Elements is NOT a monolithic library. It's a component reference. Pick what you need, copy the source, adapt the data flow. The compound component pattern makes it easy to customize without forking.
