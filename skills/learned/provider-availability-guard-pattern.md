# Provider Availability Guard Pattern

**Extracted:** 2026-02-12
**Context:** Multi-provider AI features where users configure API keys for different providers (Claude, Gemini, OpenAI, etc.)

## Problem

When building features that support multiple AI providers (chat, code transform, etc.), the frontend defaults to a provider (e.g. `'claude'`) but the user may only have credentials for a different one (e.g. Gemini). The backend correctly returns 400 with "API key not configured", but the user sees a confusing error in console and the UI gives no helpful guidance.

This is a common trap: the backend validation works, but the UX is broken because the frontend doesn't know which providers are usable.

## Solution

Three-layer defense:

### 1. Backend: Expose available providers alongside data

Piggyback provider availability on an existing endpoint that the frontend already calls (e.g. the list/init endpoint):

```typescript
// GET /api/quickchat/list
const [chatList, availableProviders] = await Promise.all([
  readChatList(kv, user.id),
  getAvailableProviders(kv, user.id), // checks which providers have API keys
]);

return c.json({
  success: true,
  data: { chats: chatList, availableProviders },
});
```

### 2. Store: Auto-select valid provider + guard send

```typescript
// In Zustand store
loadChats: async () => {
  const result = await listQuickChats();
  const { selectedProvider } = get();

  // Auto-select an available provider if current one isn't available
  let provider = selectedProvider;
  if (
    result.availableProviders.length > 0 &&
    !result.availableProviders.includes(selectedProvider)
  ) {
    provider = result.availableProviders[0];
  }

  set({
    chats: result.chats,
    availableProviders: result.availableProviders,
    selectedProvider: provider,
  });
},

sendMessage: async (content) => {
  const { selectedProvider, availableProviders } = get();

  // Guard: prevent sending to unconfigured provider
  if (!availableProviders.includes(selectedProvider)) {
    set({ error: `No API key for ${selectedProvider}. Add one in Settings.` });
    return;
  }
  // ... continue with send
},
```

### 3. UI: Disable unavailable providers visually

```tsx
<ProviderToggle
  provider="claude"
  selected={selectedProvider === 'claude'}
  available={availableProviders.includes('claude')}
  onClick={() => setProvider('claude')}
/>

// Toggle component
function ProviderToggle({ available, selected, onClick, ... }) {
  return (
    <button
      disabled={!available}
      title={available ? label : `${label} - no API key configured`}
      className={!available ? 'opacity-40 cursor-not-allowed' : ...}
    >
      {icon} {label}
      {!available && <span className="text-[9px]">n/a</span>}
    </button>
  );
}
```

Also: disable the input/send button when no providers at all, show setup prompt.

## When to Use

- Building multi-provider AI features (chat, transform, search, etc.)
- Any feature where user-configured credentials determine which backends are available
- Adding new provider support to existing multi-provider systems
- Any "provider toggle" or "model selector" UI pattern

## Key Insight

**Guard at the UI layer, not just the API layer.** Backend 400 errors are correct but unhelpful to users. The fix is: (1) tell the frontend what's available upfront, (2) auto-select something that works, (3) visually disable what doesn't. This avoids the request entirely rather than failing it.

## Also Learned

AI SDK v6 renamed `LanguageModelV1` to `LanguageModel`. When upgrading major versions of the `ai` package, check type exports — esbuild may not catch the mismatch but `tsc` will.
