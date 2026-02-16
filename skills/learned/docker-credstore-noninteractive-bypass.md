# Docker credsStore Non-Interactive Shell Bypass

**Extracted:** 2026-02-16
**Context:** Deploying VaporForge (or any CF Workers container) from a non-interactive shell (Claude Code, CI/CD, SSH)

## Problem

Docker builds that pull from public registries (e.g. `docker.io/cloudflare/sandbox`) fail with:

```
error getting credentials - err: exit status 1, out: `keychain cannot be
accessed because the current session does not allow user interaction.
The keychain may be locked...`
```

This happens when `~/.docker/config.json` has `"credsStore": "desktop"` and:
- The shell session is non-interactive (no GUI prompt possible)
- macOS keychain is locked
- Docker Desktop is not in the foreground
- Running via SSH, cron, or Claude Code terminal

`security unlock-keychain` often fails from non-interactive shells because it requires a password prompt.

## Solution

Temporarily remove `credsStore` from Docker config before the build:

```bash
# 1. Backup
cp ~/.docker/config.json ~/.docker/config.json.bak

# 2. Remove credsStore (public images don't need credentials)
cat ~/.docker/config.json | python3 -c "
import sys, json
c = json.load(sys.stdin)
del c['credsStore']
json.dump(c, sys.stdout, indent=2)
" > ~/.docker/config.json.tmp && mv ~/.docker/config.json.tmp ~/.docker/config.json

# 3. Run your build/deploy
npx wrangler deploy

# 4. Restore immediately after
cp ~/.docker/config.json.bak ~/.docker/config.json
```

## Important Notes

- The `WARNING! Your credentials are stored unencrypted` message is expected and harmless since you restore the backup immediately after.
- Only needed for public registry pulls. Private registries still need auth.
- Always restore the backup — leaving `credsStore` removed long-term stores credentials in plaintext.
- Combine with `docker image prune -a -f && docker builder prune -a -f` when Dockerfile changes (standard VaporForge cache-bust pattern).

## When to Use

- Any Docker build failing with "keychain cannot be accessed" from a non-interactive shell
- CI/CD pipelines on macOS runners with Docker Desktop
- SSH sessions where `security unlock-keychain` fails
- Claude Code terminal running `wrangler deploy` or `docker build`
