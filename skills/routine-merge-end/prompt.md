# Routine: Smart PR Merge with Auto-End

You are running a smart PR merge routine with automatic session cleanup.

**Key difference from `/routine-merge`**: After successful merge, automatically run `/end` to cleanly wrap up the session (commit to memory, sync docs if configured, stop dev servers).

## Your Task

1. **Run the merge routine** (same as `/routine-merge`)
2. **After successful merge** → Automatically run `/end` workflow
3. **Skip auto-end if**:
   - Merge fails or is blocked
   - User explicitly needs to continue working
   - Dry-run mode is active
   - User intervention is required

## Arguments Provided

Parse the user's input for:

- `--light` or `-l`: Use light level
- `--medium` or `-m`: Use medium level (default)
- `--thorough` or `-t`: Use thorough level
- `--dry-run` or `-d`: Preview only, don't merge or end session
- `--auto-fix`: Apply fixes automatically

## Workflow

### Part 1: Merge Routine (Same as /routine-merge)

#### Step 1: Get PR Info

```bash
gh pr view --json number,title,state,headRefName,baseRefName
```

#### Step 1.5: Comprehensive Git State Check

**CRITICAL: Run these checks before proceeding with merge:**

1. **Check for uncommitted changes:**

```bash
git status --porcelain
```

If output is non-empty, categorize changes:

```bash
# Get list of untracked files
git ls-files --others --exclude-standard

# Get list of modified files
git diff --name-only

# Get list of staged files
git diff --cached --name-only
```

2. **Analyze uncommitted changes:**

   - **Build artifacts/temp files** (node_modules, .next, dist, .DS_Store, etc.)
     → Safe to ignore

   - **Source files** (.ts, .tsx, .js, .jsx, .md, etc.)
     → Needs user decision

   - **Config files** (.env, .gitignore, package.json, etc.)
     → Potentially important

3. **If uncommitted source/config files found:**

Use `AskUserQuestion` to get user decision:

```
Question: Uncommitted changes detected in working directory:
- src/components/Button.tsx (modified)
- .env.local (untracked)

How to proceed?

Options:
  - Stash changes and continue merge
  - Add to current PR and push
  - Show me the diff first
  - Cancel merge (I'll handle this manually)
```

4. **Handle user choice:**

**Option 1: Stash changes and continue**
```bash
git stash push -m "Pre-merge stash from routine-merge-end"
# Continue with merge
# After merge: remind user about stash
```

**Option 2: Add to current PR**
```bash
# Show diff for review
git diff

# If user confirms:
git add {files}
git commit -m "chore: include uncommitted changes in PR"
git push

# Re-run PR checks
gh pr checks
```

**Option 3: Show diff first**
```bash
git diff
git status --short

# Then ask again with options 1, 2, or 4
```

**Option 4: Cancel**
```
Merge cancelled. Please commit or stash changes first.
```

5. **Verify clean state before merge:**

After handling uncommitted changes, verify:

```bash
# Should return empty
git status --porcelain

# Verify we're on the PR branch
CURRENT_BRANCH=$(git branch --show-current)
PR_BRANCH=$(gh pr view --json headRefName -q .headRefName)

if [ "$CURRENT_BRANCH" != "$PR_BRANCH" ]; then
  echo "⚠️ Warning: Not on PR branch"
  echo "Current: $CURRENT_BRANCH"
  echo "PR branch: $PR_BRANCH"
  # Ask if should checkout PR branch
fi
```

**Block merge if:**
- Uncommitted changes exist and user chose to cancel
- Not on correct branch and user doesn't want to switch
- Stash fails
- Push fails (if adding to PR)

#### Step 2: Run Checks

**Light Level:**

1. Check git status
2. Verify no secrets in code
3. Check PR is mergeable

**Medium Level (Default):**

1. All Light checks
2. TypeScript type check (if applicable)
3. Basic security scan (hardcoded secrets, common vulnerabilities)
4. Verify tests exist

**Thorough Level:**

1. All Medium checks
2. GitHub Actions status
3. Full security audit
4. Bundle size analysis (if applicable)

#### Step 3: Show Summary

Display results in this format:

```markdown
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

#### Step 4: Merge (if approved)

```bash
gh pr merge --squash --delete-branch
```

### Part 2: Auto-End Session (NEW)

**Only run if:**
- ✅ Merge completed successfully
- ✅ No errors or blockers
- ✅ Not in dry-run mode
- ✅ User didn't explicitly say they want to continue

#### Auto-End Workflow

1. **Commit to Memory**
   - Update or create `skills/learned/{project-name}.md`
   - Document what was merged
   - Note any patterns discovered
   - Save session state

2. **Create Session Summary**

```markdown
## Session Summary: {date}

### Worked On
- {project-name}

### Accomplished
- Merged PR #{pr-number}: {pr-title}
- {Additional tasks if any}

### Files Changed
- {file1} - {what changed}
- {file2} - {what changed}

### Next Steps
1. {Next task if known}

### PR Merged
- #{pr-number}: {pr-title}
- Merged at: {timestamp}
- Deployment: {url if available}
```

3. **Check for Dev Servers**

```bash
lsof -i :3000 -i :3001 -i :5173 -i :4321 | grep LISTEN
```

If found, ask user:
```
Dev server running on port {port} (PID: {pid})
Stop it? [Y/n]
```

4. **Final Output**

```
✅ Session ended cleanly.

Merge:
  PR #{number} merged successfully

Memory:
  Saved to ~/.claude/skills/learned/{project}.md

Server:
  {Stopped dev server on port X / No servers running}

Next time:
  cd {project-dir}
  Start with: {next task or "Continue development"}

See you next time! 👋
```

## Important Notes

- **ALWAYS check git state before merge** - Block if uncommitted changes in source/config files
- NEVER merge if there are CRITICAL security issues
- NEVER merge with uncommitted source code changes (unless user adds them to PR or stashes)
- Always show summary before merging
- Use AskUserQuestion for confirmation before merge
- Use AskUserQuestion if uncommitted changes detected (stash/add/cancel options)
- If --dry-run is set, show what WOULD run but don't merge or end
- Only auto-end if merge succeeds without user intervention needed
- If any step requires user input beyond initial merge approval, don't auto-end
- Remind user about stashed changes after merge (if stash was used)

## Decision Logic for Auto-End

**Auto-end when:**
- Merge completed successfully
- No pending questions for user
- No errors that need attention
- Not in dry-run mode

**Don't auto-end when:**
- Merge failed or blocked
- Security issues need manual review
- User said they want to continue working
- Dry-run mode active
- Errors occurred during merge

## Error Handling

Same as `/routine-merge`:

- No PR found: Tell user to create PR first
- PR has conflicts: Ask user to resolve conflicts
- Checks fail: Show failures and block merge
- Security issues: Offer to fix or block merge

**Plus for auto-end:**
- If merge succeeds but memory commit fails: Show error, don't auto-end
- If dev server shutdown fails: Show warning, complete auto-end anyway

## Example Flow

```
User: /routine-merge-end

Claude: Starting Medium merge routine for PR #123...

1. ✅ Build passed (8.2s)
2. ✅ Tests passed (47/47, 94% coverage)
3. ✅ Security scan passed
4. ✅ TypeScript check passed
5. ✅ GitHub Actions passing

All checks passed! Ready to merge.
[Shows summary]

Merge now? [Yes/No]

User: Yes

Claude: ✅ Merged PR #123 (squash: abc123)
        ✅ Deleted branch feature/auth

        Wrapping up session...

        ✅ Memory committed
        ✅ Session summary created
        ✅ No dev servers running

        Session ended cleanly.

        Merge:
          PR #123 merged successfully

        Memory:
          Saved to skills/learned/my-project.md

        Next time:
          cd /path/to/project
          Continue development

        See you next time! 👋
```

### Example Flow with Uncommitted Changes

```
User: /routine-merge-end

Claude: Starting Medium merge routine for PR #456...

        Checking git state...

        ⚠️ Uncommitted changes detected:
        - src/utils/helper.ts (modified)
        - .env.local (untracked)

        How to proceed?

User: [Selects "Stash changes and continue merge"]

Claude: ✅ Stashed changes: "Pre-merge stash from routine-merge-end"
        ✅ Working directory now clean

        Continuing with merge...

1. ✅ Build passed (6.1s)
2. ✅ Tests passed (89/89, 92% coverage)
3. ✅ Security scan passed
4. ✅ TypeScript check passed
5. ✅ GitHub Actions passing

All checks passed! Ready to merge.
[Shows summary]

Merge now? [Yes/No]

User: Yes

Claude: ✅ Merged PR #456 (squash: def789)
        ✅ Deleted branch feature/improvements

        Wrapping up session...

        ✅ Memory committed
        ✅ Session summary created
        ✅ No dev servers running

        ⚠️ REMINDER: You have stashed changes
            Run: git stash pop
            To restore: src/utils/helper.ts, .env.local

        Session ended cleanly.

        See you next time! 👋
```

## Usage Examples

**Quick merge and end:**
```bash
/routine-merge-end --light
```

**Standard merge with full workflow:**
```bash
/routine-merge-end
```

**Thorough pre-release merge:**
```bash
/routine-merge-end --thorough
```

**Preview without executing:**
```bash
/routine-merge-end --dry-run
```

## Comparison with /routine-merge

| Feature | /routine-merge | /routine-merge-end |
|---------|----------------|-------------------|
| Run merge checks | ✅ | ✅ |
| Show summary | ✅ | ✅ |
| Merge PR | ✅ | ✅ |
| Commit to memory | ❌ | ✅ |
| Create session summary | ❌ | ✅ |
| Stop dev servers | ❌ | ✅ |
| Clean session exit | ❌ | ✅ |

**Use `/routine-merge`** when:
- You want to continue working after merge
- You need to merge multiple PRs
- You want manual control over session end

**Use `/routine-merge-end`** when:
- This is your last task of the session
- You want hands-off workflow
- You're done for the day after this merge
- You want automatic cleanup
