---
description: Create and publish a new release with automatic tag creation and GitHub Release generation
---

# Create Release

Automates the release process by creating a git tag and pushing it to trigger GitHub Actions release automation.

## Arguments

Parse `$ARGUMENTS` for version or flags:
- Version number (e.g., `1.0.0`, `v1.2.3`) - Will add 'v' prefix if missing
- `--patch` or `-p` - Auto-increment patch version (1.2.3 → 1.2.4)
- `--minor` or `-m` - Auto-increment minor version (1.2.3 → 1.3.0)
- `--major` or `-M` - Auto-increment major version (1.2.3 → 2.0.0)
- `--dry-run` or `-d` - Show what would happen without creating release

**Examples:**
```bash
/create-release                  # Prompt for version
/create-release 1.0.0            # Create v1.0.0
/create-release v2.3.1           # Create v2.3.1
/create-release --patch          # Auto-increment patch
/create-release -m               # Auto-increment minor
/create-release --dry-run        # Preview only
```

## Instructions

### 1. Verify Repository State

Check that the repository is ready for release:

```bash
# Check for uncommitted changes
git status

# Check if we're on main/master branch
git branch --show-current

# Check for unpushed commits
git log origin/$(git branch --show-current)..HEAD --oneline
```

**Block if:**
- Uncommitted changes exist (suggest `/commit` first)
- Not on main/master/release branch (suggest switching or ask user)
- Unpushed commits exist (suggest pushing first)

### 2. Determine Version Number

**If version provided in arguments:**
- Use that version
- Add 'v' prefix if missing (1.0.0 → v1.0.0)

**If flag provided (--patch, --minor, --major):**
1. Get latest tag: `git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"`
2. Parse current version (remove 'v' prefix)
3. Increment appropriate part:
   - `--patch`: 1.2.3 → 1.2.4
   - `--minor`: 1.2.3 → 1.3.0
   - `--major`: 1.2.3 → 2.0.0

**If no version specified:**
1. Get latest tag
2. Suggest next patch version
3. Ask user using AskUserQuestion with options:
   - Suggested patch version (Recommended)
   - Custom version (user input)

### 3. Check for Existing Release Workflow

Verify GitHub Actions release workflow exists:

```bash
ls .github/workflows/release.yml 2>/dev/null || ls .github/workflows/release.yaml 2>/dev/null
```

**If not found:**
- Warn user: "No release.yml workflow found. The tag will be created but no automated release will happen."
- Ask: "Would you like me to set up GitHub Actions release automation first? (Use /setup-github-actions)"
- Continue if user confirms to proceed anyway

### 4. Preview Release

Show what will happen:

```
Creating Release: v{version}

Changes since last release ({prev_version}):
[Run: git log {prev_version}..HEAD --oneline --no-decorate]

Release workflow will:
1. Create tag: v{version}
2. Push to origin
3. Trigger GitHub Actions (if release.yml exists)
4. Build artifacts (if configured)
5. Create GitHub Release with auto-generated notes

Continue? [Yes/No]
```

If `--dry-run`, stop here and show preview only.

### 5. Create and Push Tag

```bash
# Create annotated tag with message
git tag -a v{version} -m "Release v{version}"

# Push tag to origin
git push origin v{version}
```

### 6. Monitor GitHub Actions (Optional)

If release workflow exists and `gh` CLI is available:

```bash
# Wait a moment for workflow to start
sleep 3

# Check workflow status
gh run list --workflow=release.yml --limit=1
```

Show status to user:
- "Release workflow started: [URL]"
- "Monitor progress: gh run watch"

### 7. Report Success

```
✓ Release v{version} created successfully!

Tag: v{version}
Branch: {branch}
Commit: {short-sha}

Next steps:
- Monitor GitHub Actions: gh run watch
- View release: https://github.com/{owner}/{repo}/releases/tag/v{version}
- Download artifacts: gh release download v{version}

The GitHub Release will be created automatically when the workflow completes.
```

## Error Handling

**Uncommitted changes:**
```
Error: Uncommitted changes found. Commit or stash changes before creating a release.
Run: /commit
```

**Not on main branch:**
```
Warning: You're on branch '{branch}', not main/master.
Releases are typically created from main/master.
Continue anyway? [Yes/No]
```

**Tag already exists:**
```
Error: Tag v{version} already exists.
Existing tags:
[List last 5 tags]

Use a different version number or delete the existing tag:
git tag -d v{version}
git push origin :refs/tags/v{version}
```

**Push failed:**
```
Error: Failed to push tag to origin.
Check your network connection and GitHub permissions.
```

## Integration with Release Workflow

This command works with the GitHub Actions release workflow created by `/setup-github-actions`.

The workflow automatically:
- Builds project artifacts (if applicable)
- Creates GitHub Release
- Generates release notes from commits
- Attaches build artifacts to release

## Examples

**Simple release:**
```
User: /create-release 1.0.0
Claude: [Checks state, previews changes, creates v1.0.0, pushes]
```

**Auto-increment patch:**
```
User: /create-release --patch
Claude: [Detects latest is v1.2.3, suggests v1.2.4, creates and pushes]
```

**Dry run:**
```
User: /create-release --major --dry-run
Claude: [Shows would create v2.0.0, lists changes, doesn't create tag]
```

## Notes

- Always creates annotated tags (not lightweight)
- Follows semver convention (v prefix)
- Integrates with GitHub Actions release workflow
- Safe to run multiple times (will error if tag exists)
- Use `--dry-run` to preview without creating release
