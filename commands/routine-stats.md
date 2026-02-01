---
description: View routine execution metrics, trends, and optimization suggestions
---

# Routine Stats

View metrics and analytics for routine executions. Track success rates, common issues, time trends, and get optimization suggestions.

## Usage

```bash
/routine-stats                   # Overall summary
/routine-stats --merge           # Merge routine stats only
/routine-stats --detailed        # Detailed breakdown
/routine-stats --recent          # Last 10 executions
/routine-stats --trends          # Time-based trends
/routine-stats --checks          # Per-check statistics
/routine-stats --recommendations # Optimization suggestions
```

## Arguments

Parse `$ARGUMENTS` for:
- `--merge` or `-m` - Show merge routine stats
- `--detailed` or `-d` - Detailed breakdown with charts
- `--recent <n>` or `-r <n>` - Show last N executions (default: 10)
- `--trends` or `-t` - Show trends over time
- `--checks` or `-c` - Per-check statistics
- `--recommendations` - Get optimization suggestions
- `--export` - Export stats as JSON/CSV
- `--reset` - Reset all statistics (asks for confirmation)
- `--since <date>` - Stats since specific date (e.g., --since 2026-01-01)
- `--level <level>` - Filter by routine level

---

## Statistics Overview

### Summary View (Default)

```bash
/routine-stats
```

Output:
```
# Routine Statistics

**Period**: Last 30 days
**Total Executions**: 47

## Merge Routine

**Executions**: 47
**Success Rate**: 93.6% (44/47)
**Avg Duration**: 4m 23s

### By Level
| Level | Executions | Success | Avg Time |
|-------|-----------|---------|----------|
| Light | 12 | 100% | 1m 45s |
| Medium | 28 | 92.9% | 4m 12s |
| Thorough | 7 | 85.7% | 9m 48s |

### Most Common Issues
1. GitHub Actions timeout (8 occurrences)
2. Gemini HIGH severity items requiring review (12 occurrences)
3. Security vulnerabilities found (5 occurrences)

### Trends
- ✅ Success rate improving (90% → 94% this week)
- ⚠️ Average time increasing (3m 50s → 4m 23s)
- ✅ Fewer security issues (8 → 5 this week)
```

---

## Detailed Statistics

### Recent Executions

```bash
/routine-stats --recent
```

Output:
```
# Recent Routine Executions (Last 10)

| Date | PR | Level | Duration | Status | Issues |
|------|-----|-------|----------|--------|--------|
| 01/30 20:05 | #456 | Medium | 4m 12s | ✅ Merged | 0 |
| 01/30 18:23 | #454 | Thorough | 12m 8s | ✅ Merged | 2 MEDIUM |
| 01/30 15:47 | #452 | Medium | 3m 54s | ✅ Merged | 1 HIGH |
| 01/30 14:12 | #450 | Light | 1m 32s | ✅ Merged | 0 |
| 01/30 11:05 | #448 | Medium | TIMEOUT | ❌ Failed | Gemini timeout |
| 01/29 19:34 | #446 | Thorough | 10m 23s | ✅ Merged | 3 HIGH |
| 01/29 17:12 | #444 | Medium | 4m 8s | ✅ Merged | 0 |
| 01/29 15:28 | #442 | Light | 1m 48s | ✅ Merged | 0 |
| 01/29 13:45 | #440 | Medium | 5m 2s | ⚠️ Blocked | CRITICAL security |
| 01/29 10:15 | #438 | Medium | 4m 15s | ✅ Merged | 1 MEDIUM |

**Click any PR** to view detailed execution log
```

### Per-Check Statistics

```bash
/routine-stats --checks
```

Output:
```
# Check Performance

| Check | Runs | Pass Rate | Avg Time | Failures | Auto-Fixed |
|-------|------|-----------|----------|----------|------------|
| Build | 47 | 100% | 8.2s | 0 | - |
| Tests | 47 | 97.9% | 12.3s | 1 | 0 |
| TypeScript | 35 | 94.3% | 9.8s | 2 | 0 |
| Lint | 35 | 91.4% | 4.2s | 3 | 3 |
| Secrets Scan | 47 | 100% | 1.2s | 0 | - |
| Gemini Review | 35 | 88.6% | 45.2s | 4 (timeout) | - |
| Security Scan | 42 | 85.7% | 18.4s | 6 | 4 |
| GitHub Actions | 35 | 80.0% | 2m 14s | 7 | 0 |
| Bundle Size | 7 | 85.7% | 32.1s | 1 | 0 |
| Performance | 7 | 71.4% | 48.3s | 2 | 0 |

**Issues:**
- Gemini Review: 4 timeouts (increase timeout?)
- GitHub Actions: 7 failures (investigate workflows)
- Performance: 2 failures (Lighthouse < 90)
```

---

## Trends & Analytics

### Time Trends

```bash
/routine-stats --trends
```

Output:
```
# Routine Trends

## Success Rate Over Time
```
Week 1: ████████░░ 80% (8/10)
Week 2: █████████░ 90% (9/10)
Week 3: ██████████ 100% (10/10)
Week 4: █████████░ 92% (11/12)
```

**Trend**: ✅ Improving (+15% month-over-month)

## Average Duration
```
Week 1: ████░░░░░░ 4m 45s
Week 2: ████░░░░░░ 4m 12s
Week 3: ███░░░░░░░ 3m 58s
Week 4: ████░░░░░░ 4m 23s
```

**Trend**: ⚠️ Slightly increasing this week (+6%)

## Issues Found
```
CRITICAL: ▂▁▁▁▁▁▁▁ (declining - good!)
HIGH:     ▃▄▃▂▃▂▁▂ (stable)
MEDIUM:   ▅▆▄▅▃▄▅▆ (slightly increasing)
LOW:      ▇▆▇▅▆▇▆▅ (stable)
```

## Auto-Fix Success
```
Lint:     ████████████ 100% (12/12)
Security: ██████░░░░░░ 66% (4/6)
Overall:  ████████░░░░ 88% (16/18)
```
```

---

## Optimization Recommendations

```bash
/routine-stats --recommendations
```

Output:
```
# Optimization Recommendations

Based on 47 routine executions in the last 30 days:

## 1. Increase Gemini Timeout
**Current**: 180s
**Recommended**: 240s
**Reason**: 4 timeouts in last 30 days (11% of Gemini reviews)
**Impact**: Reduce failures by ~8%

Apply:
/routine-config --set checks.gemini_review.timeout_seconds 240

---

## 2. Consider Skipping Lint for Light Level
**Current**: Lint enabled for all levels
**Recommended**: Disable for light level
**Reason**: 100% pass rate, adds 4.2s, rarely finds issues in docs/tests
**Impact**: Reduce light routine time by ~20%

Apply:
/routine-config --set checks.lint.levels '["medium","thorough"]'

---

## 3. Enable Auto-Fix for Security
**Current**: auto_fix_npm_audit = false
**Recommended**: auto_fix_npm_audit = true
**Reason**: All 4 npm audit issues were auto-fixable
**Impact**: Reduce manual intervention by ~10%

Apply:
/routine-config --set checks.security_scan.auto_fix_npm_audit true

---

## 4. Use Preset for Dependency Updates
**Pattern Detected**: 8 PRs with titles containing "bump", "update deps"
**Recommendation**: Create/use deps-update preset
**Impact**: Optimized checks for dependency PRs, save ~2m per execution

Use:
/routine-merge --preset deps-update

---

## 5. Investigate GitHub Actions Failures
**Issue**: 7 failures in 35 runs (20% failure rate)
**Common failures**:
  - E2E tests (4 failures)
  - Deploy preview (2 failures)
  - Linting (1 failure)
**Recommendation**: Review workflow stability
**Impact**: Improve success rate by ~15%

---

## 6. Consider Default Level Adjustment
**Current Default**: medium
**Analysis**:
  - Light: 12 runs, 100% success, fast (1m 45s)
  - Medium: 28 runs, 93% success, moderate (4m 12s)
  - Thorough: 7 runs, 86% success, slow (9m 48s)

**Recommendation**:
  - 40% of medium runs had zero issues → could use light
  - Keep medium as default for safety
  - Consider auto-suggesting level based on PR

---

## Summary
- Implementing all recommendations could:
  - ✅ Reduce average execution time by ~18%
  - ✅ Improve success rate by ~12%
  - ✅ Reduce manual interventions by ~15%
```

---

## Export Statistics

### JSON Export

```bash
/routine-stats --export
```

Creates: `~/.claude/routines/stats-export-{timestamp}.json`

```json
{
  "exported_at": "2026-01-30T20:30:00Z",
  "period": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-01-30T23:59:59Z"
  },
  "summary": {
    "total_executions": 47,
    "success_rate": 0.936,
    "avg_duration_seconds": 263,
    "by_level": {
      "light": {
        "count": 12,
        "success_rate": 1.0,
        "avg_duration_seconds": 105
      },
      "medium": {
        "count": 28,
        "success_rate": 0.929,
        "avg_duration_seconds": 252
      },
      "thorough": {
        "count": 7,
        "success_rate": 0.857,
        "avg_duration_seconds": 588
      }
    }
  },
  "checks": [...],
  "issues": [...],
  "trends": [...]
}
```

### CSV Export

```bash
/routine-stats --export --format csv
```

Creates: `~/.claude/routines/stats-export-{timestamp}.csv`

Useful for:
- Importing to spreadsheets
- Creating custom charts
- Sharing with team
- Compliance/audit trails

---

## Filter Statistics

### By Date Range

```bash
/routine-stats --since 2026-01-15
```

Shows stats from Jan 15 onwards.

### By Level

```bash
/routine-stats --level thorough
```

Shows only thorough routine stats.

### By Status

```bash
/routine-stats --status failed
```

Shows only failed routines (for debugging).

---

## Reset Statistics

```bash
/routine-stats --reset
```

**Warning:**
```
This will permanently delete all routine statistics.

Stats include:
- 47 routine executions
- Per-check metrics
- Trend data
- Optimization insights

Execution state files will be preserved.

Create backup first? [Yes/No/Cancel]
```

If Yes:
1. Creates backup: `~/.claude/routines/stats-backup-{timestamp}.json`
2. Deletes statistics
3. Preserves state files

---

## State File Details

View detailed execution log:

```bash
/routine-stats --pr 456
```

Output:
```
# Routine Execution: PR #456

**Status**: ✅ Merged
**Level**: Medium
**Branch**: feature/auth → main
**Started**: 2026-01-30 20:00:15
**Completed**: 2026-01-30 20:04:27
**Duration**: 4m 12s

## Timeline

20:00:15 - Started medium routine
20:00:23 - ✅ Build passed (8.2s)
20:00:35 - ✅ Tests passed (12.1s, 94% coverage)
20:00:37 - 🔄 Starting Gemini review...
20:01:22 - ✅ Gemini review completed (45.3s)
             - 2 CRITICAL items auto-implemented
             - 1 HIGH item user confirmed
             - 3 MEDIUM items deferred
20:01:35 - ✅ Security scan passed (13.2s)
20:01:45 - ✅ TypeScript check passed (9.8s)
20:01:50 - ✅ Lint passed (4.2s)
20:02:15 - 🔄 Waiting for GitHub Actions...
20:04:20 - ✅ GitHub Actions passed (2m 5s)
20:04:25 - User confirmed merge
20:04:27 - ✅ PR merged (squash: abc123)

## Changes Made
1. fix: sanitize user input (triggered by Gemini CRITICAL)
   Commit: abc123

2. fix: update bcrypt to v5.1.1 (triggered by Security HIGH)
   Commit: def456

## Deferred Items
- [MEDIUM] Consider adding rate limiting → Tracked in #457
- [MEDIUM] Improve error messages
- [LOW] Add more test cases

## Metrics
- Total checks: 8
- Checks passed: 8
- Auto-fixes applied: 2
- User interventions: 1
- Re-runs required: 2 (after implementing changes)
```

---

## Learning Insights

The statistics system provides insights like:

### Pattern Recognition
```
Detected Pattern: PRs from user @alice rarely have issues
Suggestion: Consider light level for @alice's PRs
```

### Check Optimization
```
Insight: TypeScript check never fails for test-only PRs
Suggestion: Skip TypeScript for PRs touching only *.test.ts files
```

### Timing Optimization
```
Insight: Gemini review averages 45s, timeout is 180s
Suggestion: Reduce timeout to 90s for faster failures
```

---

## Examples

### Example 1: Weekly Review
```
User: /routine-stats --since 2026-01-24

Claude: [Shows stats for last week]

**Week Summary**:
- 12 executions
- 92% success rate
- 4m 15s average

**Improvements**:
- Success rate up 5% from previous week
- Average time down 8s

**Issues**:
- 1 Gemini timeout (increased timeout recommended)
```

### Example 2: Check Specific Issue
```
User: /routine-stats --checks

Claude: [Shows per-check stats]

User: Why is GitHub Actions failing 20%?

Claude: Analyzing GitHub Actions failures...

7 failures in 35 runs:
1. E2E tests failing on webkit (4×)
2. Deploy preview timeout (2×)
3. Lint job OOM (1×)

Recommendations:
- Fix webkit E2E flakiness
- Increase deploy timeout
- Increase lint job memory
```

### Example 3: Optimization
```
User: /routine-stats --recommendations

Claude: [Shows 6 recommendations]

User: Apply recommendations 1 and 3

Claude: Applying:
1. Increase Gemini timeout: 180s → 240s
3. Enable auto-fix for security

✅ Configuration updated
✅ Changes will apply to next routine execution

Would you like to test with a dry run?
/routine-merge --dry-run
```

---

## Related Commands

- `/routine-merge` - Run merge routine
- `/routine-config` - Configure routine settings

---

## Notes

- Statistics are updated after each routine execution
- Trends require minimum 5 executions
- Recommendations require minimum 10 executions
- Export includes all raw data for custom analysis
- Reset preserves execution state files (only deletes aggregated stats)
