---
description: Initialize a new project with full setup - platform selection, style guide, architecture, and implementation plan. Step-by-step with review between phases.
---

# New Project Command

A comprehensive project initialization workflow that guides you from idea to ready-to-build.

## Arguments

Parse `$ARGUMENTS` for optional flags:
- `--quick` or `-q` - Skip confirmations, use smart defaults
- `--preset <name>` - Use a preset configuration (saas, landing, api, portfolio, experiment)
- `--name <name>` - Project name (skips name prompt)
- `--github` - Auto-create GitHub repo
- `--no-docs` - Skip syncing to docs.jbcloud.app (docs sync is ON by default)
- `--mobile` or `-m` - Include companion mobile app mockup and planning

**Quick Examples:**
```bash
/new-project                           # Full guided workflow
/new-project --quick                   # Fast mode with defaults
/new-project --preset saas             # SaaS starter
/new-project myapp --preset api -q     # Quick API project named "myapp"
/new-project myapp --mobile            # Include mobile app companion
/new-project myapp -q -m               # Quick mode with mobile app
```

---

## Quick Mode (--quick or preset specified)

If `--quick` flag or `--preset` is provided, skip to rapid scaffolding:

### Presets

| Preset | Framework | Database | Auth | Hosting | UI |
|--------|-----------|----------|------|---------|-----|
| `saas` | Next.js | Supabase | Supabase Auth | Vercel | shadcn/ui |
| `landing` | Astro | None | None | Cloudflare | Tailwind |
| `api` | Hono | Turso | JWT | Cloudflare Workers | None |
| `portfolio` | Astro | None | None | Cloudflare | Tailwind |
| `experiment` | Next.js | SQLite | None | Local | Tailwind |

### Quick Mode Flow

1. **Get project name** (from `--name` or prompt once)
2. **Get one-line description** (prompt once)
3. **Apply preset defaults** (no confirmations)
4. **Skip to Phase 6: SCAFFOLDING**
5. **Create project immediately**

If no preset specified with `--quick`, use `experiment` preset.

---

## Full Workflow Overview

```
Phase 1: BASICS → Phase 2: PLATFORM → Phase 3: STYLE GUIDE →
Phase 4: ARCHITECTURE → Phase 5: PLAN → Phase 6: SCAFFOLD →
Phase 6.5: MOBILE APP (optional) → Phase 7: READY
```

Each phase requires user approval before proceeding to the next (unless `--quick`).

**Mobile App Phase**: If `--mobile` flag is passed OR user requests during Phase 1, includes a companion mobile app mockup page and planning section.

---

## Phase 1: BASICS

Ask using AskUserQuestion:

1. **Project name** (kebab-case for directory)
2. **One-line description** - What does it do?
3. **Problem it solves** - Why build this?
4. **Target users** - Who is it for? (even "me learning" is valid)
5. **Project type** - App, marketing site, API, tool, experiment?
6. **Companion mobile app?** - Plan for a future mobile app companion? (Yes/No/Maybe later)
   - If Yes or `--mobile` flag: Include mobile app mockup page and planning in Phase 6.5

**Documentation sync is enabled by default.** Unless `--no-docs` flag is passed:
- Project documentation will be synced to docs.jbcloud.app
- Architecture, plan, and progress will be published as the project develops
- Use `/end` command to sync final state when ending a session
- Section will be automatically added to sidebar navigation

Store answers for use in later phases.

**Output**: Summary of project basics. Ask "Continue to Platform Selection?"

---

## Phase 2: PLATFORM SELECTION

For each decision, provide a recommendation based on the project type and basics gathered. Explain WHY you recommend it. User can accept or choose differently.

### Framework
Recommend based on project type:
- **Next.js** - Full-stack apps, SEO matters, hybrid rendering
- **Remix** - Form-heavy apps, progressive enhancement
- **Astro** - Content sites, marketing, blogs (minimal JS)
- **SvelteKit** - Lightweight apps, learning Svelte
- **Nuxt** - Vue ecosystem preference
- **Express/Fastify** - API-only backends
- **FastAPI** - Python APIs
- **Hono** - Edge-first, lightweight APIs

For experiments with no traffic: recommend Next.js (most resources) or Astro (simplest)

### Database
- **Supabase (Postgres)** - Default choice, auth included, real-time, generous free tier
- **Turso (SQLite)** - Edge-first, simple, great for experiments
- **PlanetScale (MySQL)** - Branching, scale later
- **MongoDB Atlas** - Document-based needs
- **SQLite (local)** - Truly simple experiments
- **None** - Static sites, client-only apps

### CMS (if content-heavy)
- **TheBCMS** - Headless CMS, good for structured content
- **Sanity** - Real-time, customizable studio
- **Contentful** - Enterprise-grade
- **Keystatic** - Git-based, markdown
- **None** - Most apps don't need a CMS

### Auth
Recommend based on database choice:
- **Supabase Auth** - If using Supabase DB (zero extra setup)
- **Clerk** - Fastest integration, polished UI, generous free tier
- **Better Auth** - Self-hosted, flexible, newer
- **NextAuth/Auth.js** - Custom providers, established
- **None** - Public apps, experiments without users

For experiments: Supabase Auth if using Supabase, otherwise Clerk

### Hosting
- **Vercel** - Default for Next.js, best DX
- **Cloudflare Pages** - Edge-first, generous free tier, good for Astro
- **xCloud** - User's preferred option
- **Railway** - Full-stack with databases
- **Fly.io** - Container-based, global distribution
- **Netlify** - Good for static/Jamstack

For experiments: Vercel (easy) or Cloudflare Pages (free)

### UI Library
- **Tailwind + shadcn/ui** - Default recommendation, you own the code
- **Tailwind + v0 components** - Rapid prototyping
- **Tailwind only** - Full control, minimal
- **Tailwind + daisyUI** - Pre-styled, quick

Default: Tailwind + shadcn/ui

### Icon Library
- **Lucide** - Default with shadcn, clean, MIT license
- **Heroicons** - Tailwind team, solid choice
- **Phosphor** - Flexible weights
- **Tabler** - Large set

Default: Lucide

**Output**: Complete platform summary table. Ask "Continue to Style Guide?"

---

## Phase 3: BRAND & STYLE GUIDE

Generate sensible defaults. User tweaks later.

### Default Color Palette

```js
// Neutral, professional defaults - user customizes in tailwind.config
colors: {
  // Primary - Blue (universally safe default)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  // Neutral - Slate (works with everything)
  // Use Tailwind's built-in slate scale

  // Semantic
  success: '#22c55e',  // green-500
  warning: '#f59e0b',  // amber-500
  error: '#ef4444',    // red-500
  info: '#3b82f6',     // blue-500
}
```

### Default Typography

```js
// Modern, readable defaults
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
}

// Type scale (Tailwind defaults are good)
// text-xs: 12px
// text-sm: 14px
// text-base: 16px
// text-lg: 18px
// text-xl: 20px
// text-2xl: 24px
// text-3xl: 30px
// text-4xl: 36px
```

### Default Spacing
Use Tailwind's default 4px base scale.

### Default Border Radius
```js
borderRadius: {
  DEFAULT: '0.5rem',  // 8px - modern, friendly
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
}
```

### Default Shadows
Use Tailwind defaults, prefer `shadow-sm` and `shadow-md`.

### Dark Mode
Default: Support both, system preference default.

**Output**: Summary of style defaults. Create mental note for Phase 6 scaffolding. Ask "Continue to Architecture?"

---

## Phase 4: ARCHITECTURE

Use the **architect** agent (Task tool with subagent_type: "architect").

Prompt the architect agent with all gathered context:
- Project basics (name, description, problem, users)
- Platform choices (framework, DB, auth, etc.)
- Style guide approach

The architect should produce:

### System Design Overview
- High-level architecture diagram (mermaid)
- Key components and their responsibilities
- Data flow

### Data Models
- Core entities and relationships
- Database schema design
- TypeScript types/interfaces

### API Structure (if applicable)
- Endpoints or server actions
- Request/response shapes
- Error handling approach

### File/Folder Structure
```
src/
├── app/              # Next.js app router
│   ├── (auth)/       # Auth-required routes
│   ├── (public)/     # Public routes
│   ├── api/          # API routes
│   └── style-guide/  # Style guide page
├── components/
│   ├── ui/           # shadcn components
│   └── [feature]/    # Feature components
├── lib/
│   ├── db/           # Database client, queries
│   ├── auth/         # Auth utilities
│   └── utils/        # Shared utilities
├── hooks/            # Custom React hooks
├── types/            # TypeScript types
└── styles/           # Global styles
```

**Output**: Create `docs/ARCHITECTURE.md` with full architecture document including mermaid diagrams. Ask "Continue to Implementation Plan?"

---

## Phase 5: IMPLEMENTATION PLAN

Use the **planner** agent (Task tool with subagent_type: "planner").

Prompt the planner with all context from previous phases.

The planner should produce:

### MVP Scope
- What's in v1 vs later
- Core features only

### Phased Breakdown
```
Phase 1: Foundation
- Project setup, dependencies
- Database schema, migrations
- Auth integration
- Style guide page

Phase 2: Core Features
- [Feature 1]
- [Feature 2]

Phase 3: Polish
- Error handling
- Loading states
- Edge cases

Phase 4: Launch Prep
- Testing
- Documentation
- Deployment
```

### Dependencies
- What blocks what
- Parallel work opportunities

### Risks
- Technical risks
- Mitigation strategies

**Output**: Create `docs/PLAN.md` with full implementation plan. Ask "Continue to Scaffolding?"

---

## Phase 6: SCAFFOLDING

Execute the actual project creation:

### 6.1 Create Directory & Git
```bash
mkdir {project-name}
cd {project-name}
git init
```

### 6.2 Create CLAUDE.md
Include all context gathered:
- Project basics
- Platform choices
- Architecture summary
- Link to docs/ARCHITECTURE.md and docs/PLAN.md

### 6.3 Create docs/
- Copy ARCHITECTURE.md content
- Copy PLAN.md content

### 6.4 Create .gitignore
Based on platform selection.

### 6.5 Create Style Guide Page

Create a style guide page that showcases all UI components. Location depends on framework:

**For Next.js (App Router)**: `src/app/style-guide/page.tsx`

The style guide page should include sections for:

1. **Colors** - All palette colors with swatches and CSS variable names
2. **Typography** - H1-H6, paragraph, small, code, links
3. **Spacing** - Visual representation of spacing scale
4. **Buttons** - All variants (primary, secondary, outline, ghost, destructive) × sizes × states
5. **Form Controls** - Input, textarea, select, checkbox, radio, toggle, slider
6. **Cards** - Basic, with header, interactive, with image
7. **Navigation** - Tabs, breadcrumbs, pagination
8. **Feedback** - Alert variants, badges, progress bars
9. **Overlays** - Modal preview, tooltip, popover
10. **Data Display** - Table, accordion, list
11. **Icons** - Sample of Lucide icons

Include component code snippets for easy copying.

### 6.6 Create Dev Button Component

Create a floating dev menu button with dropdown for developer tools:

```tsx
// src/components/dev-button.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Palette, Smartphone, ChevronUp } from 'lucide-react'

// Configure menu items based on project features
const menuItems = [
  {
    href: '/style-guide',
    label: 'Style Guide',
    icon: Palette,
    description: 'UI component library',
  },
  // Include mobile-app if companion app is enabled:
  // {
  //   href: '/mobile-app',
  //   label: 'Mobile App',
  //   icon: Smartphone,
  //   description: 'Companion app mockup',
  // },
]

export function DevButton() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (process.env.NODE_ENV !== 'development') return null

  return (
    <div ref={menuRef} className="fixed bottom-4 right-4 z-50">
      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="p-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors group"
              >
                <item.icon className="h-4 w-4 text-slate-500 group-hover:text-primary-400 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-800 transition-all border border-slate-700"
        title="Developer Tools"
      >
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <Palette className="h-5 w-5" />}
      </button>
    </div>
  )
}
```

Add to root layout (development only).

**If mobile app companion is enabled**, uncomment the mobile-app menu item.

### 6.7 Initial Commit
```bash
git add -A
git commit -m "chore: initialize project with architecture and style guide"
```

### 6.8 GitHub Actions Setup (Optional)

**Ask user:** "Would you like to set up GitHub Actions CI/CD workflows?"

If user confirms (or if `--quick` mode with production intent):

1. **Use /setup-github-actions command** with appropriate preset:
   - For Node.js: `--preset node`
   - For Python: `--preset python`
   - For documentation: `--preset docs`
   - Or use `--minimal` for just CI + Dependabot

2. **Workflows created:**
   - Essential: CI/Test, Dependabot
   - Recommended: Code Quality, Security Scan
   - Optional: Release Automation

3. **Commit workflows:**
   ```bash
   git add .github/
   git commit -m "ci: add github actions workflows and dependabot config"
   ```

**Output**: "GitHub Actions configured. Workflows will activate on next push."

**Skip this step if:**
- User declines
- Quick mode for experiments/personal projects (not production)

---

## Phase 6.5: MOBILE APP COMPANION (Optional)

**Skip this phase unless:**
- User selected "Yes" for companion mobile app in Phase 1
- `--mobile` flag was passed

This phase sets up planning and a mockup page for a future companion mobile app.

### 6.5.1 Create Mobile App Mockup Page

Create a "coming soon" page with phone mockup and feature preview:

**For Next.js (App Router)**: `src/app/(dashboard)/mobile-app/page.tsx` or `src/app/mobile-app/page.tsx`

```tsx
// src/app/mobile-app/page.tsx
'use client'

import { Smartphone, Bell, Globe, Shield, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Customize features based on project
const features = [
  {
    icon: Globe,
    title: 'Core Feature 1',
    description: 'Access key functionality on the go',
  },
  {
    icon: Bell,
    title: 'Push Notifications',
    description: 'Get alerted for important events',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Same security as the web app',
  },
]

export default function MobileAppPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {'{Project Name}'} Mobile
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Take {'{project}'} with you. Native apps for iOS and Android coming soon.
          </p>
        </div>

        {/* Phone Mockup */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-64 h-[500px] bg-slate-900 rounded-[3rem] border-4 border-slate-800 shadow-2xl overflow-hidden">
              <div className="absolute inset-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-[2rem] flex flex-col items-center justify-center">
                <div className="absolute top-3 left-0 right-0 flex justify-center">
                  <div className="w-20 h-6 bg-black rounded-full" />
                </div>
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{'{Project Name}'}</h3>
                  <p className="text-slate-400 text-sm">Mobile app in development</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-4 sm:grid-cols-3 mb-12">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="pt-6">
                <feature.icon className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card>
          <CardHeader>
            <CardTitle>Get Notified</CardTitle>
            <CardDescription>Be the first to know when the mobile app launches</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button>
                Notify Me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### 6.5.2 Update Dev Button Menu

Add mobile app to the dev button menu items:

```tsx
const menuItems = [
  {
    href: '/style-guide',
    label: 'Style Guide',
    icon: Palette,
    description: 'UI component library',
  },
  {
    href: '/mobile-app',
    label: 'Mobile App',
    icon: Smartphone,
    description: 'Companion app mockup',
  },
]
```

### 6.5.3 Add Mobile App Planning Section to PLAN.md

Append to `docs/PLAN.md`:

```markdown
## Mobile App Companion (Future)

### Platform Strategy
- **React Native** or **Expo** for cross-platform (iOS + Android)
- Share business logic with web app where possible
- Native feel with platform-specific UI patterns

### Core Features (Mobile MVP)
1. [Feature 1 - mobile-optimized version]
2. [Feature 2 - mobile-optimized version]
3. Push notifications
4. Offline support for key features

### Technical Considerations
- API: Same backend, mobile-specific endpoints if needed
- Auth: Deep link handling for OAuth flows
- Storage: Secure token storage (Keychain/Keystore)
- State: Consider shared state management approach

### Timeline
- Phase 1: Web app MVP complete
- Phase 2: Mobile app development
- Phase 3: Beta testing
- Phase 4: App Store / Play Store submission
```

### 6.5.4 Optional: Create Style Guide V2

If the project warrants a secondary design system (e.g., for the mobile app or a different theme):

Create `src/app/style-guide-v2/page.tsx` with an alternate theme (e.g., dark mode with gradient accents).

Add to dev button menu:
```tsx
{
  href: '/style-guide-v2',
  label: 'Style Guide V2',
  icon: Sparkles,
  description: 'Alternate theme',
},
```

**Output**: Report mobile app companion setup. Continue to documentation sync.

---

### 6.9 Sync to docs.jbcloud.app (DEFAULT - unless --no-docs)

Documentation sync happens automatically for all new projects.

Use the **jbdocs** agent (Task tool with subagent_type from agents/jbdocs.md) to:

1. Create project directory in jb-cloud-docs:
   ```bash
   mkdir -p /Users/jb/jb-cloud-docs/src/content/docs/{project-slug}
   ```

2. Generate documentation files:
   - `index.md` - Project overview with tech stack
   - `architecture.md` - From docs/ARCHITECTURE.md
   - `plan.md` - From docs/PLAN.md

3. **Register in sidebar** (CRITICAL - prevents orphaned pages):
   Add section to `astro.config.mjs` sidebar array:
   ```javascript
   {
     label: '{Project Name}',
     autogenerate: { directory: '{project-slug}' },
   },
   ```

4. Commit and push to jb-cloud-docs:
   ```bash
   cd /Users/jb/jb-cloud-docs
   git add src/content/docs/{project-slug}/ astro.config.mjs
   git commit -m "docs({project-slug}): add initial project documentation"
   git push origin main
   ```

5. Add documentation flag to project's CLAUDE.md:
   ```markdown
   ## Documentation
   - Sync to docs.jbcloud.app: Yes
   - Project slug: {project-slug}
   - Docs URL: https://docs.jbcloud.app/{project-slug}/
   ```

6. Verify deployment (wait ~1 min for Cloudflare Pages):
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://docs.jbcloud.app/{project-slug}/
   ```

**Output**: Report documentation sync status. Ask "Run framework CLI to complete setup?"

---

## Phase 7: READY

### Optional: Run Framework CLI
If user confirms, run the appropriate setup:
```bash
# Next.js
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Then install shadcn
npx shadcn@latest init
```

### Handoff
Tell the user:
- Project is ready at `{path}`
- Review `docs/ARCHITECTURE.md` for system design
- Review `docs/PLAN.md` for implementation phases
- Visit `/style-guide` to see/tweak components
- **If mobile app enabled:** Visit `/mobile-app` for companion app mockup
- Click the floating dev button (bottom-right) for quick access to dev tools
- **If GitHub Actions enabled:** Workflows will activate on next push. Create releases with `/create-release`
- Start with `/tdd` to begin implementation
- Use `/end` when finishing a session to sync docs and save progress
- Documentation published to `https://docs.jbcloud.app/{project-slug}/`
- Use `/jbdocs` anytime to manually sync documentation updates

### Available Commands Reference

Display the commands cheatsheet:

```
## Available Commands

### Development
| Command | Purpose |
|---------|---------|
| /tdd | Test-driven development workflow |
| /plan | Create implementation plan |
| /code-review | Review code for quality/security |
| /fix-issue <#> | Analyze and fix GitHub issue |

### Git & Workflow
| Command | Purpose |
|---------|---------|
| /commit | Create conventional commit |
| /create-pr | Create pull request |
| /create-release | Create and publish release with git tag |
| /setup-github-actions | Configure CI/CD workflows |
| /standup | Generate standup notes |

### Session Management
| Command | Purpose |
|---------|---------|
| /context-save | Save session for later |
| /context-restore | Resume saved session |
| /end | End session cleanly |
| /remind | Quick context reminder |

### Quality & Deployment
| Command | Purpose |
|---------|---------|
| /deploy-check | Pre-deployment checklist |
| /deps-audit | Audit dependencies |
| /security-review | Security analysis |
| /secrets-audit | Scan for hardcoded secrets & 1Password sync |
| /env-example | Generate .env.example from 1Password |

### Documentation
| Command | Purpose |
|---------|---------|
| /jbdocs | Sync to docs.jbcloud.app |
| /update-docs | Update project docs |

Run /help for full command list.
```

---

## Example Session

```
User: /new-project

Claude: Let's set up your new project. First, some basics:

What's the project name?
> habit-tracker

One-line description?
> A simple app to track daily habits with streaks

What problem does it solve?
> I want to build better habits but forget to track them

Who is it for?
> Personal use, maybe share with friends later

Project type?
> App

---
Phase 1 Complete: habit-tracker
A personal habit tracking app with streaks.
Continue to Platform Selection? [Yes]
---

Based on your project, here are my recommendations:

FRAMEWORK: Next.js
→ Full-stack capability, great for apps with auth and data

DATABASE: Supabase
→ Postgres + Auth + Real-time, perfect for habit tracking

AUTH: Supabase Auth
→ Already using Supabase, zero extra setup

HOSTING: Vercel
→ Best Next.js experience, free tier is plenty

UI: Tailwind + shadcn/ui
→ Professional components you own

[Continue through remaining phases...]
```

### Quick Mode Example

```
User: /new-project myapp --preset saas --quick

Claude: Creating "myapp" with SaaS preset...

Platform:
- Framework: Next.js (App Router)
- Database: Supabase (Postgres)
- Auth: Supabase Auth
- Hosting: Vercel
- UI: Tailwind + shadcn/ui

Scaffolding project...
✓ Created directory: myapp/
✓ Created CLAUDE.md
✓ Created docs/ARCHITECTURE.md
✓ Created docs/PLAN.md
✓ Initialized git repository
✓ Created initial commit
✓ Synced to docs.jbcloud.app/myapp/
✓ Added to sidebar navigation

Ready! Next steps:
1. cd myapp
2. npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
3. npx shadcn@latest init
4. Run /tdd to start building

Documentation: https://docs.jbcloud.app/myapp/
```

### Quick Mode with Mobile App Example

```
User: /new-project myapp --preset saas -q --mobile

Claude: Creating "myapp" with SaaS preset + mobile app companion...

Platform:
- Framework: Next.js (App Router)
- Database: Supabase (Postgres)
- Auth: Supabase Auth
- Hosting: Vercel
- UI: Tailwind + shadcn/ui
- Mobile: Companion app planned (React Native/Expo)

Scaffolding project...
✓ Created directory: myapp/
✓ Created CLAUDE.md
✓ Created docs/ARCHITECTURE.md
✓ Created docs/PLAN.md (includes mobile app section)
✓ Created /style-guide page
✓ Created /mobile-app mockup page
✓ Created dev-button with dropdown menu
✓ Initialized git repository
✓ Created initial commit
✓ Synced to docs.jbcloud.app/myapp/

Ready! Next steps:
1. cd myapp
2. npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
3. npx shadcn@latest init
4. Visit /mobile-app to see companion app mockup
5. Click dev button (bottom-right) for quick access to dev tools
6. Run /tdd to start building

Documentation: https://docs.jbcloud.app/myapp/
```

---

## Notes

- Each phase waits for explicit user approval (unless `--quick`)
- Recommendations are based on project context
- User can override any recommendation
- Style guide uses sensible defaults - tweak after creation
- Architecture and Plan docs become living documentation
- Dev button only shows in development mode
- Use presets for common project types to skip configuration

---

## Arguments

$ARGUMENTS
