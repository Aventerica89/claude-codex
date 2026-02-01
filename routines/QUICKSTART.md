# Routine System - Quick Start

Get started with automated PR merge workflows in 2 minutes.

## What is this?

An intelligent PR merge system that:
- Waits for AI reviews (Gemini, security scans)
- Auto-implements critical fixes
- Asks you about high-priority items
- Re-runs checks after changes
- Only merges when all gates pass

## Quick Start

### 1. Basic Usage

```bash
# Merge with default settings (medium level)
/routine-merge

# Fast merge for docs/tests
/routine-merge --light

# Comprehensive pre-release merge
/routine-merge --thorough
```

That's it! The routine handles everything else.

---

## What Happens

### Light (~2 minutes)
```
1. ✅ Build
2. ✅ Tests
3. ✅ Security scan (basic)
4. ✅ Merge!
```

### Medium (~5 minutes) - DEFAULT
```
1. ✅ Build
2. ✅ Tests
3. 🔄 Gemini review (waits for feedback)
   - Auto-implements CRITICAL items
   - Asks about HIGH items
4. ✅ Security scan (quick)
5. ✅ TypeScript check
6. ✅ GitHub Actions
7. 🔄 Re-run if changes made
8. ✅ Merge!
```

### Thorough (~10 minutes)
```
1. ✅ All medium checks
2. ✅ Full security audit
3. ✅ Bundle size check
4. ✅ Performance tests
5. ✅ Breaking change detection
6. 🔄 Re-run ALL checks if changes made
7. ✅ Merge!
```

---

## Decision Points

You'll be asked about:
- **HIGH severity** items from Gemini
- **Security vulnerabilities** that can't auto-fix
- **GitHub Actions failures**
- **Bundle size increases** > 10%
- **Breaking changes** (migration guide required)

Everything else is automatic.

---

## When to Use Each Level

| Situation | Level | Why |
|-----------|-------|-----|
| Fix typo in README | Light | No code changes |
| Add new feature | Medium | Want AI review |
| Update auth system | Thorough | Security-critical |
| Bump dependencies | Medium | Balance safety & speed |
| Pre-release merge | Thorough | Zero compromises |
| Hotfix production | Light | Speed matters |

**Default to Medium** when unsure.

---

## Presets

Pre-configured for common scenarios:

```bash
# Fast merge for hotfixes
/routine-merge --preset hotfix

# Comprehensive pre-release
/routine-merge --preset release

# Optimized for dependency updates
/routine-merge --preset deps-update
```

---

## Configuration

### Change Default Level

```bash
/routine-config --set default_level thorough
```

### View Current Config

```bash
/routine-config
```

### Enable Auto-Fix

```bash
/routine-config --set auto_fix true
```

---

## View Statistics

```bash
# Overall stats
/routine-stats

# Recent executions
/routine-stats --recent

# Optimization tips
/routine-stats --recommendations
```

---

## Common Scenarios

### Scenario 1: Simple Docs Update
```
You: /routine-merge --light

Claude:
  ✅ Build (2s)
  ✅ Tests (5s)
  ✅ Security (1s)

  Ready to merge? Yes

  ✅ Merged!
```

### Scenario 2: Feature with Gemini Feedback
```
You: /routine-merge

Claude:
  ✅ Build (8s)
  ✅ Tests (12s)
  🔄 Gemini review...

  Gemini found 2 CRITICAL issues:
  - Missing input sanitization
  - Weak password validation

  Auto-implementing fixes...
  ✅ Fixed

  Gemini found 1 HIGH priority item:
  - Consider adding rate limiting

  Implement? [Yes/No/Later]

You: Later

Claude:
  ✅ Tracked in issue #457

  Re-running Gemini review...
  ✅ All critical issues resolved

  ✅ Security scan passed
  ✅ TypeScript passed
  ✅ GitHub Actions passed

  Ready to merge? Yes

  ✅ Merged!
```

### Scenario 3: Blocked by Security
```
You: /routine-merge --thorough

Claude:
  ✅ Build
  ✅ Tests
  ✅ Gemini review
  ❌ Security scan FAILED

  CRITICAL: Hardcoded API key found
    File: src/auth.ts:42

  This MUST be fixed before merge.

  Running security-reviewer agent...
  ✅ Fixed - moved to environment variable

  Re-running security scan...
  ✅ Passed

  [Continues with remaining checks...]
```

---

## Dry Run (Preview)

Not sure what will run?

```bash
/routine-merge --dry-run
```

Shows:
- Which checks will run
- Estimated time
- What you'll be asked about
- No actual execution

---

## Tips

1. **Start with Medium** - Good default for most PRs
2. **Use Light for docs** - Saves time, still safe
3. **Use Thorough for releases** - Worth the extra time
4. **Check stats weekly** - Optimize your workflow
5. **Create presets** - For repeated scenarios

---

## Advanced

### Skip Review Wait (risky!)
```bash
/routine-merge --skip-wait
```

Doesn't wait for Gemini/security feedback. Fast but less safe.

### Auto-Merge (very risky!)
```bash
/routine-config --set merge.auto_merge true
```

Merges without asking. Only for trusted automated PRs.

### Custom Checks
```bash
/routine-merge --custom
```

Interactive - choose exactly which checks to run.

---

## Troubleshooting

### Timeout Errors
```
Error: Gemini review timed out

Fix: /routine-config --set checks.gemini_review.timeout_seconds 300
```

### GitHub Actions Failing
```
Error: GitHub Actions required but not configured

Fix:
1. Disable: /routine-config --set checks.github_actions.enabled false
2. Or set up: /setup-github-actions
```

### Too Slow
```
Routine taking too long?

- Use --light for simple changes
- Enable auto_fix to reduce confirmations
- Skip optional checks
- Create custom preset
```

---

## Next Steps

1. Try it: `/routine-merge`
2. Check stats: `/routine-stats`
3. Customize: `/routine-config`
4. Create preset: `/routine-config --create-preset`

---

## Help

- `/routine-merge --help` - Full command reference
- `~/.claude/routines/README.md` - Complete documentation
- `/routine-stats --recommendations` - Personalized tips

---

## Philosophy

**The routine system is designed to:**
- Make merges **safer** (catch issues before they hit main)
- Make merges **faster** (automation + smart decisions)
- Make merges **smarter** (learn from past executions)

**It does NOT:**
- Replace human judgment (you still decide on HIGH items)
- Merge without all required checks passing
- Skip security for speed

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/routine-merge` | Run merge routine (default: medium) |
| `/routine-merge --light` | Fast merge (docs, tests) |
| `/routine-merge --thorough` | Comprehensive (releases) |
| `/routine-merge --preset <name>` | Use saved preset |
| `/routine-merge --dry-run` | Preview without running |
| `/routine-config` | View/edit configuration |
| `/routine-stats` | View metrics & trends |

---

**Ready?** Run `/routine-merge` on your next PR!
