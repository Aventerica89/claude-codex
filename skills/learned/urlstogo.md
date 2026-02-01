# Project: URLsToGo

## Context
- Type: URL shortener (Cloudflare Worker)
- Stack: Cloudflare Workers, D1 database, Clerk authentication
- Status: In production
- URL: urlstogo.cloud

## Key Decisions
- **Color System**: Migrated from HSL to OKLCH for better perceptual uniformity
- **Authentication**: Using Clerk with Google OAuth (replaced Cloudflare Access)
- **Email Fetching**: Fetch from Clerk API (`createClerkClient().users.getUser()`) not JWT
- **Branding**: Rebranded from "LinkShort" to "URLsToGo"
- **Theme Source**: Used tweakcn.com for purple/blue OKLCH theme

## Recent Progress
- [x] Upgraded admin UI to vibrant purple/blue OKLCH theme
- [x] Fixed category color parsing errors (500 on link creation)
- [x] Fixed design system page OKLCH variables
- [x] Fixed user email display (was showing Clerk ID)
- [x] Updated all branding to URLsToGo
- [x] Merged PR #55 and PR #56

## Learned Patterns

### OKLCH Color System
When migrating to OKLCH colors:
1. Update CSS variable format: `--color: 0.6850 0.2190 307.0000` (lightness, chroma, hue)
2. Use `oklch(var(--color))` in CSS, not `hsl(var(--color))`
3. Convert ALL color references - mixing HSL and OKLCH causes parsing errors
4. Category colors need conversion too, not just theme colors

### Clerk Authentication
- JWTs don't include email by default (security)
- Must fetch user details from API:
  ```javascript
  const clerkClient = createClerkClient({ secretKey });
  const user = await clerkClient.users.getUser(userId);
  return user.emailAddresses?.[0]?.emailAddress;
  ```

### Testing Production Deployments
- Use curl to verify pages load: `curl -s -o /dev/null -w "%{http_code}" {url}`
- Grep for specific content: `curl -s {url} | grep "pattern"`
- Check color format: `curl -s {url} | grep -o "--cat-work: [^;]*"`

### Gemini Code Assist Integration
- Automatically reviews PRs on GitHub
- Provides severity levels: CRITICAL, HIGH, MEDIUM, LOW
- CRITICAL issues must be fixed before merge
- Check reviews at PR URL: `gh api graphql` to fetch review comments

## Next Session
- Start with: New feature development or maintenance
- No blockers - all systems working

## Files Structure
- `src/index.js` - Main worker (~6000 lines)
- `migrations.sql` - Auto-runs on deploy
- `design-system.html` - UI playground
- `.github/workflows/deploy.yml` - CI/CD pipeline

## Deployment
- Automatic via GitHub Actions on push to main
- Runs migrations and deploys worker
- No manual steps needed after initial secrets setup
