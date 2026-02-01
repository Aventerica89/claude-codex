# Routine System Architecture

Technical overview of how the routine system works.

## System Components

```
~/.claude/routines/
├── README.md              # Full documentation
├── QUICKSTART.md          # 2-minute getting started guide
├── ARCHITECTURE.md        # This file - technical details
├── merge.json             # Merge routine configuration
├── presets/               # Saved preset configurations
│   ├── hotfix.json
│   ├── release.json
│   └── deps-update.json
└── state/                 # Execution state (one file per PR)
    ├── merge-123.json
    └── merge-456.json
```

## Commands

```
~/.claude/commands/
├── routine-merge.md       # Main merge routine command
├── routine-config.md      # Configuration management
└── routine-stats.md       # Metrics and analytics
```

---

## Execution Flow

### High-Level Flow

```
User Invokes /routine-merge
         |
         v
Load Configuration
  - Read merge.json
  - Apply level (light/medium/thorough)
  - Load preset if specified
         |
         v
Initialize State
  - Create state/{pr}.json
  - Record start time
  - Set status: "in_progress"
         |
         v
Execute Checks (in order)
  ┌──────────────┐
  │ For each     │
  │ enabled      │
  │ check:       │
  └──────────────┘
         |
         v
    Run Check ──> Pass? ──> Continue
         |           |
         |           └──> Fail & Required? ──> BLOCK
         |
         v
    Record Result
    Update State
         |
         v
External Reviews (Gemini, Security)
  - Trigger review
  - Poll for completion (with timeout)
  - Parse feedback/results
  - Categorize by severity
         |
         v
Decision Points
  - CRITICAL → Auto-implement or BLOCK
  - HIGH → Prompt user (AskUserQuestion)
  - MEDIUM → Show, offer to implement
  - LOW → Log for later
         |
         v
Implement Changes?
  - Yes → Make changes
  - Yes → Create commits
  - Yes → Re-run affected checks
  - Yes → Loop back to Execute Checks
  - No → Continue
         |
         v
All Checks Pass?
  - Yes → Show summary
  - Yes → Ask for merge confirmation
  - Yes → Execute merge
  - No → BLOCK, show issues
         |
         v
Post-Merge
  - Delete branch (if configured)
  - Save final state
  - Update statistics
  - Show completion message
```

---

## Check Execution

Each check follows this pattern:

```typescript
interface Check {
  name: string
  enabled: boolean
  required: boolean
  timeout_seconds: number
  levels: Level[]

  async execute(): Promise<CheckResult>
}

interface CheckResult {
  status: 'passed' | 'failed' | 'blocked' | 'skipped'
  duration_ms: number
  message?: string
  details?: any
  auto_fixable?: boolean
}
```

### Check Lifecycle

```
1. Pre-Check
   - Verify check is enabled for this level
   - Check prerequisites
   - Start timer

2. Execute
   - Run check (command, API call, etc.)
   - Monitor for timeout
   - Capture output

3. Parse Result
   - Determine pass/fail
   - Extract details (errors, warnings)
   - Identify if auto-fixable

4. Post-Check
   - Record duration
   - Update state file
   - Log to console
   - Trigger next check or decision point
```

---

## External Review Integration

### Gemini Review

```
1. Trigger
   POST /api/gemini-review
   Body: { pr: 123, files: [...], diff: "..." }

2. Poll
   GET /api/gemini-review/status/{request_id}
   Every 5s, up to timeout_seconds

3. Parse Response
   {
     "status": "completed",
     "feedback": [
       {
         "severity": "CRITICAL",
         "file": "auth.ts",
         "line": 42,
         "issue": "Missing input sanitization",
         "suggestion": "Use validator.escape()"
       }
     ]
   }

4. Categorize & Act
   - CRITICAL → Auto-implement or block
   - HIGH → AskUserQuestion
   - MEDIUM → Show, offer to implement
   - LOW → Log to state file
```

### Security Scan

```
1. Execute
   /security --quick  (for medium)
   /security          (for thorough)

2. Parse Output
   - Parse OWASP findings
   - Check npm audit results
   - Scan for hardcoded secrets

3. Auto-Fix (if enabled)
   - npm audit fix
   - Remove hardcoded secrets → env vars
   - Update vulnerable dependencies

4. Block on Critical
   If critical vulnerabilities remain:
     - Show details
     - Block merge
     - Suggest fixes
```

---

## State Management

### State File Schema

```typescript
interface RoutineState {
  // Metadata
  pr: number
  branch: string
  level: 'light' | 'medium' | 'thorough'
  started_at: string  // ISO 8601
  updated_at: string
  completed_at?: string
  status: 'in_progress' | 'completed' | 'failed' | 'blocked'

  // Execution
  checks_completed: CheckExecution[]
  checks_pending: string[]
  current_check?: string

  // Changes
  changes_made: Change[]
  re_runs: number

  // Results
  final_status?: 'merged' | 'blocked' | 'cancelled'
  merge_commit?: string
  blocked_reason?: string

  // Metrics
  total_duration_ms?: number
  user_interventions: number
}

interface CheckExecution {
  name: string
  status: 'passed' | 'failed' | 'blocked' | 'skipped'
  started_at: string
  completed_at: string
  duration_ms: number
  output?: string
  error?: string
  auto_fixed?: boolean
}

interface Change {
  commit: string
  message: string
  triggered_by: string  // Which check triggered this
  severity?: string     // If from review
  files_changed: string[]
  timestamp: string
}
```

### State Transitions

```
                    ┌─────────────┐
                    │  NOT STARTED│
                    └──────┬──────┘
                           │ /routine-merge invoked
                           v
                    ┌─────────────┐
                    │ IN_PROGRESS │◄──┐
                    └──────┬──────┘   │
                           │          │ re-run checks
                           │          │
        ┌──────────────────┼──────────┴────────┐
        │                  │                   │
        v                  v                   v
  ┌──────────┐      ┌───────────┐      ┌──────────┐
  │ BLOCKED  │      │ COMPLETED │      │  FAILED  │
  └────┬─────┘      └─────┬─────┘      └────┬─────┘
       │                  │                  │
       │                  v                  │
       │           ┌─────────────┐           │
       │           │   MERGED    │           │
       │           └─────────────┘           │
       │                                     │
       └─────────────────┬───────────────────┘
                         │ cleanup
                         v
                   ┌──────────┐
                   │ ARCHIVED │
                   └──────────┘
```

---

## Configuration System

### Configuration Hierarchy

```
1. Default Config (hardcoded fallback)
        ↓
2. Global Config (~/.claude/routines/merge.json)
        ↓
3. Project Config (project/.claude/routines/merge.json)
        ↓
4. Preset Config (~/.claude/routines/presets/{name}.json)
        ↓
5. CLI Arguments (--light, --thorough, etc.)
```

Later configs override earlier ones.

### Config Loading

```typescript
function loadConfig(args: Arguments): Config {
  let config = DEFAULT_CONFIG

  // Load global
  if (exists('~/.claude/routines/merge.json')) {
    config = merge(config, load('~/.claude/routines/merge.json'))
  }

  // Load project
  if (exists('project/.claude/routines/merge.json')) {
    config = merge(config, load('project/.claude/routines/merge.json'))
  }

  // Load preset
  if (args.preset) {
    const preset = load(`~/.claude/routines/presets/${args.preset}.json`)
    config = merge(config, preset)
  }

  // Apply CLI args
  if (args.level) {
    config.level = args.level
  }

  // Validate
  validate(config)

  return config
}
```

---

## Statistics & Learning

### Metrics Collection

After each routine execution:

```typescript
function recordMetrics(state: RoutineState) {
  const stats = loadStats()

  stats.executions.push({
    pr: state.pr,
    level: state.level,
    timestamp: state.completed_at,
    duration_ms: state.total_duration_ms,
    status: state.final_status,
    checks: state.checks_completed.map(c => ({
      name: c.name,
      duration_ms: c.duration_ms,
      status: c.status
    })),
    changes_made: state.changes_made.length,
    user_interventions: state.user_interventions
  })

  updateAggregates(stats)
  saveStats(stats)
}
```

### Learning Algorithm

```typescript
function generateRecommendations(stats: Statistics): Recommendation[] {
  const recommendations = []

  // Pattern: Frequent timeouts
  if (stats.checks.gemini_review.timeout_rate > 0.1) {
    recommendations.push({
      priority: 'high',
      type: 'config_change',
      check: 'gemini_review',
      current: stats.config.checks.gemini_review.timeout_seconds,
      suggested: stats.config.checks.gemini_review.timeout_seconds * 1.5,
      reason: `${stats.checks.gemini_review.timeout_count} timeouts in last ${stats.total_executions} executions`,
      impact: 'Reduce failures by ~10%'
    })
  }

  // Pattern: Always passing check
  if (stats.checks.lint.pass_rate === 1.0 && stats.checks.lint.executions > 20) {
    recommendations.push({
      priority: 'medium',
      type: 'optimization',
      check: 'lint',
      suggestion: 'Consider disabling for light level',
      reason: '100% pass rate, rarely finds issues',
      impact: 'Reduce light routine time by ~20%'
    })
  }

  // Pattern: All issues auto-fixable
  if (stats.checks.security_scan.auto_fix_rate === 1.0) {
    recommendations.push({
      priority: 'medium',
      type: 'config_change',
      check: 'security_scan',
      suggestion: 'Enable auto_fix_npm_audit',
      reason: 'All vulnerabilities were auto-fixable',
      impact: 'Reduce manual intervention by ~10%'
    })
  }

  // More patterns...

  return recommendations.sort((a, b) =>
    PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority]
  )
}
```

---

## Integration Points

### GitHub Integration

```bash
# PR detection
gh pr view --json number,title,state,headRefName

# Check status
gh pr checks --watch

# Merge
gh pr merge --squash --delete-branch

# Actions monitoring
gh run list --branch $BRANCH --limit 5
gh run watch $RUN_ID
```

### Git Operations

```bash
# Status
git status --porcelain

# Commit changes
git add .
git commit -m "fix: {message}"

# Push
git push origin $BRANCH

# Fetch latest
git fetch origin
git diff origin/main...HEAD
```

### Skill/Agent Integration

```bash
# Trigger Gemini review
/gemini-review

# Security scan
/security --quick
/security

# Code review
/code-review

# Security reviewer agent
Task(subagent_type="security-reviewer", ...)
```

---

## Error Handling

### Error Recovery

```typescript
async function executeRoutine(config: Config): Promise<RoutineResult> {
  const state = initializeState(config)

  try {
    for (const check of config.checks) {
      try {
        const result = await executeCheck(check, state)
        state.checks_completed.push(result)

        if (result.status === 'failed' && check.required) {
          state.status = 'blocked'
          state.blocked_reason = `Required check failed: ${check.name}`
          return saveAndExit(state)
        }
      } catch (error) {
        if (error instanceof TimeoutError) {
          // Offer to continue or cancel
          const choice = await askUser({
            question: `${check.name} timed out. Continue?`,
            options: ['Wait longer', 'Skip this check', 'Cancel routine']
          })

          if (choice === 'Cancel routine') {
            state.status = 'cancelled'
            return saveAndExit(state)
          }
          // Handle other choices...
        } else {
          // Unexpected error
          state.status = 'failed'
          state.error = error.message
          return saveAndExit(state)
        }
      }

      // Save state after each check (allows resume)
      saveState(state)
    }

    // All checks passed
    state.status = 'completed'
    return state

  } catch (error) {
    // Catastrophic failure
    state.status = 'failed'
    state.error = error.message
    return saveAndExit(state)
  }
}
```

### Resume Capability

```typescript
async function resumeRoutine(prNumber: number): Promise<RoutineResult> {
  const state = loadState(prNumber)

  if (state.status !== 'in_progress') {
    throw new Error('Cannot resume - routine not in progress')
  }

  // Skip completed checks
  const remainingChecks = config.checks.filter(
    check => !state.checks_completed.find(c => c.name === check.name)
  )

  // Continue from where we left off
  return executeChecks(remainingChecks, state)
}
```

---

## Performance Optimizations

### Parallel Check Execution (Future)

```typescript
// Currently sequential:
for (const check of checks) {
  await executeCheck(check)
}

// Future: Independent checks in parallel
const independentChecks = [
  'build',
  'tests',
  'typescript',
  'lint'
]

await Promise.all(
  independentChecks.map(name => executeCheck(getCheck(name)))
)

// Then dependent checks
await executeCheck('gemini_review')  // Needs code analysis
await executeCheck('security_scan')   // Needs dependencies
```

### Caching

```typescript
// Cache check results for unchanged files
interface CheckCache {
  check: string
  files: Map<string, string>  // file -> hash
  result: CheckResult
  timestamp: number
}

function shouldUseCache(check: Check, cache: CheckCache): boolean {
  // If files haven't changed, reuse result
  for (const [file, hash] of cache.files) {
    if (hashFile(file) !== hash) {
      return false  // File changed, can't use cache
    }
  }

  // Cache is fresh (< 1 hour old)
  return Date.now() - cache.timestamp < 3600000
}
```

---

## Security Considerations

### Secrets in State Files

State files may contain sensitive info (commit messages, file paths).

```typescript
function sanitizeState(state: RoutineState): RoutineState {
  return {
    ...state,
    changes_made: state.changes_made.map(change => ({
      ...change,
      // Don't include full diff
      diff: undefined,
      // Redact potential secrets from commit messages
      message: redactSecrets(change.message)
    }))
  }
}
```

### Configuration Validation

```typescript
function validateConfig(config: Config): ValidationResult {
  const errors = []

  // Prevent dangerous settings
  if (config.merge.auto_merge && !config.merge.confirmation_required) {
    errors.push({
      severity: 'warning',
      message: 'auto_merge + no confirmation is very risky',
      suggestion: 'Set confirmation_required: true'
    })
  }

  // Validate timeouts
  if (config.timeout_seconds > 3600) {
    errors.push({
      severity: 'warning',
      message: 'Global timeout very high (> 1 hour)',
      suggestion: 'Reduce to reasonable value'
    })
  }

  return { valid: errors.length === 0, errors }
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe('RoutineExecution', () => {
  test('blocks merge on required check failure', async () => {
    const config = {
      checks: {
        build: { required: true }
      }
    }

    mockCheck('build', { status: 'failed' })

    const result = await executeRoutine(config)

    expect(result.status).toBe('blocked')
    expect(result.blocked_reason).toContain('build')
  })

  test('continues on optional check failure', async () => {
    const config = {
      checks: {
        lint: { required: false }
      }
    }

    mockCheck('lint', { status: 'failed' })

    const result = await executeRoutine(config)

    expect(result.status).toBe('completed')
  })
})
```

### Integration Tests

```typescript
describe('GeminiIntegration', () => {
  test('implements CRITICAL items automatically', async () => {
    mockGeminiResponse({
      feedback: [
        { severity: 'CRITICAL', issue: 'XSS vulnerability' }
      ]
    })

    const result = await runMergeRoutine({ level: 'medium' })

    expect(result.changes_made).toHaveLength(1)
    expect(result.changes_made[0].triggered_by).toBe('gemini_review')
  })
})
```

---

## Future Enhancements

### Planned Features

1. **Parallel check execution** - Run independent checks simultaneously
2. **Smart caching** - Skip checks for unchanged files
3. **AI-powered level suggestion** - Recommend level based on PR content
4. **Team presets** - Share presets across team
5. **Slack/Discord notifications** - Alert on completion/blocking
6. **Rollback support** - Quick rollback if merge causes issues
7. **A/B testing** - Experiment with check configurations
8. **Cost tracking** - Monitor AI review costs
9. **Custom check plugins** - Add project-specific checks
10. **Multi-platform support** - GitLab, Bitbucket, etc.

---

## Architecture Principles

1. **State Preservation** - Always save state, allow resume
2. **Fail Safe** - Block merge when in doubt
3. **User Transparency** - Show what's happening and why
4. **Smart Automation** - Automate tedious, not thinking
5. **Learning System** - Get smarter over time
6. **Configuration over Code** - Customize without modifying commands
7. **Graceful Degradation** - Continue if optional features unavailable

---

## Related Documentation

- `README.md` - Full user documentation
- `QUICKSTART.md` - Getting started guide
- `/routine-merge` command - Command reference
- `/routine-config` command - Configuration reference
- `/routine-stats` command - Statistics reference
