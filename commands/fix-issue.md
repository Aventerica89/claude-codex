---
description: Analyze and fix a GitHub issue by number. Fetches issue details, creates implementation plan, and fixes the code.
---

# Fix GitHub Issue

Automatically analyze and fix a GitHub issue using the GitHub CLI.

## Usage

```
/fix-issue 123          # Fix issue #123
/fix-issue 123 --dry    # Analyze only, don't make changes
```

## Arguments

Parse `$ARGUMENTS` for:
- Issue number (required)
- `--dry` flag for analysis-only mode

---

## Workflow

### Step 1: Fetch Issue Details

```bash
gh issue view $ISSUE_NUMBER --json title,body,labels,assignees,comments
```

Extract:
- **Title**: What needs to be done
- **Body**: Detailed description, acceptance criteria
- **Labels**: bug, feature, enhancement, etc.
- **Comments**: Additional context, clarifications

### Step 2: Analyze the Issue

Based on issue type (from labels):

**Bug**:
1. Identify the reported behavior
2. Find reproduction steps
3. Locate relevant code
4. Understand expected behavior

**Feature/Enhancement**:
1. Extract requirements
2. Identify affected components
3. Plan implementation approach
4. Consider edge cases

### Step 3: Create Implementation Plan

Output a brief plan:

```markdown
## Issue #123: {title}

**Type**: Bug/Feature/Enhancement
**Affected Files**:
- src/components/Auth.tsx
- src/lib/auth.ts

**Plan**:
1. {Step 1}
2. {Step 2}
3. {Step 3}

**Tests Needed**:
- {Test 1}
- {Test 2}
```

If `--dry` flag, stop here and show plan only.

### Step 4: Implement Fix

Follow TDD approach:
1. Write failing test (if applicable)
2. Implement the fix
3. Verify test passes
4. Run existing tests

### Step 5: Create Commit

```bash
git add -A
git commit -m "fix: {brief description}

Fixes #{issue_number}

- {Change 1}
- {Change 2}"
```

### Step 6: Report Results

```markdown
## Fixed: Issue #123

**Changes**:
- `src/components/Auth.tsx` - Fixed validation logic
- `src/lib/auth.ts` - Added null check

**Tests**:
- Added: `auth.test.ts` - 3 new tests
- All tests passing

**Next Steps**:
- Create PR with `/create-pr`
- Or push directly: `git push`
```

---

## Example

```
User: /fix-issue 45

Claude: Fetching issue #45...

## Issue #45: Login button not working on mobile

**Type**: Bug (from labels)
**Reporter**: @username
**Description**: Login button doesn't respond to taps on iOS Safari

**Affected Files**:
- src/components/LoginButton.tsx

**Plan**:
1. Check touch event handling
2. Verify button sizing meets tap target guidelines
3. Test on iOS Safari

Implementing fix...

[Makes changes]

## Fixed: Issue #45

**Changes**:
- `src/components/LoginButton.tsx` - Added touch event handlers, increased tap target

**Commit**: `fix: resolve mobile login button touch issues`

Ready to create PR? Run `/create-pr`
```

---

## Notes

- Requires GitHub CLI (`gh`) to be installed and authenticated
- Works best when issues have clear descriptions
- Creates atomic commits referencing the issue
- Use `--dry` to preview without changes
