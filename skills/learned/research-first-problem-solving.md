# Research-First Problem Solving

**Category**: Development Workflow
**Learned From**: VaporForge SDK migration (2026-02-06)
**Confidence**: High (user feedback validated approach)

## Problem

Claude sometimes makes assumptions or claims something is impossible without checking available resources. This wastes time and frustrates users who know solutions exist.

## User Feedback (Trigger)

> "Absolutely not. 1Code figured it out, so can we. Stop pretending like we don't have resources. Look at 1Code github and here https://ai-sdk.dev/docs/reference/ai-sdk-core and https://github.com/siteboon/claudecodeui"

**Translation**: User expects proactive research of existing implementations before claiming something is difficult or requires a different approach.

## Solution Pattern

### Step 1: Check Local Resources First
```bash
# Look for related projects in common locations
find ~ -maxdepth 3 -name "project-name" -type d
ls ~/repos/ | grep -i keyword

# Check if already cloned
ls /tmp/reference-project 2>/dev/null
```

### Step 2: Clone Reference Implementations
```bash
# Clone to /tmp for quick reference (auto-cleaned on reboot)
cd /tmp
gh repo clone owner/reference-project
```

### Step 3: Find Key Implementation Files
```bash
# Search for relevant files by name/path pattern
find /tmp/project/src -name "*.ts" | grep -i -E "(chat|api|sdk)"

# Search for imports/usage
grep -r "import.*claude" /tmp/project/src
grep -r "sessionId\|query(" /tmp/project/src
```

### Step 4: Read Actual Code
```typescript
// Don't assume - read how they actually implemented it
// Look for:
// 1. Imports - what packages/modules they use
// 2. Type definitions - how they structure data
// 3. Core logic - the actual implementation pattern
```

### Step 5: Cross-reference Documentation
```bash
# User often provides multiple references - check all:
# 1. Official docs (ai-sdk.dev)
# 2. GitHub repos (similar projects)
# 3. Related implementations (1Code, claudecodeui, etc.)
```

## Example Workflow

**Bad Approach** ❌:
```
User: "Make chat work with conversation memory"
Claude: "We should use Anthropic API directly instead of Claude Code"
User: *frustrated* "1Code already solved this!"
```

**Good Approach** ✅:
```
User: "Make chat work with conversation memory"
Claude: "Let me check how 1Code implemented this..."
1. Clone 1Code repo to /tmp
2. Find chat implementation files
3. Read the actual SDK usage
4. Check provided docs (ai-sdk.dev)
5. Implement the proven pattern
User: *happy* "Yes! That's the right approach"
```

## Research Checklist

Before claiming something is difficult or requires a workaround:

- [ ] Check if user mentioned reference implementations
- [ ] Search for the project locally (may already be cloned)
- [ ] Clone reference repos to /tmp for inspection
- [ ] Find and read relevant implementation files
- [ ] Cross-reference official documentation
- [ ] Look for similar projects (GitHub search)
- [ ] Check package.json dependencies for clues

## Key Principles

1. **Don't Reinvent**: If someone solved it, learn from them
2. **Read Code, Not Just Docs**: Implementation reveals patterns docs miss
3. **Multiple Sources**: Cross-reference 2-3 implementations
4. **User Knows Best**: If user says "X figured it out", believe them
5. **Quick Research**: 2-5 minutes of research > hours of wrong approach

## Common Research Patterns

### Pattern: "Find how X does Y"
```bash
# 1. Clone or locate project
cd /tmp && gh repo clone owner/project

# 2. Find relevant files
find . -name "*.ts" | xargs grep -l "feature-keyword"

# 3. Read implementation
cat path/to/key/file.ts

# 4. Extract pattern and adapt
```

### Pattern: "Check multiple implementations"
```bash
# Compare approaches from 2-3 projects
/tmp/project1/src/chat.ts  # How project1 does it
/tmp/project2/lib/api.ts   # How project2 does it
# Identify common patterns
```

### Pattern: "Verify with official docs"
```bash
# After finding implementation, confirm with docs
# WebFetch: https://official-docs-url
# Extract: exact API usage, options, gotchas
```

## When This Pattern Applies

✅ **Use research-first when:**
- User mentions reference implementations
- Problem seems solved elsewhere
- User says "X already figured this out"
- Similar projects exist (1Code, claudecodeui, etc.)
- Official SDK/library available

❌ **Skip research when:**
- Completely novel problem
- User wants custom solution
- No existing implementations
- Simple/trivial implementation

## Failure Modes to Avoid

1. **Assuming Impossibility**: "That won't work because..." → Check first!
2. **Ignoring User Pointers**: User gives GitHub URL → Read it!
3. **Proposing Workarounds Too Quickly**: Research proven approach first
4. **Not Checking Dependencies**: package.json reveals what they actually use

## Success Metrics

✅ **Research was successful if:**
- Found exact implementation pattern
- Avoided reinventing the wheel
- User confirms "yes, that's it!"
- Implementation works first try

❌ **Research failed if:**
- User has to repeat "check X!"
- Went down wrong path despite references
- Wasted time on assumptions

## Related Patterns

- See: `~/.claude/rules/cli-first.md` - Check tools before asking user
- See: Reading existing codebases for patterns
- See: Cross-referencing multiple sources

## Real Example

**Task**: Make VaporForge chat remember conversation history

**Research Steps**:
1. User mentioned: 1Code, ai-sdk.dev, claudecodeui
2. Cloned 1Code to /tmp
3. Found: `/tmp/1code/src/main/lib/trpc/routers/claude.ts`
4. Read implementation: Uses `@anthropic-ai/claude-agent-sdk`
5. Discovered: `query()` function with `resume: sessionId`
6. Checked docs: Confirmed SDK usage pattern
7. Implemented: Exact same pattern in VaporForge

**Result**: Working conversation memory in ~30 minutes instead of hours of wrong approaches.

## User Satisfaction Indicators

When you get it right:
- User says "yes"
- No follow-up corrections
- Implementation works
- User doesn't have to repeat themselves

When you get it wrong:
- User says "Absolutely not"
- User repeats reference materials
- User sounds frustrated
- Multiple correction cycles
