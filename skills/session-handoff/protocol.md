# Session Handoff Protocol

## Purpose

This protocol defines how to transfer development context between Claude Code (CLI) and claude.ai (web interface), enabling seamless continuation of work across different Claude interfaces.

---

## When to Use Handoff

| Scenario | Use Handoff? | Method |
|----------|--------------|--------|
| Quick break, same machine | No | `/pause` |
| Day end, continuing tomorrow | Maybe | `/end` (standard) |
| Need extended reasoning (claude.ai) | Yes | `/end --handoff` |
| Switching to mobile/tablet | Yes | `/end --handoff` |
| Want Artifacts feature | Yes | `/end --handoff` |
| Complex research task | Yes | `/end --handoff` |

---

## Handoff Flow

### Step 1: Prepare in Claude Code

Run `/end --handoff` or `/pause --handoff`

This will:
1. Save current session state
2. Generate optimized context for transfer
3. Create 1Password ClaudeSync item
4. Copy transfer prompt to clipboard

### Step 2: Verify 1Password Item

Check that ClaudeSync item was created:
- Vault: `ClaudeSync`
- Item name: `session-{project}-{date}`
- Fields:
  - `context`: Full session context (ready to paste)
  - `claude_ai_response`: Empty (you'll fill this later)
  - `project`: Project name
  - `branch`: Git branch
  - `timestamp`: When handoff occurred

### Step 3: Transfer to claude.ai

1. Open [claude.ai](https://claude.ai)
2. Start new conversation
3. Paste the context from clipboard (or from 1Password `context` field)
4. Continue your work

### Step 4: Work in claude.ai

Use claude.ai for:
- Extended reasoning and analysis
- Creating Artifacts (code, diagrams, documents)
- Research with web browsing
- Long conversations without context limits

### Step 5: Prepare Return Context

Before returning to Claude Code, ask claude.ai to summarize:

```
Please provide a summary for returning to Claude Code:

1. Key decisions made
2. Code changes suggested (if any)
3. Research findings
4. Next steps recommended
5. Any blockers or concerns

Format as structured markdown.
```

### Step 6: Save Response to 1Password

1. Copy claude.ai's response
2. Open 1Password
3. Find the ClaudeSync item for this session
4. Paste response into `claude_ai_response` field
5. Save

### Step 7: Return to Claude Code

Run `/start` in your project directory.

Claude Code will:
1. Detect the ClaudeSync item
2. Read the `claude_ai_response` field
3. Merge insights into local context
4. Resume development with combined knowledge

---

## Context Format

### Transfer Context (Claude Code to claude.ai)

```markdown
## Claude Code Session Context

### Project: {project_name}
Repository: {repo_url}
Branch: {branch_name}
Timestamp: {timestamp}

### Session Summary
{summary of what was accomplished}

### Current State
- Files modified: {count}
- Commits made: {count}
- Tests passing: {yes/no}

### Key Files
{list of important files with brief descriptions}

### Pending Tasks
{list of tasks from /todo}

### Technical Context
{relevant code snippets, patterns, or decisions}

### Continuation Instructions
Please continue development on this project. The main focus is:
{current objective}

When you're ready to hand back to Claude Code, please provide:
1. Summary of decisions made
2. Suggested code changes
3. Next steps
```

### Return Context (claude.ai to Claude Code)

```markdown
## claude.ai Session Summary

### Timestamp: {when finished}
### Duration: {approximate time spent}

### Decisions Made
- {decision 1}
- {decision 2}

### Code Suggestions
{code snippets or file changes recommended}

### Research Findings
{relevant information discovered}

### Next Steps
1. {step 1}
2. {step 2}

### Blockers/Concerns
{any issues to be aware of}
```

---

## 1Password ClaudeSync Vault

### Setup (One-time)

1. Create a vault named `ClaudeSync` in 1Password
2. Use "Secure Note" type for session items
3. Create custom fields:
   - `context` (text, multiline)
   - `claude_ai_response` (text, multiline)
   - `project` (text)
   - `branch` (text)
   - `timestamp` (text)

### Item Naming Convention

Format: `session-{project}-{YYYY-MM-DD}`

Examples:
- `session-cloud-tracker-2026-02-03`
- `session-claude-codex-2026-02-03`

### Cleanup Policy

Items older than 30 days can be archived or deleted. The handoff routine includes auto-cleanup configuration.

---

## Troubleshooting

### ClaudeSync Item Not Found

```bash
# Check if 1Password CLI is available
op --version

# List items in ClaudeSync vault
op item list --vault ClaudeSync

# Get specific item
op item get "session-{project}-{date}" --vault ClaudeSync
```

### Context Too Large

If the context exceeds claude.ai's input limits:
1. Use `--preset quick` for minimal context
2. Manually trim unnecessary sections
3. Focus on essential files and decisions

### Branch Mismatch on Return

If you switched branches in Claude Code while working in claude.ai:
1. `/start` will warn about mismatch
2. Choose to switch back or clear the handoff state
3. Merge claude.ai insights manually if needed

---

## Best Practices

### Do

- Use handoff for extended research or reasoning tasks
- Save claude.ai response before closing the tab
- Include specific continuation instructions
- Keep context focused on current objective

### Don't

- Use handoff for quick questions (just ask in Claude Code)
- Transfer sensitive credentials in context
- Forget to save the return response to 1Password
- Let ClaudeSync items accumulate (clean up regularly)

---

## Integration with Cloud Tracker

When handoff is used, Cloud Tracker records:
- `session_source`: `'mixed'` (indicates both Claude Code and claude.ai)
- Timeline of when handoff occurred
- Duration in each interface (estimated)

This helps track where development time is spent and which interface is most productive for different task types.

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/start` | Begin session, check for ClaudeSync items |
| `/end --handoff` | End session with handoff preparation |
| `/pause --handoff` | Pause with handoff (for quick transfers) |
| `/resume` | Resume paused session (does not check ClaudeSync) |

---

## Future Enhancements

- Automatic context compression for large codebases
- Direct API integration between Claude Code and claude.ai
- Real-time sync of context changes
- Multi-session handoff tracking
