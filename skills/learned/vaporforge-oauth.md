# VaporForge OAuth Pattern - Claude Code Authentication

**Extracted:** 2026-02-05
**Context:** Building web-based Claude Code IDE (VaporForge) that needs to authenticate with Claude Pro/Max subscriptions

## Problem

VaporForge needs to authenticate users with their Claude Pro/Max subscription to avoid API costs. The original implementation tried running `claude login` inside a Cloudflare Sandbox container and parsing terminal output for OAuth URLs. This approach was fundamentally broken.

## Key Discoveries

### 1. `claude login` Does NOT Exist

The Claude Code CLI (v2.1.x) has NO `login` subcommand. Available commands:
- `doctor`, `install`, `mcp`, `plugin`, `setup-token`, `update`

The `setup-token` command is: "Set up a long-lived authentication token (requires Claude subscription)"

First-time auth is triggered by running `claude` (the main command), not a subcommand.

### 2. Credential Storage (macOS)

Stored in macOS Keychain, NOT filesystem:
- **Main entry**: Service `Claude Code-credentials` (contains `claudeAiOauth`)
- **Per-project entries**: Service `Claude Code-credentials-{hash}` (contain `mcpOAuth` only)

To read:
```bash
security find-generic-password -a "$USER" -s "Claude Code-credentials" -w
```

### 3. Credential Structure

The MAIN keychain entry (`Claude Code-credentials` without hash):
```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1770371159956,
    "scopes": ["user:inference", "user:mcp_servers", "user:profile", "user:sessions:claude_code"],
    "subscriptionType": "max",
    "rateLimitTier": "default_claude_max_20x"
  },
  "mcpOAuth": { ... },
  "organizationUuid": "..."
}
```

Per-project entries (with hash suffix) only have `mcpOAuth`, NOT `claudeAiOauth`.

### 4. Token Refresh Endpoint

```typescript
POST https://api.anthropic.com/v1/oauth/token
Content-Type: application/x-www-form-urlencoded

Body:
  grant_type=refresh_token
  refresh_token=<token>
  client_id=claude-desktop
```

### 5. How 1Code Actually Does Auth

1Code does NOT do direct browser OAuth with claude.ai. They use a 3-layer system:
1. User authenticates with 21st.dev backend (their own OAuth)
2. 21st.dev spins up a temporary CodeSandbox that runs `claude login`
3. Desktop app polls the sandbox for the OAuth URL
4. User completes auth in browser
5. Token comes back through the sandbox

Endpoints:
- `POST https://21st.dev/api/auth/claude-code/start` (creates sandbox)
- `GET {sandboxUrl}/api/auth/{sessionId}/status` (poll for URL/token)
- `POST {sandboxUrl}/api/auth/{sessionId}/code` (submit auth code)

### 6. How Tokens Are Used

Passed as environment variable to Claude SDK:
```
CLAUDE_CODE_OAUTH_TOKEN=<token>
```

### 7. 1Code Also Supports Token Import

Can read from system credentials directly:
- macOS: `security find-generic-password -s "Claude Code-credentials"`
- Windows: `~/.claude/.credentials.json`
- Linux: `secret-tool lookup service "Claude Code"`

## Recommended VaporForge Approach

### Simplest Path: `setup-token` + Paste

1. User generates a token via `claude setup-token` locally
2. Pastes it into VaporForge
3. VaporForge stores in browser localStorage
4. VaporForge refreshes via `https://api.anthropic.com/v1/oauth/token`
5. Token passed as `CLAUDE_CODE_OAUTH_TOKEN` to sandbox

### Advantages Over Sandbox-Based OAuth
- No ANSI parsing needed
- No URL extraction from terminal output
- No `claude login` (which doesn't exist as a subcommand)
- No sandbox spinup just for auth
- Works immediately, no polling
- Much simpler code

## What NOT to Do

- Don't run `claude login` in a container (command doesn't exist)
- Don't try to parse ANSI terminal output for URLs
- Don't store user tokens on the server
- Don't use API keys (`sk-ant-api`) for subscription users
- Don't look for credentials at `~/.claude/.credentials.json` on macOS (it's in Keychain)
- Don't look for `claudeAiOauth` in per-project keychain entries (only in main entry)

## When to Use

- Building web apps that authenticate with Claude Pro/Max subscriptions
- Implementing headless/remote Claude Code authentication
- Debugging Claude Code credential issues
