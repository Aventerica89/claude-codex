# Vercel CLI Environment Variables Contain Literal Newlines

**Extracted:** 2026-01-29
**Context:** Environment variables not being recognized after adding them via Vercel CLI

## Problem

After adding environment variables to Vercel using `echo | vercel env add`, the variables contain literal `\n` characters and quotes in `.env.local`:

```bash
# Wrong approach that causes the issue
echo "libsql://database.turso.io" | vercel env add TURSO_DATABASE_URL production
```

**Result in `.env.local` after `vercel env pull`:**
```bash
TURSO_DATABASE_URL="libsql://database.turso.io\n"
TURSO_AUTH_TOKEN="eyJhbGciOiJ...\n"
ENCRYPTION_SECRET="gUD1DrXEdzQI...\n"
```

**Symptom:**
- Environment variables appear to be set but aren't recognized
- Drizzle config throws "TURSO_DATABASE_URL environment variable is required"
- Process.env reads contain quotes and literal `\n` at the end

## Solution

### Option 1: Clean up .env.local after pulling (Quick Fix)

Remove quotes and `\n` characters manually:

```bash
# Before
TURSO_DATABASE_URL="libsql://database.turso.io\n"

# After
TURSO_DATABASE_URL=libsql://database.turso.io
```

### Option 2: Use printf instead of echo (Prevention)

```bash
# Use printf which doesn't add newlines
printf "libsql://database.turso.io" | vercel env add TURSO_DATABASE_URL production
```

### Option 3: Use -n flag with echo (Prevention)

```bash
# Use -n flag to prevent newline
echo -n "libsql://database.turso.io" | vercel env add TURSO_DATABASE_URL production
```

### Option 4: Use vercel env add interactively (Best for Manual Setup)

```bash
# Run without piping - it will prompt for the value
vercel env add TURSO_DATABASE_URL production
# Then paste the value when prompted
```

### Option 5: Export directly and skip .env.local (For Running Commands)

```bash
# For one-off commands like migrations
export TURSO_DATABASE_URL=libsql://database.turso.io
export TURSO_AUTH_TOKEN=eyJhbGciOiJ...
npm run db:push
```

## Example Workflow

```bash
# 1. Add environment variables to Vercel (use printf or interactive)
printf "libsql://wp-manager.turso.io" | vercel env add TURSO_DATABASE_URL production
printf "libsql://wp-manager.turso.io" | vercel env add TURSO_DATABASE_URL preview
printf "libsql://wp-manager.turso.io" | vercel env add TURSO_DATABASE_URL development

# 2. Pull environment variables
vercel env pull .env.local --environment=production

# 3. Verify no newlines in the file
cat .env.local | grep "\\n"

# 4. If newlines found, clean them up
sed -i '' 's/\\n"$//' .env.local
sed -i '' 's/^"\(.*\)"$/\1/' .env.local

# 5. Run your command
npm run db:push
```

## When to Use

- When adding environment variables to Vercel via CLI
- After running `vercel env pull` if variables aren't being recognized
- When you see literal `\n` in .env.local file
- When environment variables work in Vercel but fail locally

## Prevention Checklist

- [ ] Use `printf` instead of `echo` for piping values
- [ ] OR use `echo -n` to prevent trailing newlines
- [ ] OR use interactive mode (no piping)
- [ ] Verify .env.local doesn't have `\n` after pulling
- [ ] Test that environment variables are readable: `node -p 'process.env.TURSO_DATABASE_URL'`

## Related Issues

- Applies to any CLI tool that accepts piped input (not Vercel-specific)
- Similar issues can occur with Netlify CLI, Railway CLI, etc.
- The root cause is `echo` adding a newline by default
