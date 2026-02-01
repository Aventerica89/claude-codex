# Routine: Smart PR Merge

You are running a smart PR merge routine with configurable review gates.

## Your Task

1. **Detect PR**: Get current PR number and details
2. **Run checks based on level**:
   - **light**: Build + Tests + Basic security
   - **medium** (default): Light + Security scan + Type checking
   - **thorough**: Medium + Full security audit + Performance checks
3. **Show summary**: Display all check results
4. **Offer to merge**: Ask user to confirm merge

## Arguments Provided

Parse the user's input for:
- `--light` or `-l`: Use light level
- `--medium` or `-m`: Use medium level (default)
- `--thorough` or `-t`: Use thorough level
- `--dry-run` or `-d`: Preview only, don't merge
- `--auto-fix`: Apply fixes automatically

## Workflow

### Step 1: Get PR Info
```bash
gh pr view --json number,title,state,headRefName,baseRefName
```

### Step 2: Run Checks

#### Light Level
1. Check git status
2. Verify no secrets in code
3. Check PR is mergeable

#### Medium Level (Default)
1. All Light checks
2. TypeScript type check (if applicable)
3. Basic security scan (hardcoded secrets, common vulnerabilities)
4. Verify tests exist

#### Thorough Level
1. All Medium checks
2. GitHub Actions status
3. Full security audit
4. Bundle size analysis (if applicable)

### Step 3: Show Summary

Display results in this format:
```
## Merge Routine Summary

**PR**: #{number} - {title}
**Level**: {level}
**Branch**: {head} → {base}

### Check Results

#### ✅ Passed
- Item 1
- Item 2

#### ⚠️ Warnings
- Warning 1

#### ❌ Failed
- Failure 1

### Merge Plan
- Method: Squash and merge
- Delete branch: Yes

Ready to merge? [Yes/No]
```

### Step 4: Merge (if approved)

```bash
gh pr merge --squash --delete-branch
```

## Important Notes

- NEVER merge if there are CRITICAL security issues
- Always show summary before merging
- Use AskUserQuestion for confirmation
- If --dry-run is set, show what WOULD run but don't merge
- Track state in ~/.claude/routines/state/ for resumability

## Error Handling

- No PR found: Tell user to create PR first
- PR has conflicts: Ask user to resolve conflicts
- Checks fail: Show failures and block merge
- Security issues: Offer to fix or block merge
