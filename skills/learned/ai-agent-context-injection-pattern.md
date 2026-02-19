# AI Agent Context Injection Pattern

**Extracted:** 2026-02-19
**Context:** Any system where an AI agent consistently makes wrong decisions on a class of tasks due to missing domain context

## Problem

An AI agent has the right tools but makes bad decisions because it lacks domain-specific context at runtime. Examples:
- Agent adds a Tailwind color class without checking if an existing CSS rule will override it
- Agent modifies a config file without checking for environment-specific overrides
- Agent creates a new file without knowing the project already has a canonical location for that type

The agent isn't broken — it just doesn't know what it doesn't know.

## Solution

Fix systematic agent mistakes by injecting three things into the agent's prompt:

1. **Task-type detection** — keyword-match the user's instruction to identify when the failure mode is likely
2. **Pre-fetched context** — run the lookup the agent would forget to do, embed the result in the prompt
3. **Decision rules** — explicit "when you see X, do Y not Z" guidance for the failure mode

```typescript
// 1. Detect task type
const colorKeywords = ['color', 'text-', 'bg-', 'background', 'gradient'];
const isColorTask = colorKeywords.some(k => instruction.toLowerCase().includes(k));

// 2. Pre-fetch relevant context (VaporForge uses sandboxManager.execInSandbox)
let cssContext = '';
if (isColorTask) {
  try {
    const result = await sandboxManager.execInSandbox(sessionId, cssReadCmd);
    cssContext = (result.stdout || '').slice(0, 3000);
  } catch {}
}

// 3. Embed rules in fullPrompt
const RULES = [
  '- Before adding a color utility class, grep for existing CSS rules on that element',
  '- If a .class-name { color: ... } rule exists, edit it directly — do not fight specificity',
  '- Use Tailwind ! prefix only when you cannot edit the CSS file',
];

const fullPrompt = [
  instruction,
  cssContext ? `Existing CSS:\n${cssContext}` : '',
  'Rules:',
  ...RULES,
].filter(Boolean).join('\n\n');
```

## Example

**Before:** Agent adds `text-cyan-400` to a `.section-label` element. The element stays orange because `.section-label { color: #f97316 }` in global.css wins by source order.

**After:** Agent reads the CSS context in its prompt, sees `.section-label` already has a color rule, edits global.css directly to `color: theme('colors.cyan.500')`. Works on first try.

Agent's reasoning (visible in UI):
> "First, let me check if there's an existing CSS rule for the `section-label` class. I found the existing CSS rule in global.css. I'll edit it directly to change the color to cyan."

## When to Use

- An AI agent repeatedly makes the same class of mistake across multiple sessions
- The mistake is caused by missing context (file contents, project conventions), not bad reasoning
- You can detect the task type from the instruction text
- You can pre-fetch the relevant context cheaply (< 5s, < 4KB)

## VaporForge Implementation

In `src/api/agency.ts`, the preflight section before building `fullPrompt`:
- CSS files read when instruction contains color/style keywords
- `CSS_SPECIFICITY_RULES` constant embedded in every `fullPrompt`
- Context capped at 3000 chars to avoid bloating the prompt
- Pre-fetch wrapped in try/catch — failure is silent, never blocks the edit

## Notes

- This is prompt engineering, not fine-tuning — the agent reasons correctly when given the right inputs
- Keep injected context small — 2-4KB max, or it drowns out the actual instruction
- Rules should be imperative ("check X before Y") not explanatory ("because of CSS cascade...")
- Pre-fetch failures should always be silent — never block the agent task on a context fetch error
- The same pattern applies to any AI system with a `systemPrompt` or `fullPrompt` field
