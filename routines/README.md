# Routines System

Automated multi-step workflows with configurable gates and decision points.

## What Are Routines?

Routines are intelligent, multi-step automation workflows that:
- **Wait for external feedback** (Gemini, security scans, CI/CD)
- **Make decisions** based on severity/priority
- **Implement changes** automatically or with confirmation
- **Re-run checks** after changes
- **Block merges** when critical issues found
- **Learn and optimize** over time

## Available Routines

### `/routine-merge` - PR Merge Workflow
Comprehensive PR review and merge automation with three levels:

| Level | Use Case | Checks | Time |
|-------|----------|--------|------|
| **Light** | Docs, tests, small fixes | Build, tests, basic security | ~2 min |
| **Medium** | Most features | Light + Gemini + security scan | ~5 min |
| **Thorough** | Auth, migrations, releases | Medium + full security + performance | ~10 min |

**Configuration:** `~/.claude/routines/merge.json`

---

## Routine Levels Explained

### Light
**When to use:** Low-risk changes
- Documentation updates
- Test additions
- CSS/styling tweaks
- Dependency updates (patch versions)

**What it checks:**
- ✅ Build succeeds
- ✅ Tests pass
- ✅ No hardcoded secrets
- ✅ Git status clean

**Time:** ~2 minutes

---

### Medium (Default)
**When to use:** Most feature work
- New features
- Bug fixes
- Refactoring
- API changes (non-breaking)

**What it checks:**
- ✅ All Light checks
- ✅ Gemini AI review (waits for feedback)
- ✅ Security quick scan (OWASP Top 10)
- ✅ TypeScript type checking
- ✅ Lint validation
- ✅ GitHub Actions status

**Decision points:**
- Gemini HIGH severity items (asks user)
- Security vulnerabilities (auto-fix or block)
- GitHub Actions failures (wait or cancel)

**Time:** ~5 minutes (includes wait time for reviews)

---

### Thorough
**When to use:** High-risk changes
- Authentication/authorization features
- Database migrations
- Breaking API changes
- Payment processing
- Production hotfixes
- Pre-release merges

**What it checks:**
- ✅ All Medium checks
- ✅ Full security audit (comprehensive scan)
- ✅ Bundle size analysis
- ✅ Performance regression tests
- ✅ Breaking change detection
- ✅ All GitHub Actions (waits for completion)

**Additional gates:**
- Migration guide required for breaking changes
- Bundle size increase limit (10%)
- Lighthouse performance threshold (90+)
- Core Web Vitals validation

**Time:** ~10 minutes

---

## Configuration

### Global Settings (`merge.json`)

```json
{
  "default_level": "medium",     // Which level runs by default
  "auto_fix": false,             // Auto-apply low-risk fixes
  "wait_for_reviews": true,      // Wait for Gemini/security feedback
  "merge": {
    "method": "squash",          // squash, merge, rebase
    "delete_branch": true,       // Delete after merge
    "auto_merge": false,         // Merge without confirmation
    "confirmation_required": true
  }
}
```

### Check Configuration

Each check can be customized:

```json
{
  "gemini_review": {
    "enabled": true,
    "required": false,             // Block merge if fails?
    "wait": true,                  // Wait for completion?
    "timeout_seconds": 180,        // Max wait time
    "implement_severity": [        // Auto-implement these
      "CRITICAL",
      "HIGH"
    ],
    "prompt_severity": ["MEDIUM"], // Ask user about these
    "log_severity": ["LOW"],       // Just log these
    "levels": ["medium", "thorough"] // Which levels include this
  }
}
```

---

## Custom Presets

Save custom check combinations for specific scenarios:

### Example: Hotfix Preset
```json
{
  "name": "hotfix",
  "description": "Fast merge for critical production fixes",
  "checks": ["build", "tests", "security_scan"],
  "merge": {
    "method": "merge",
    "delete_branch": false,
    "confirmation_required": true
  }
}
```

**Use:** `/routine-merge --preset hotfix`

### Example: Release Preset
```json
{
  "name": "release",
  "description": "Comprehensive checks before release",
  "checks": [
    "build",
    "tests",
    "typescript",
    "lint",
    "security_scan",
    "gemini_review",
    "github_actions",
    "bundle_size",
    "breaking_changes",
    "performance"
  ],
  "merge": {
    "method": "squash",
    "delete_branch": true,
    "confirmation_required": true
  },
  "require_all_pass": true
}
```

**Use:** `/routine-merge --preset release`

---

## State Management

Routines save state to `~/.claude/routines/state/merge-{pr-number}.json`:

```json
{
  "pr": 123,
  "branch": "feature/auth",
  "level": "medium",
  "started_at": "2026-01-30T20:00:00Z",
  "updated_at": "2026-01-30T20:05:23Z",
  "status": "in_progress",
  "checks_completed": [
    {
      "name": "build",
      "status": "passed",
      "duration_ms": 8234,
      "timestamp": "2026-01-30T20:01:08Z"
    },
    {
      "name": "gemini_review",
      "status": "completed_with_changes",
      "duration_ms": 45123,
      "feedback_count": 12,
      "implemented": 5,
      "deferred": 7
    }
  ],
  "changes_made": [
    {
      "commit": "abc123",
      "message": "fix: sanitize user input",
      "triggered_by": "gemini_review",
      "severity": "CRITICAL"
    }
  ],
  "final_status": "ready_to_merge"
}
```

**Benefits:**
- Resume interrupted routines
- Audit what was checked
- Track implementation decisions
- Learn patterns for optimization

---

## How It Works

### 1. Initialization
```
User: /routine-merge --medium

Claude:
- Detects current branch
- Finds associated PR
- Loads medium level config
- Shows preview of checks
```

### 2. Execute Checks
```
For each enabled check:
  Run check
  If blocking failure → Stop and report
  If warning → Log and continue
  If passes → Mark complete
```

### 3. External Reviews (Gemini, Security)
```
Trigger external review
Wait for completion (with timeout)
Parse feedback/results
Categorize by severity:
  - CRITICAL → Auto-implement or block
  - HIGH → Prompt user for decision
  - MEDIUM → Show and offer to implement
  - LOW → Log for future consideration
```

### 4. Implement Changes
```
If changes needed:
  Make code changes
  Create commits
  Push to branch
  Re-run affected checks
  Loop until all pass or blocked
```

### 5. Final Merge Decision
```
Show comprehensive summary
Ask for confirmation (unless auto_merge)
Execute merge (squash/merge/rebase)
Clean up (delete branch if configured)
Save metrics and state
```

---

## Decision Flow

```
Start Routine
     |
     v
Run Checks → All Pass? → YES → Show Summary → Merge
     |           |
     NO          v
     |        Blocked? → YES → Stop and Report Issues
     |           |
     |          NO
     |           |
     v           v
Critical?   Fixable?
     |           |
    YES         YES
     |           |
     v           v
  Block     Implement Fix
             Re-run Checks
                  |
                  v
              Loop Back
```

---

## Examples

### Light Merge (Docs Update)
```bash
/routine-merge --light

# Runs:
# - Build (2s)
# - Tests (5s)
# - Secrets scan (1s)
# - Git check (1s)
#
# Total: ~9 seconds
# Auto-merges if all pass
```

### Medium Merge (Feature)
```bash
/routine-merge

# Runs:
# - All light checks (9s)
# - Gemini review (30-60s wait)
# - Security quick scan (15s)
# - TypeScript check (10s)
# - Lint (5s)
# - GitHub Actions check (5s)
#
# Waits for Gemini feedback
# Asks about HIGH severity items
# Auto-implements CRITICAL items
# Re-runs reviews if code changed
#
# Total: ~3-5 minutes
```

### Thorough Merge (Release)
```bash
/routine-merge --thorough

# Runs:
# - All medium checks (~3m)
# - Full security audit (60s)
# - Bundle size analysis (30s)
# - Performance checks (45s)
# - Breaking change detection (20s)
# - Wait for all GitHub Actions (varies)
#
# Multiple decision points
# Requires migration guide for breaking changes
# Blocks on performance regressions
# Comprehensive summary before merge
#
# Total: ~8-12 minutes
```

---

## Tips

### When to Use Each Level

**Light:**
- Green builds on CI already
- No code changes (just docs/tests)
- Hotfix with time pressure
- Trust your judgment

**Medium:**
- Default for all feature work
- Want AI review but not full audit
- Balanced speed vs thoroughness
- 90% of PRs

**Thorough:**
- Security-sensitive features
- Breaking changes
- Pre-release merges
- High-risk refactoring
- When in doubt

### Customizing for Your Project

1. **Edit `merge.json`** to adjust:
   - Default level
   - Auto-fix behavior
   - Merge method
   - Required vs optional checks

2. **Create presets** for common scenarios:
   - Hotfix preset (fast merge)
   - Release preset (comprehensive)
   - Dependency update preset

3. **Adjust severity thresholds:**
   - What gets auto-implemented
   - What requires confirmation
   - What gets logged

### Optimizing Wait Times

- Use `--skip-wait` for trusted changes (overrides review waiting)
- Enable `auto_fix: true` for low-risk automated fixes
- Set realistic `timeout_seconds` for each check
- Use `--dry-run` first to preview without waiting

---

## Troubleshooting

### Routine Times Out
```
Error: Gemini review timed out after 180s

Fix:
1. Increase timeout in merge.json
2. Use --skip-wait flag
3. Run /gemini-review separately first
```

### GitHub Actions Required but Not Configured
```
Error: GitHub Actions check enabled but no workflows found

Fix:
1. Disable in merge.json: "github_actions.enabled": false
2. Set up workflows: /setup-github-actions
```

### Too Many Checks Failing
```
Multiple checks failing - routine blocked

Fix:
1. Run /deploy-check first to catch issues
2. Use --dry-run to preview without running
3. Lower level: try --light instead of --thorough
```

### State File Corrupted
```
Error: Cannot resume - state file corrupted

Fix:
rm ~/.claude/routines/state/merge-{pr}.json
# Restart routine from scratch
```

---

## Future Routines (Coming Soon)

- `/routine-deploy` - Deployment verification and rollout
- `/routine-release` - Release creation and publishing
- `/routine-rollback` - Safe rollback with verification
- `/routine-test` - Comprehensive test suite execution
- `/routine-refactor` - Refactoring with safety checks

---

## Architecture

### Directory Structure
```
~/.claude/routines/
├── README.md              # This file
├── merge.json             # Merge routine config
├── deploy.json            # Deploy routine config (future)
├── presets/
│   ├── hotfix.json
│   ├── release.json
│   └── custom.json
└── state/
    ├── merge-123.json
    ├── merge-456.json
    └── deploy-production.json
```

### Commands
```
/routine-merge              # Main merge routine
/routine-config             # Configure routine settings
/routine-stats              # View metrics
/routine-preset save        # Save custom preset
/routine-preset list        # List presets
/routine-preset load        # Load preset
```

---

## Metrics & Learning

Routines track:
- **Execution time** per check and total
- **Failure rates** by check type
- **Auto-fix success** rates
- **Merge success** rates by level
- **Most common issues** found

View with: `/routine-stats`

Routines learn to:
- **Suggest optimal level** based on PR type
- **Skip redundant checks** when safe
- **Predict likely issues** before running checks
- **Recommend presets** for common patterns

---

## Philosophy

Routines embody these principles:

1. **Smart Automation** - Automate the tedious, not the thinking
2. **Decision Points** - Always ask for high-risk decisions
3. **Safety First** - Block merges when critical issues found
4. **Learning System** - Get smarter with each run
5. **Transparency** - Always show what's happening and why
6. **Flexibility** - Multiple levels and full customization

**Goal:** Make PR merges safer, faster, and more consistent without removing human judgment.
