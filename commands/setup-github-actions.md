---
description: Set up GitHub Actions workflows with intelligent defaults based on project type
---

# Setup GitHub Actions

Automatically configure GitHub Actions CI/CD workflows tailored to your project.

## Arguments

Parse `$ARGUMENTS` for preset or flags:
- `--all` or `-a` - Install all recommended workflows
- `--minimal` or `-m` - Install only essential workflows (CI + Dependabot)
- `--preset <type>` - Use preset for project type (node, python, rust, go, docs)
- `--ci-only` - Only install CI/test workflow
- `--skip-dependabot` - Don't create Dependabot config
- Workflow names - Install specific workflows (e.g., `ci lint release`)

**Examples:**
```bash
/setup-github-actions              # Interactive selection
/setup-github-actions --all        # All recommended workflows
/setup-github-actions --minimal    # CI + Dependabot only
/setup-github-actions ci release   # Specific workflows
/setup-github-actions --preset node # Node.js preset
```

## Instructions

### 1. Detect Project Type

Check for indicators to determine project type:

```bash
# Node.js/JavaScript
ls package.json 2>/dev/null

# Python
ls requirements.txt pyproject.toml setup.py 2>/dev/null

# Rust
ls Cargo.toml 2>/dev/null

# Go
ls go.mod 2>/dev/null

# Documentation/Markdown
find . -name "*.md" -type f | wc -l
```

Determine primary language and framework.

### 2. Define Available Workflows

**Essential (recommended for all projects):**

1. **CI/Test** (`ci.yml`)
   - Runs tests, linting, build
   - Triggers on push to main and PRs
   - Project-specific (see templates below)

2. **Dependabot** (`dependabot.yml`)
   - Auto-updates dependencies
   - Security patches
   - GitHub Actions updates

**Common (recommended for most projects):**

3. **Code Quality** (`code-quality.yml`)
   - Linting, formatting checks
   - Type checking (TypeScript, mypy, etc.)
   - Code coverage reporting

4. **Security Scan** (`security.yml`)
   - CodeQL analysis
   - Dependency vulnerability scanning
   - Secret detection

**Documentation Projects:**

5. **Markdown Lint** (`markdown-lint.yml`)
   - Markdown style checking
   - Triggers on .md file changes

6. **Link Check** (`link-check.yml`)
   - Validates external links
   - Runs on PRs and weekly schedule

**Release Automation:**

7. **Release** (`release.yml`)
   - Triggered by version tags (v*)
   - Builds artifacts
   - Creates GitHub Release
   - Auto-generates release notes

**Deployment:**

8. **Deploy** (`deploy.yml`)
   - Auto-deploy to production
   - Triggered by push to main or release tags
   - Platform-specific (Vercel, Cloudflare, etc.)

### 3. Present Recommendations

Based on project type, show recommended workflows:

Use AskUserQuestion with multiSelect:

```
Which GitHub Actions workflows would you like to set up?

I've detected this is a {project_type} project.

Recommended workflows:
□ CI/Test - Run tests and linting on every PR (Essential)
□ Dependabot - Auto-update dependencies (Essential)
□ Code Quality - Advanced linting and coverage (Recommended)
□ Security Scan - CodeQL and vulnerability scanning (Recommended)
□ Release Automation - Auto-create releases from tags (Optional)
□ {Project-specific workflows}
```

**If --all flag:** Select all recommended
**If --minimal flag:** Select only essential
**If specific names provided:** Select only those

### 4. Create Workflow Files

For each selected workflow, create appropriate file in `.github/workflows/`.

#### CI/Test Workflow Templates

**Node.js/TypeScript:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

**Python:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
      - run: pip install pytest ruff mypy
      - run: ruff check .
      - run: mypy .
      - run: pytest
```

**Documentation/Markdown:**
```yaml
name: Validate

on:
  push:
    branches: [main]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate structure
        run: |
          # Add validation commands
          echo "Validation complete"
```

#### Dependabot Configuration

```yaml
version: 2
updates:
  # GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "chore"
      include: "scope"

  # Add ecosystem-specific updates
  {ecosystem_specific}
```

**Ecosystem-specific additions:**

**Node.js:**
```yaml
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "npm"
```

**Python:**
```yaml
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "python"
```

#### Code Quality Workflow

```yaml
name: Code Quality

on:
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      {setup_language}
      {install_deps}
      - run: {lint_command}
      - run: {format_check}
      - run: {type_check}

      # Coverage (if applicable)
      - name: Test Coverage
        run: {coverage_command}
      - uses: codecov/codecov-action@v4
        if: always()
```

#### Security Scan Workflow

```yaml
name: Security

on:
  push:
    branches: [main]
  pull_request:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: {detected_languages}
      - uses: github/codeql-action/analyze@v3
```

#### Release Workflow

**For Node.js projects:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm test
      - run: npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: dist/**/*
          generate_release_notes: true
          draft: false
```

**For documentation/config projects:**
```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Create archive
        run: |
          zip -r project-${{ github.ref_name }}.zip . \
            -x ".git/*" -x "node_modules/*"

      - name: Create Release
        uses: softprops/action-gh-release@v2
        with:
          files: project-${{ github.ref_name }}.zip
          generate_release_notes: true
```

#### Markdown Lint Workflow

```yaml
name: Markdown Lint

on:
  push:
    branches: [main]
  pull_request:
    paths:
      - '**.md'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: DavidAnson/markdownlint-cli2-action@v16
        with:
          globs: '**/*.md'
```

#### Link Check Workflow

```yaml
name: Link Check

on:
  pull_request:
    paths:
      - '**.md'
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  link-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: gaurav-nelson/github-action-markdown-link-check@v1
        with:
          use-quiet-mode: 'yes'
          use-verbose-mode: 'yes'
          config-file: '.github/workflows/link-check-config.json'
```

With config file `.github/workflows/link-check-config.json`:
```json
{
  "ignorePatterns": [
    {
      "pattern": "^http://localhost"
    },
    {
      "pattern": "^https://localhost"
    }
  ],
  "timeout": "20s",
  "retryOn429": true,
  "retryCount": 3
}
```

### 5. Create .github Directory if Needed

```bash
mkdir -p .github/workflows
```

### 6. Write Selected Workflows

For each selected workflow:
1. Use appropriate template based on project type
2. Customize with detected package manager, language version, etc.
3. Write to `.github/workflows/{workflow}.yml`

### 7. Report Created Workflows

Show summary:

```
✓ GitHub Actions workflows created:

Essential:
- .github/workflows/ci.yml - Run tests on every PR
- .github/dependabot.yml - Auto-update dependencies

Recommended:
- .github/workflows/code-quality.yml - Linting and coverage
- .github/workflows/security.yml - CodeQL security scanning

Optional:
- .github/workflows/release.yml - Auto-create releases

Next steps:
1. Review workflow files in .github/workflows/
2. Commit and push to enable workflows
3. Create a release: /create-release v1.0.0
4. Monitor workflows: gh run list

Your workflows will start running on the next push to GitHub.
```

### 8. Optional: Enable Branch Protection

Ask if user wants to enable branch protection on main:

```
Would you like to enable branch protection on main?
This requires:
- Pull requests before merging
- Status checks must pass (CI)
- Up to date with base branch

[Yes/No]
```

If yes and `gh` CLI available:
```bash
gh api repos/:owner/:repo/branches/main/protection \
  -X PUT \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=CI \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f enforce_admins=false
```

## Presets

**--preset node:**
- CI with npm/pnpm/yarn
- Dependabot (npm + github-actions)
- Code Quality (eslint, prettier, tsc)
- Security (CodeQL for JavaScript)
- Release

**--preset python:**
- CI with pip/poetry
- Dependabot (pip + github-actions)
- Code Quality (ruff, mypy, pytest-cov)
- Security (CodeQL for Python)
- Release

**--preset docs:**
- Validate
- Markdown Lint
- Link Check
- Dependabot (github-actions only)
- Release (zip artifacts)

**--preset rust:**
- CI with cargo
- Dependabot (cargo + github-actions)
- Code Quality (clippy, fmt)
- Security (cargo-audit)
- Release

## Integration with Other Commands

**Used by:**
- `/new-project` - Optional phase after scaffolding
- `/create-release` - Checks for release.yml

**Uses:**
- Detected project metadata
- Package manager (npm, pnpm, yarn, pip, cargo)
- Test framework

## Examples

**Interactive mode:**
```
User: /setup-github-actions
Claude: Detected Node.js project with npm
        [Shows checklist of recommended workflows]
        [User selects CI, Dependabot, Release]
        [Creates 3 workflow files]
```

**Quick setup:**
```
User: /setup-github-actions --all
Claude: Creating all recommended workflows for Node.js project...
        ✓ CI, Dependabot, Code Quality, Security, Release
```

**Minimal setup:**
```
User: /setup-github-actions --minimal
Claude: Creating essential workflows...
        ✓ CI, Dependabot
```

## Notes

- Always creates `.github/workflows/` directory
- Detects package manager (npm/pnpm/yarn/bun) automatically
- Customizes workflows based on available scripts in package.json
- Safe to run multiple times (warns about overwriting)
- Workflows are disabled until pushed to GitHub
- Use `/create-release` after setup to test release automation
