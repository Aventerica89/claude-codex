# Serverless API Timeout Guard Pattern

## Pattern Type
`error_resolution` | `debugging_techniques`

## Problem
Serverless functions (Vercel, Lambda, CF Workers) have strict timeouts (10-30s). Chaining multiple external API calls (e.g., fetching summaries for all Basecamp projects, each requiring 5+ sequential calls) easily exceeds this limit. The function hangs and the user sees a spinner forever.

## Solution
Wrap external API calls in `Promise.race` with a safety timeout, and limit the number of detailed fetches.

```typescript
// Pattern: timeout guard + scope limiting
const data = await Promise.race([
  fetchDetailedData(targetId),               // expensive: 5+ API calls
  new Promise<null>((resolve) =>
    setTimeout(() => resolve(null), 8000)     // 8s safety valve
  ),
]);

// Graceful degradation: if timeout, still have partial data
if (data) {
  context.details = data.details;
} else {
  console.warn("Basecamp fetch timed out, using project list only");
}
```

### Scope Limiting
Don't fetch details for ALL entities. Fetch a list (1 call) + details for ONE target (4-5 calls):

```typescript
// WRONG: 5 calls x 10 projects = 50 API calls = timeout
const details = await Promise.all(
  projects.map(p => getProjectSummary(p.id))
);

// RIGHT: 1 call for list + 5 calls for one project = 6 total
const projects = await client.getProjects();           // 1 call
const details = await client.getProjectSummary(targetId); // ~5 calls
```

## Key Numbers
| Platform | Function Timeout | Safety Timeout |
|----------|-----------------|----------------|
| Vercel (Hobby) | 10s | 8s |
| Vercel (Pro) | 60s | 50s |
| CF Workers | 30s (CPU) | 25s |
| Lambda | configurable | timeout - 2s |

## When to Apply
- Any serverless function calling external APIs
- Especially when chaining sequential API calls
- When the external service has variable response times

## Source
bricks-cc: Basecamp API calls causing Vercel function timeout (2026-02-12)
