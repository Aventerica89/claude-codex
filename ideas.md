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

## DevTools

### DevTools Widget - Ideas Capture Section
**Added:** 2026-02-18
**Status:** Idea
**Project:** https://github.com/Aventerica89/devtools

A dedicated "Ideas" panel in the embeddable DevTools widget — same concept as the screenshot function but for capturing quick notes, observations, and micro-adjustments while working.

- Ideas section in the widget toolbar alongside Console/Network/Errors etc.
- Quick text input to jot down ideas mid-session without breaking flow
- Screenshots captured in the widget go to a DevTools file manager (not browser downloads)
- Pile up many small ideas and preference notes while large tasks are running, then paste them all at once as a batch input to Claude
- Pairs well with the `/ideas` workflow for structured capture

---

### DevTools Widget - Expanded Ideas Panel + Batch Copy
**Added:** 2026-02-18
**Status:** Idea
**Project:** https://github.com/Aventerica89/devtools

The ideas panel should expand into a larger overlay (not just a small widget section) for reviewing and batching captured ideas.

- "Open full panel" button expands ideas list into a bigger centered overlay or drawer
- Select multiple ideas (checkboxes) and copy them all at once
- "Copy all" button dumps every idea as a formatted block ready to paste into Claude
- Sort ideas by time captured, type, or project
- Sorting + filtering like VaporForge's bug tracker (status, severity, project filter)
- Optional: tag ideas (UX, Bug, Feature, Preference) for easier filtering

---

### DevTools Widget - Screenshot File Manager
**Added:** 2026-02-18
**Status:** Idea
**Project:** https://github.com/Aventerica89/devtools

Instead of screenshots downloading to the browser default folder (or requiring FSAA picker), route them through a DevTools file manager.

- Debug Snapshot screenshots go to a "Files" section in the DevTools dashboard
- Viewable in-browser without needing to navigate Finder
- Claude can reference them via full path (already partially implemented in DebugSnapshot.tsx)
- Could support image annotations or tagging before sending to Claude
- Possible backend: store as blobs in Turso or as base64 in devlog entries

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

### JB Cloud App Tracker - Maintenance Command Scheduling
**Added:** 2026-01-28
**Status:** Idea
**Project:** https://github.com/Aventerica89/jb-cloud-app-tracker

Integration with Claude Code commands to track and schedule maintenance tasks across all apps.

**Core Problem:**
Need to track when security reviews, code reviews, and maintenance commands were last run on each app, and when they're due next.

**Claude Command Integration:**
- `/security` - Security audit and vulnerability scan
- `/code-review` - Code quality and best practices review
- `/structure` - Architecture and file organization review
- `/test-coverage` - Test coverage analysis
- `/dependencies` - Dependency updates and security patches
- `/performance` - Performance profiling and optimization

**Features:**
- Maintenance checklist per app with status tracking
- Last run timestamps for each command type
- Scheduled reminders (weekly/monthly/quarterly)
- One-click "Run maintenance" button that executes commands in Claude
- History log of all maintenance runs with results
- Batch operations - run security audit on all apps at once
- Priority flagging for apps that haven't been reviewed recently

**Scheduling System:**
- Weekly: Security scans, dependency checks
- Monthly: Code reviews, test coverage analysis
- Quarterly: Architecture reviews, performance audits
- Custom: User-defined schedules per app or command type

**Integration Points:**
- Claude MCP server to trigger commands from app tracker UI
- Store command results/reports in app tracker database
- Dashboard view showing maintenance health across all apps
- Notifications when maintenance is overdue

**UI Components:**
- Maintenance calendar view showing scheduled tasks
- Per-app maintenance checklist with status badges
- Bulk action toolbar for running commands across multiple apps
- Command history timeline per app

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

## MacOS/iOS Apps

### Apple Shortcuts Manager
**Added:** 2026-01-28
**Status:** Idea

A comprehensive shortcuts management app similar to links/artifacts manager, providing visualization, versioning, and AI-powered assistance for Apple Shortcuts.

**Core Features:**
- Screenshot capture of shortcut processes
- Text/image layout visualization of workflow steps
- iCloud link generation for easy sharing
- Version tracking and history
- Built-in AI for troubleshooting shortcuts

**Potential Features:**
- Automatic shortcut building from descriptions (iOS/MacOS app)
- Shortcut marketplace/discovery
- Backup and restore functionality
- Collaborative editing and sharing

**Platform:**
- iOS app for mobile management
- MacOS app for desktop workflow
- Cross-platform sync via iCloud

---

### Smart Calorie & Macro Tracker
**Added:** 2026-01-28
**Status:** Idea

A comprehensive nutrition tracking system with ingredient-to-meal hierarchy, AI-powered calorie estimation, and drag-and-drop meal planning.

**Core Hierarchy:**
- **Ingredients** - Base items (milk, protein powder, greek yogurt, etc.)
- **Recipes** - Built from ingredients with calculated nutrition
- **Meals** - Combine recipes/ingredients with custom portions

**Meal Builder Features:**
- Template system for regular meals (morning shake, burrito, etc.)
- Variable ingredient amounts (1-2 cups milk, 2-3 scoops protein)
- Quick meal builder with common ingredient picker
- Save custom meal templates for reuse
- Drag-and-drop meals into daily calendar

**Smart Features:**
- Photo-based calorie estimation with AI
- Weight scale integration for precise measurements
- Claude AI recipe import with automatic calorie calculation
- Recipe URL import (auto-parse ingredients and nutrition)

**Walmart Integration:**
- Add ingredients to Walmart delivery cart
- Shopping list generation from meal plans
- Automatic grocery suggestions based on meal schedule

**Tracking & Analytics:**
- Daily calorie and macro tracking
- Macro breakdown pie charts (protein/carbs/fats)
- Weekly/monthly trend graphs
- Meal history and favorites

**Cross-Platform:**
- **iOS app** - Primary interface with drag-and-drop meal planning
- **MacOS app** - Desktop meal prep and recipe management
- **Web app** - Access from any device, recipe imports
- iCloud sync across all platforms

**User Experience:**
Example workflow:
1. Create "Morning Shake" template with variable options
2. Each morning: Open app, adjust portions (2 or 3 scoops?)
3. Drag template into today's breakfast slot
4. Auto-updates daily calories and macros
5. View progress in graphs section

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

---

### WP Manager - Product Improvements Roadmap
**Added:** 2026-01-29
**Status:** Idea
**Project:** jb-cloud-wp-manager

Comprehensive list of feature ideas to enhance WP Manager beyond MVP.

**Bulk Operations (High Priority):**
- Select multiple sites (checkboxes)
- Bulk plugin/theme updates across selected sites
- Bulk sync selected sites
- Bulk archive/unarchive operations
- Bulk tag management

**Notifications & Alerts:**
- Email notifications when updates are available
- Alert when sites go offline
- Daily/weekly digest of all sites status
- Slack/Discord webhook integration
- Custom alert rules (e.g., "notify if > 10 plugin updates")

**Automation:**
- Scheduled auto-sync (daily/weekly/custom)
- Auto-update plugins/themes with configurable rules
- Automatic health checks at intervals
- Auto-backup coordination before updates
- Rollback capability after failed updates

**Monitoring & Analytics:**
- Uptime monitoring with historical data
- Performance metrics (page load time, TTFB)
- Traffic analytics integration (Google Analytics)
- Site speed scores (PageSpeed, Core Web Vitals)
- Downtime alerts with incident history

**Security Features:**
- Security scanning (vulnerabilities, malware)
- SSL certificate monitoring and renewal alerts
- File integrity monitoring
- Login attempt monitoring across sites
- Firewall rule management
- Security score per site

**User Management:**
- View all WordPress users across sites
- Bulk user operations (add/remove users to multiple sites)
- Role management across sites
- Password reset workflows
- User activity tracking

**Backup Management:**
- Coordinate backups across all sites
- Schedule automated backups
- Restore from backup interface
- Backup storage management
- Off-site backup integration (S3, Dropbox, etc.)

**Change Tracking:**
- Detailed history of all changes (updates, config changes)
- Rollback capability
- Activity log with user attribution
- Change approval workflow for teams
- Compare plugin/theme versions

**Team Collaboration:**
- Multi-user support with roles (admin, editor, viewer)
- Team workspaces for agencies
- Client portal (read-only access for clients)
- Comment system on sites
- Task assignment per site

**Reporting:**
- PDF reports generation
- Custom report builder
- White-label reports for clients
- Scheduled report emails
- Executive summaries

**Integrations:**
- Direct hosting API integration (xCloud, WP Engine, Kinsta, Cloudways)
- GitHub integration for version control
- Slack/Discord notifications
- Zapier integration
- Domain registrar integration (expiry tracking)
- CDN management (Cloudflare, BunnyCDN)

**Enhanced UI/UX:**
- Custom dashboard widgets (drag-and-drop)
- Dark mode
- Saved filters and views
- Keyboard shortcuts
- Advanced search and filtering
- Tags and custom categories for sites
- Bulk edit site details
- Quick actions menu (right-click context menu)

**Mobile Experience:**
- Responsive mobile improvements
- Native iOS app (already have placeholder at /mobile-app!)
- Native Android app
- Push notifications for alerts
- Quick actions from notifications

**Advanced Features:**
- Site staging environment management
- DNS management
- Content deployment (push content between sites)
- Plugin/theme development mode (test updates on staging)
- A/B testing coordination
- SEO monitoring and suggestions
- Database optimization recommendations
- Broken link checker across all sites

**White Label & Agencies:**
- Custom branding (logo, colors)
- Agency billing management
- Client invoicing
- Reseller features
- Sub-accounts for clients
- Public status pages per client

**Developer Features:**
- WP-CLI integration
- Custom webhook triggers
- REST API for WP Manager
- Export all data (JSON, CSV)
- Import sites from CSV
- Scripting/automation via API
- Plugin development toolkit

**Priority Recommendations:**
1. **Phase 4a** (Quick Wins) - Bulk operations, tags/categories, advanced filters
2. **Phase 4b** (Core Value) - Notifications, scheduled sync, backup basics
3. **Phase 5** (Growth) - Security scanning, uptime monitoring, team features
4. **Phase 6** (Advanced) - Integrations, white label, mobile apps
