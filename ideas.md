# Ideas Backlog

A collection of project ideas captured during Claude Code sessions.

---

## Browser Extensions

### Env Var Assistant - Auto-paste secrets to dashboards
**Added:** 2026-01-26
**Status:** Idea

A browser extension + 1Password integration for storing API keys and automatically entering them into provider dashboards.

**Architecture:**
```
Claude Chat → 1Password CLI (op) → 1Password Vault
                                        ↓
Browser Extension ← 1Password Connect/API
        ↓
Dashboard Automation (navigate + fill + click)
```

**1Password Integration:**
- Store secrets via `op` CLI with tags and metadata
- Use custom fields to store target dashboard URL and field selectors
- 1Password Connect (self-hosted REST API) for extension access
- Native messaging bridge between extension and 1Password

**Browser Extension Role:**
- Read tagged items from 1Password (via Connect or native messaging)
- Maintain manifest of dashboard selectors (Cloudflare, Vercel, Netlify, AWS, Supabase, etc.)
- Navigate to stored URL for each secret
- Content script finds fields, fills values, clicks save

**Advantages:**
- No secret storage in extension - 1Password handles all security
- Cross-device sync via 1Password
- Full audit trail in 1Password
- Could leverage 1Password's existing autofill UI
- Pattern matching for common formats (`API_KEY=`, `sk-...`, `ghp_...`, etc.)

**Potential Extensions:**
- MCP server integration - Claude invokes "store this key for Cloudflare"
- Batch mode for setting up new projects (multiple env vars at once)
- Dashboard selector manifest as community-maintained repo

---

### 1Password Token Storage Workflow
**Added:** 2026-01-27
**Status:** Idea

Simple workflow for storing one-time access tokens/API keys directly to 1Password.

**Concept:**
When you generate a one-time token (Supabase CLI, Vercel, etc.), store it in 1Password under the site's existing login entry as an additional password field.

**Structure in 1Password:**
```
Site: Supabase (existing login)
├── Username: user@email.com
├── Password: ********
├── Access Token: sbp_xxxxx          ← NEW
│   └── Label: "CLI Access Token"
│   └── Notes: "Generated 2026-01-27 for jb-cloud-app-tracker"
└── URL: https://supabase.com
```

**CLI Integration:**
```bash
# Store token under existing login
op item edit "Supabase" "Access Token[password]=sbp_xxxxx" --vault Personal

# Or create new section
op item edit "Supabase" "CLI Tokens.Token Name[password]=value"
```

**Benefits:**
- Keeps tokens with their related service login
- No separate vault/item clutter
- Easy to find when you need it
- Can add description/date for context
- Works with existing 1Password workflow

---

## Web Apps

### JB Cloud App Tracker - Feature Ideas
**Added:** 2026-01-27
**Status:** Idea
**Project:** https://github.com/Aventerica89/jb-cloud-app-tracker

**High Value:**
- Deployment history - Track version history, rollbacks, who deployed
- Uptime monitoring - Ping deployment URLs and show status (up/down)
- Cost tracking - Log monthly costs per provider, see total spend
- Notes/changelog - Add notes to apps ("migrated DB on 1/15", "updated API keys")

**Organization:**
- Projects/Folders - Group related apps (e.g., "Client A", "Personal")
- Favorites - Pin frequently accessed apps to top
- Archive view - Separate page for archived apps

**Integrations:**
- GitHub integration - Auto-create deployments from GitHub webhooks
- Vercel/Cloudflare API - Pull deployment data automatically
- Slack notifications - Alert when deployments fail

**Analytics:**
- Deployment frequency chart - How often you deploy per week/month
- Provider breakdown - Pie chart of apps per provider
- Tech stack trends - What technologies you use most

**Quality of Life:**
- Bulk actions - Archive multiple apps at once
- Import/Export - CSV export of all apps
- Keyboard shortcuts - Quick navigation
- Global search - Search across apps, deployments, tags

---

### JB Cloud Docs - UI/UX Improvements
**Added:** 2026-01-27
**Status:** In Progress (Quick Wins)
**Project:** https://github.com/Aventerica89/jb-cloud-docs

**Quick Wins (Implementing):**
- [x] Search highlighting - Highlight matched terms from search results
- [x] Reading time estimates - Show "5 min read" on each doc page
- [x] Copy buttons on code blocks - One-click copy for snippets
- [x] Last updated timestamps - Show when each doc was modified

**Navigation & Discovery:**
- [x] Breadcrumbs - Show path hierarchy (Home > xCloud > SSH Setup)
- [x] Related docs - "See also" links at bottom of each page (RelatedDocs component)
- Quick links sidebar - Pin frequently accessed docs
- [x] Keyboard shortcuts - Cmd+K for search, arrow keys for prev/next (built-in)

**Interactive Features:**
- [x] Expandable sections - Collapsible FAQ-style content (Accordion component)
- [x] Tabbed code examples - Same example in multiple languages (Tabs component)
- [x] Interactive diagrams - Mermaid diagrams for architecture
- Version selector - For multi-version tool docs

**Engagement:**
- Feedback widget - "Was this helpful?" thumbs up/down (needs API)
- [x] Edit on GitHub link - Let users submit corrections
- [x] Changelog/What's New - Highlight recent updates on homepage
- [x] Progress tracker - For multi-page tutorials (TutorialProgress component)

**Advanced:**
- Personalized dashboard - Save favorites, track reading history
- Offline mode - PWA support for reading without internet
- Theme toggle - Dark/light/system preference persistence
- AI "Explain this" - Highlight text, get simplified explanation

---

## CLI Tools

### /new-project Workflow Enhancements
**Added:** 2026-01-27
**Status:** In Progress

Ideas for faster project bootstrapping:

**Quick Start Presets:**
- `--preset saas` - Next.js + Supabase + Clerk + Stripe-ready
- `--preset landing` - Astro + Tailwind + minimal
- `--preset api` - Hono/Express + Turso + API-first
- `--preset portfolio` - Astro + MDX + blog-ready
- `--preset experiment` - Minimal setup, quick iteration

**Speed Improvements:**
- Skip confirmation prompts with `--yes` flag
- Remember last-used choices per preset
- One-liner mode: `/new-project myapp --preset saas --yes`
- Template repo cloning instead of scaffolding from scratch

**Smart Defaults:**
- Auto-detect if in existing project (has package.json)
- Suggest based on recent projects ("You usually use Supabase...")
- Time-of-day awareness (quick setup for late night experiments)

**Templates & Starters:**
- Maintain curated starter repos on GitHub
- `jb-starter-saas`, `jb-starter-landing`, etc.
- One command: `gh repo create myapp --template jb-starter-saas`

**Integration:**
- Auto-create GitHub repo with `--github` flag
- Auto-setup Vercel/Cloudflare project with `--deploy` flag
- Auto-sync to docs.jbcloud.app with `--docs` flag

---

---

## APIs & Services

(Empty - add ideas with `/ideas add`)

---

## Other

### WP Manager - Set ADMIN_PASSWORD
**Added:** 2026-01-28
**Status:** Done
**Project:** jb-cloud-wp-manager

Set `ADMIN_PASSWORD` environment variable in Vercel to enable authentication on the WP Manager dashboard. Without it, the app runs without auth protection.

```bash
# In Vercel dashboard or CLI:
vercel env add ADMIN_PASSWORD
```

Completed: 2026-01-28 via `vercel env add` + `vercel --prod`
