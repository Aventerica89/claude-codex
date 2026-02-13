# LLM Context Injection: Anti-Fetch Pattern

## Pattern Type
`error_resolution` | `debugging_techniques`

## Problem
When building a chat interface that pre-fetches data (Basecamp, database, API) and injects it into an LLM's context, the LLM may still respond with "I'll fetch that data for you" or emit action/tool calls to retrieve data that's already present. This creates a broken UX: the user sees a loading spinner for an action that returns data Claude never surfaces in its response text.

## Root Cause
Two interacting issues:
1. **System prompt too permissive**: Listing data-fetch actions as "supported" encourages the LLM to emit them
2. **Response-before-action architecture**: LLM generates its response text BEFORE actions execute, so fetched data never appears in the answer

## Solution

### 1. Rewrite system prompt with explicit CRITICAL RULES
```
CRITICAL RULES:
1. ANSWER DIRECTLY from the data in your context. The data is already there.
2. NEVER say "I'll fetch" or "Let me pull up" or "Just a moment".
3. NEVER emit a data_query action. All data you need is in the context.
4. Only use actions when the user asks to CREATE or MODIFY something.
```

### 2. Remove read-only actions from supported actions list
If you pre-fetch data, do NOT list `query` or `fetch` as supported action types. Only list mutating actions (create, update, delete).

### 3. Pre-fetch into context, not post-fetch via actions
```
Context builder (server) → builds context string → sends to LLM
NOT: LLM → emits fetch action → action executes → data never shown
```

## Key Insight
LLMs follow the path of least resistance. If a "query" action is listed as available, the LLM will use it even when the data is already in context. The fix is purely prompt engineering: explicitly forbid the unwanted behavior.

## Applicability
- Any chat interface with pre-fetched context (CRM, project management, dashboards)
- RAG systems where retrieved data is already in the prompt
- Tool-use LLM apps where read actions compete with context data

## Source
bricks-cc Basecamp chat integration (2026-02-12)
