# Next.js Dev Server Cleanup - Zombie Process Fix

**Extracted:** 2026-01-29
**Context:** localhost refuses connection even though dev server "started"

## Problem

Symptoms:
- `npm run dev` says "Ready" but localhost refuses connection
- Port 3000 "in use" but nothing visible running
- Lock file errors: "Unable to acquire lock at .next/dev/lock"
- Multiple dev servers fighting for same port

Root cause: Zombie `next-server` or `next dev` processes from previous sessions.

## Solution

### Nuclear Cleanup (recommended)
```bash
# Kill all Next.js processes
pkill -9 -f "next-server"
pkill -9 -f "next dev"

# Kill anything on common ports
lsof -ti:3000 -ti:3001 | xargs kill -9 2>/dev/null || true

# Remove all caches and locks
rm -rf .next node_modules/.cache .turbo

# Start fresh
npm run dev
```

### Find Zombie Processes
```bash
# See what's holding port 3000
lsof -i:3000 -sTCP:LISTEN

# Find specific process
ps aux | grep "next" | grep -v grep
```

### Add to package.json (Prevention)
```json
{
  "scripts": {
    "dev:clean": "rm -rf .next && next dev",
    "kill-dev": "pkill -f 'next dev' || true"
  }
}
```

## When to Use

- ERR_CONNECTION_REFUSED on localhost despite dev server "ready"
- Lock file errors mentioning `.next/dev/lock`
- Port already in use errors
- Dev server starts on unexpected port (3001, 3002)
- After computer sleep/wake cycles
- After force-quitting terminal sessions
