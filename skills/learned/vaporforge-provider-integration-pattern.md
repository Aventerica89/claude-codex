# VaporForge AI Provider Integration Pattern

## When to Use
- Adding a new AI provider (OpenAI, Mistral, etc.) to VaporForge
- Extending the AI Providers settings system
- Integrating any new MCP server that requires user credentials

## Architecture

```
Settings UI -> secretsApi.add(KEY) -> KV (user-secrets:{userId})
            -> aiProvidersApi.enable() -> KV (user-ai-providers:{userId})
                    |
Session create: collectGeminiMcpConfig(kv, userId)
  1. Check provider config enabled in user-ai-providers
  2. Check API key exists in user-secrets
  3. Return MCP config object or null
                    |
Merge into allMcpServers -> session-mcp:{sessionId} -> SDK options.mcpServers
API key flows via collectUserSecrets() -> sandbox env vars
```

## Adding a New Provider (Checklist)

### Backend
1. **`src/types.ts`**: Add provider to `AIProviderConfigSchema`
2. **`src/api/ai-providers.ts`**: Add PUT/DELETE routes + `collectXxxMcpConfig()` helper
3. **`src/api/sessions.ts`**: Call collector, merge into `allMcpServers`
4. **`src/sandbox.ts`**: Add agent injection flag if provider has a delegation agent
5. **`Dockerfile`**: Embed MCP server script via heredoc

### Frontend
6. **`ui/src/lib/types.ts`**: Add provider to `AIProviderConfig` interface
7. **`ui/src/lib/api.ts`**: Add enable/disable methods to `aiProvidersApi`
8. **`ui/src/components/settings/AIProvidersTab.tsx`**: Add provider card

### MCP Server
9. **`src/sandbox-scripts/xxx-mcp-server.js`**: Zero-dep stdio MCP server
10. **Dockerfile heredoc**: Embed at `/opt/claude-agent/xxx-mcp-server.js`

## Key Design Decisions

### Two-KV separation
- **`user-secrets:{userId}`**: Stores API key (reused by collectUserSecrets for env injection)
- **`user-ai-providers:{userId}`**: Stores provider preferences (enabled, model pref)
- Why: Secrets already have their own pipeline. Provider config is metadata, not a secret.

### Conditional injection
- `collectXxxMcpConfig()` returns `null` if provider disabled OR key missing
- Session creation only merges non-null configs
- Agent file only injected when `injectXxxAgent` flag is true

### MCP config merge order
```typescript
const allMcpServers = {
  ...(mcpServers || {}),           // User's manual MCP servers
  ...(pluginConfigs?.mcpServers || {}),  // Plugin MCP servers
  ...(geminiMcp || {}),            // Auto-injected providers (last = highest priority)
};
```

### Settings tab pattern
- API key input with masked hint when saved
- Enable/disable toggle (requires key first)
- Model preference selector
- Info box explaining available tools
- Link to get free API key

## Learned From
- VaporForge Gemini MCP integration (2026-02-12)
- Existing patterns: secrets.ts, mcp.ts, plugins.ts, SecretsTab.tsx
