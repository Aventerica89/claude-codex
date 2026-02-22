# Prompt Kit Convert

Convert a React/Tailwind component to prompt-kit (ibelick) style.

## Arguments

Parse `$ARGUMENTS`:
- If a file path is provided — read the file and convert it in place
- If no argument — look for the component being discussed in the current conversation

## Behavior

Delegate to the `ibelick-converter` agent with the following prompt:

```
Convert the component at <path or from context> to ibelick/prompt-kit style.

Rules:
- Compound components via React Context (no prop drilling)
- Named exports only — no default exports
- cn() for all class composition
- CSS variable color tokens only (never hardcoded hex except #4f4f4f2e for grid overlays)
- Only animate transform and opacity — never layout properties
- h-dvh not h-screen; size-4 shorthand preferred over h-4 w-4
- No React.FC, no interface Props — use ComponentProps<'element'> or inline types
- Reference the 13 installed prompt-kit components for patterns

Write the converted component back to the same file path.
```

## Usage

```
/prompt-kit-convert                          # convert component being discussed
/prompt-kit-convert src/components/Foo.tsx   # convert a specific file
```

## Notes

- Powered by the `ibelick-converter` agent (Opus model)
- Agent file: ~/.claude/agents/ibelick-converter.md
- Reference: prompt-kit.com / elements.ai-sdk.dev
