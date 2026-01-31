---
description: Automated PR merge routine with multi-level review gates (Gemini, security, GitHub Actions)
---

# Routine: Merge

Smart PR merge workflow with configurable review gates. Waits for external reviews (Gemini, security audits), evaluates feedback, implements necessary changes, and merges only when all gates pass.

## Usage

```bash
/routine-merge                  # Medium level (recommended)
/routine-merge --light          # Quick merge (basic checks only)
/routine-merge --medium         # Standard review gates
/routine-merge --thorough       # Comprehensive review suite
/routine-merge --custom         # Interactive mode - choose which checks to run
/routine-merge --dry-run        # Preview what would run without executing
```

## Arguments

Parse `$ARGUMENTS` for:
- `--light` or `-l` - Minimal checks (build, tests, basic security)
- `--medium` or `-m` - Standard checks (adds Gemini review, security quick scan)
- `--thorough` or `-t` - Full suite (all reviews, comprehensive security, GitHub Actions validation)
- `--custom` or `-c` - Interactive selection of checks
- `--dry-run` or `-d` - Show what would run without executing
- `--skip-wait` - Don't wait for external reviews (advanced users only)
- `--auto-fix` - Automatically apply low-risk fixes from reviews

## Routine Levels

### Light (--light)
Fast merge for low-risk changes (docs, tests, small fixes):
1. Build verification (`npm run build`)
2. Test suite (`npm test`)
3. Basic security scan (no hardcoded secrets)
4. Git status check
5. **Merge if all pass**

**Use when:**
- Documentation updates
- Test additions
- Minor bug fixes
- Dependency updates

---

### Medium (--medium) - DEFAULT
Balanced review for most feature work:
1. All Light checks
2. **Gemini AI Review** (`/gemini-review`)
   - Wait for feedback
   - Evaluate recommendations
   - Implement CRITICAL and HIGH priority items
3. **Security Quick Scan** (`/security --quick`)
   - OWASP Top 10 check
   - Dependency vulnerabilities
4. TypeScript type checking
5. Lint validation
6. **Re-run reviews if changes made**
7. **Merge if all pass**

**Use when:**
- New features
- Refactoring
- API changes
- Most PR merges

---

### Thorough (--thorough)
Comprehensive review for high-risk changes:
1. All Medium checks
2. **Full Security Audit** (`/security`)
   - Deep vulnerability scan
   - Authentication/authorization review
   - Input validation audit
   - SQL injection check
   - XSS vulnerability scan
3. **GitHub Actions Validation**
   - Check all workflows passing
   - Review deployment previews
   - Validate E2E tests
4. **Bundle size analysis**
5. **Performance regression check**
6. **Breaking change detection**
7. **Re-run ALL reviews if changes made**
8. **Merge only after ALL gates pass**

**Use when:**
- Authentication/security features
- Database migrations
- Breaking API changes
- Production hotfixes
- Releases

---

### Custom (--custom)
Interactive mode - user chooses which checks:
1. Show checklist with all available checks
2. User selects which to run
3. Save selection as preset (optional)
4. Execute chosen checks

---

## Configuration

Routines are configured in `~/.claude/routines/merge.json`:

```json
{
  "enabled": true,
  "default_level": "medium",
  "auto_fix": false,
  "wait_for_reviews": true,
  "checks": {
    "build": {
      "enabled": true,
      "required": true,
      "command": "npm run build"
    },
    "tests": {
      "enabled": true,
      "required": true,
      "command": "npm test",
      "min_coverage": 80
    },
    "gemini_review": {
      "enabled": true,
      "required": false,
      "wait": true,
      "implement_severity": ["CRITICAL", "HIGH"]
    },
    "security": {
      "enabled": true,
      "required": true,
      "levels": {
        "light": "basic",
        "medium": "quick",
        "thorough": "full"
      }
    },
    "github_actions": {
      "enabled": true,
      "required": true,
      "wait_for_completion": true
    }
  },
  "merge": {
    "method": "squash",
    "delete_branch": true,
    "auto_merge": false
  }
}
```

## Workflow Steps

### 1. Pre-Flight Checks

```bash
# Verify PR exists
gh pr view --json number,title,state

# Check if PR is ready for merge
gh pr checks

# Verify branch is up to date
git fetch origin
git diff origin/main...HEAD
```

**Block if:**
- No PR found for current branch
- PR is already merged/closed
- Branch has conflicts with main
- Required reviewers haven't approved

---

### 2. Run Review Gates (Based on Level)

For each enabled check in the routine:

**Example: Gemini Review**
```bash
# Trigger Gemini review
/gemini-review

# Wait for response (poll for completion)
# Parse feedback JSON

# Evaluate severity levels:
# - CRITICAL: MUST implement
# - HIGH: SHOULD implement
# - MEDIUM: Consider implementing
# - LOW: Optional improvement

# Ask user for confirmation on HIGH items
# Auto-implement CRITICAL items
```

**Example: Security Scan**
```bash
# Run appropriate security level
/security --quick   # For medium
/security           # For thorough

# Wait for results
# If CRITICAL or HIGH vulnerabilities found:
#   - Implement fixes
#   - Re-run security scan
#   - Re-run Gemini review (if code changed)
```

---

### 3. Implement Feedback

When changes are needed:

1. **Categorize feedback:**
   - CRITICAL: Auto-implement (or block merge)
   - HIGH: Ask user for confirmation
   - MEDIUM: Show to user, offer to implement
   - LOW: Log for future consideration

2. **Implement changes:**
   - Create new commits for each logical fix
   - Use descriptive commit messages referencing feedback
   - Example: `fix: address Gemini security concern - sanitize user input`

3. **Re-run affected reviews:**
   - If security changes → Re-run security scan
   - If code changes → Re-run Gemini review
   - If tests added → Re-run test suite

---

### 4. GitHub Actions Validation

```bash
# Get latest workflow runs for this PR
gh run list --branch $(git branch --show-current) --limit 5

# Check status of required workflows
gh pr checks --watch

# Wait for completion if --thorough
# Show live status updates
```

**Block if:**
- Required workflows failing
- Workflows still running (unless --skip-wait)

---

### 5. Final Review Summary

Show comprehensive summary before merge:

```
## Merge Routine Summary

**PR**: #123 - Add user authentication
**Level**: Medium
**Branch**: feature/auth → main

### Review Results

#### ✅ Passed Checks
- Build: 8.2s (no errors)
- Tests: 47/47 passing, 94% coverage
- Security: No critical vulnerabilities
- TypeScript: No type errors
- Lint: No issues

#### 🔄 Implemented Feedback
1. [CRITICAL] Gemini: Added input sanitization to login endpoint
2. [HIGH] Security: Updated bcrypt to v5.1.1 (CVE fix)
3. [MEDIUM] Gemini: Improved error messages for better UX

#### ⏭️ Deferred Items
1. [LOW] Gemini: Consider adding rate limiting (tracked in #124)
2. [LOW] Bundle size: +2.3KB (within acceptable range)

#### 🚀 GitHub Actions
- Build & Test: ✅ Passed (2m 14s)
- E2E Tests: ✅ Passed (4m 32s)
- Deploy Preview: ✅ Ready (https://preview-123.vercel.app)

### Merge Plan
- Method: Squash and merge
- Delete branch: Yes
- Commits: 8 commits → 1 squashed commit

Ready to merge? [Yes/No/Show Diff]
```

---

### 6. Execute Merge

```bash
# If user confirms:
gh pr merge --squash --delete-branch

# Or if auto_merge enabled in config:
gh pr merge --squash --delete-branch --auto

# Monitor merge
git fetch origin
git log origin/main --oneline -5
```

**Post-merge:**
- Show merge commit SHA
- Show deployment status (if applicable)
- Offer to delete local branch
- Log routine metrics for future optimization

---

## Interactive Decision Points

Use `AskUserQuestion` for these decisions:

### Gemini HIGH severity items
```
Question: Gemini recommends these HIGH priority changes:
Options:
  - Implement all recommendations (Recommended)
  - Review and select specific items
  - Skip and merge anyway (risky)
  - Cancel merge to implement manually
```

### Security vulnerabilities found
```
Question: Security scan found 2 HIGH vulnerabilities. How to proceed?
Options:
  - Auto-fix vulnerabilities (Recommended)
  - Show vulnerability details
  - Skip and merge anyway (NOT RECOMMENDED)
  - Cancel merge
```

### GitHub Actions failing
```
Question: E2E tests are failing. Options?
Options:
  - Wait for tests to complete
  - Cancel merge and investigate
  - Merge anyway (override - requires justification)
```

---

## Error Handling

**No PR found:**
```
Error: No PR found for branch 'feature/auth'
Create PR first: gh pr create
Or specify PR number: /routine-merge #123
```

**Gemini timeout:**
```
Warning: Gemini review timed out after 2 minutes.
Options:
  - Continue without Gemini feedback
  - Wait longer (up to 5 min)
  - Cancel and retry later
```

**Conflicts detected:**
```
Error: Branch has conflicts with main
Resolve conflicts first:
  git fetch origin
  git merge origin/main
  # Fix conflicts
  git commit
```

**Security vulnerabilities:**
```
BLOCKED: CRITICAL security issues found:
1. Hardcoded API key in auth.ts:42
2. SQL injection risk in user-query.ts:18

These MUST be fixed before merge.
Running /security-reviewer agent to fix...
```

---

## Routine State Management

State is saved to `~/.claude/routines/state/merge-{pr-number}.json`:

```json
{
  "pr": 123,
  "level": "medium",
  "started_at": "2026-01-30T20:00:00Z",
  "checks_completed": [
    {
      "name": "build",
      "status": "passed",
      "duration_ms": 8234
    },
    {
      "name": "gemini_review",
      "status": "completed_with_changes",
      "feedback": [...],
      "implemented": ["item1", "item2"]
    }
  ],
  "changes_made": [
    {
      "commit": "abc123",
      "description": "fix: sanitize user input",
      "triggered_by": "gemini_review"
    }
  ],
  "final_status": "ready_to_merge"
}
```

This allows:
- Resuming interrupted routines
- Auditing what was checked
- Learning patterns for optimization

---

## Configuration Management

### Enable/Disable Routine

```bash
/routine-merge --disable    # Turn off routine system
/routine-merge --enable     # Re-enable
```

### Customize Default Level

```bash
/routine-merge --set-default light      # Make light the default
/routine-merge --set-default thorough   # Make thorough the default
```

### Save Custom Preset

After running `--custom` and selecting checks:
```
Save this configuration as a preset? [Yes/No]
Preset name: quick-hotfix
Saved! Use with: /routine-merge --preset quick-hotfix
```

---

## Examples

### Example 1: Standard Feature Merge
```
User: /routine-merge

Claude: Starting Medium merge routine for PR #123...

1. ✅ Build passed (8.2s)
2. ✅ Tests passed (47/47, 94% coverage)
3. 🔄 Running Gemini review...

   Gemini feedback received (12 items):
   - 2 CRITICAL
   - 3 HIGH
   - 5 MEDIUM
   - 2 LOW

   Implementing 2 CRITICAL items automatically...
   ✅ Added input sanitization
   ✅ Fixed auth token validation

   3 HIGH priority items need review:
   [Shows items with AskUserQuestion]

User: [Selects "Implement all"]

Claude: ✅ Implemented HIGH items
        🔄 Re-running Gemini review...
        ✅ Gemini: All critical issues resolved

4. ✅ Security quick scan passed
5. ✅ TypeScript check passed
6. ✅ GitHub Actions: All workflows passing

All gates passed! Ready to merge.
[Shows summary]

Merge now? [Yes/No]

User: Yes

Claude: ✅ Merged PR #123 (squash: abc123)
        ✅ Deleted branch feature/auth
        🚀 Deploy triggered: https://vercel.com/deploy/abc123

Routine complete!
```

### Example 2: Thorough Pre-Release Merge
```
User: /routine-merge --thorough

Claude: Starting THOROUGH merge routine for PR #456...

This will run comprehensive checks:
- Build, tests, security (full audit)
- Gemini review
- GitHub Actions (wait for completion)
- Bundle size analysis
- Performance checks
- Breaking change detection

Estimated time: 8-12 minutes

Continue? [Yes/No]

User: Yes

Claude: [Runs all checks with detailed progress]

⚠️ Security audit found 1 HIGH vulnerability:
    - lodash < 4.17.21 (Prototype pollution)

Auto-fixing with npm audit fix...
✅ Fixed and re-ran security scan

⚠️ Bundle size increased by 12.5KB (+8%)
    Review impact before merging

⚠️ Gemini flagged potential breaking change:
    - API response format changed in user.service.ts

This needs documentation. Continue? [Yes/Add Docs/Cancel]

User: Add Docs

Claude: [Opens editor for migration guide]
        ✅ Migration guide added

All checks passed with manual intervention.
Ready to merge? [Yes/No/Review Summary]
```

### Example 3: Quick Docs Update
```
User: /routine-merge --light

Claude: Starting LIGHT merge routine for PR #789...

1. ✅ Build passed (2.1s)
2. ✅ Tests passed (no new tests needed - docs only)
3. ✅ No secrets detected
4. ✅ Git status clean

Light routine complete! Ready to merge.
Merge? [Yes/No]

User: Yes

Claude: ✅ Merged PR #789
        ✅ Deleted branch docs/update-readme
```

---

## Integration with Existing Commands

Routine automatically uses:
- `/gemini-review` - AI code review
- `/security` - Security audits
- `/deploy-check` - Pre-deployment validation
- `/code-review` - Local quality checks

---

## Metrics & Learning

Routine tracks:
- Average time per level
- Most common feedback categories
- Auto-fix success rate
- Merge success rate per level

Use `/routine-stats` to view metrics.

---

## Safety Features

1. **Never merge with CRITICAL issues** - Blocks merge automatically
2. **Always wait for required workflows** - Unless explicitly overridden
3. **Prompt before implementing HIGH severity changes** - User confirmation required
4. **State preservation** - Can resume after interruption
5. **Rollback capability** - Keep state for post-merge analysis

---

## Related Commands

- `/gemini-review` - Standalone Gemini review
- `/security` - Security audit suite
- `/deploy-check` - Pre-deployment checks
- `/routine-stats` - View routine metrics
- `/routine-config` - Configure routine settings

---

## Notes

- Routine state is preserved between runs
- Can be interrupted and resumed (Ctrl+C safe)
- Learns from past runs to optimize future merges
- Integrates with existing git hooks
- Works with any PR (not just current branch)
- Supports GitHub, GitLab (coming soon), Bitbucket (coming soon)
