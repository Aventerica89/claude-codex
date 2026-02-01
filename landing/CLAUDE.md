# Claude Codex Landing Page

## Project Status: Paused - Resume in CLI

### Next Session Priority
1. **Deploy to production** - Run `vercel` CLI or import to Vercel/Netlify web UI
2. Pick next feature: Auth, PWA, or global codex commands

### Completed
- Astro + React Islands setup with Tailwind, Framer Motion
- Hero with floating integration icons (Helicone style)
- Features section (23 commands, 12 agents, 11 skills, 12 rules)
- Component Marketplace with ComponentCard (visual previews, checkboxes, badges)
- Brain Database with searchable/sortable content
- **EnvVarAssistant** product section:
  - Vercel + Cloudflare env setup mockups (official brand colors)
  - 1Password CLI terminal with Touch ID auth modal
  - 3 balanced feature cards
- PWA manifest with SVG icons
- Deployment configs (vercel.json, netlify.toml)

### Pending
- **Deploy to production** - configs ready, just needs:
  - Vercel: Import repo, set root directory to `landing`
  - Netlify: Connect GitHub, set base directory to `landing`
- Authentication with Turso/Lucia
- PWA service worker
- Global codex commands (make brain-data.ts commands executable across repos)

### Key Files
- `src/components/EnvVarAssistant.tsx` - New product showcase
- `src/components/ComponentCard.tsx` - v0.dev inspired card with previews
- `src/components/ComponentMarketplace.tsx` - Uses ComponentCard
- `src/lib/registries.ts` - Component registry with `RegistryComponentWithRegistry`
- `src/lib/brain-data.ts` - All codex content (commands, agents, skills, rules)

### Branch
`claude/create-landing-page-MbRCw`

### Dev Commands
```bash
cd landing
npm run dev    # localhost:4321
npm run build  # builds to dist/
```

### Brand Colors Used
- Vercel: #0070F3 (blue), #171717 (dark)
- Cloudflare: #F38020 (orange), #FAAE40 (yellow)
