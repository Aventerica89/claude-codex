# Tailscale DNS Blocks Supabase Subdomain Resolution

**Extracted:** 2026-02-18
**Context:** Running Supabase queries or migrations from CLI when Tailscale is active

## Problem
With Tailscale running, DNS resolution for Supabase project subdomains (`*.supabase.co`) fails with NXDOMAIN. This affects:
- Node.js `fetch()` calls to the Supabase REST API
- `curl` commands to Supabase endpoints
- Any CLI tool connecting to Supabase

Tailscale uses its own DNS resolver at `100.100.100.100` (Magic DNS). Even querying Google DNS (`8.8.8.8`) directly via `nslookup` may return NXDOMAIN, despite the project being healthy and accessible from a browser.

## Solution
**Workaround 1 (recommended):** Run SQL directly in the Supabase dashboard SQL Editor. The browser resolves DNS through the system resolver which works fine.

**Workaround 2:** Temporarily disable Tailscale DNS:
- Tailscale menu > Preferences > uncheck "Use Tailscale DNS"
- Run your CLI commands
- Re-enable Tailscale DNS

**Workaround 3:** Add Supabase to Tailscale's DNS split config to bypass Magic DNS for `.supabase.co` domains.

## When to Use
When you see `ENOTFOUND` or `NXDOMAIN` for `*.supabase.co` from the command line while Tailscale is running. Verify the project is actually healthy via the Supabase dashboard before assuming it's paused.
