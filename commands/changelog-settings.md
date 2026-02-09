---
description: Configure changelog generator settings (categories, voice, output format)
---

# Changelog Settings

Interactive configuration for the `/changelog` skill. Settings are persisted to `~/.claude/changelog-config.json`.

## Arguments

Parse `$ARGUMENTS` for direct actions:
- `show` or no args — display current settings
- `reset` — reset to defaults
- `voice <tone>` — set tone (professional, casual, technical, marketing)
- `icons on|off` — toggle category icons
- `hashes on|off` — toggle commit hash display
- `authors on|off` — toggle author display
- `rewrite on|off` — toggle technical-to-user rewriting
- `format markdown|html` — set output format
- `audience <type>` — set audience (end-users, developers, stakeholders, internal)
- `file <path>` — set output file path (e.g. CHANGELOG.md, RELEASES.md)
- `exclude add <prefix>` — add a prefix to exclude list
- `exclude remove <prefix>` — remove a prefix from exclude list

## Instructions

### If No Arguments or `show`:

Read `~/.claude/changelog-config.json` and display a formatted summary:

```
Changelog Generator Settings
=============================

Categories:
  features      -> "New Features"       [feat]
  improvements  -> "Improvements"       [improve, enhance, perf, refactor]
  fixes         -> "Bug Fixes"          [fix, bugfix, hotfix]
  breaking      -> "Breaking Changes"   [breaking, BREAKING]
  security      -> "Security"           [security, vuln]
  docs          -> "Documentation"      [docs, doc]

Excluded Prefixes: chore, ci, test, wip, merge
Excluded Patterns: ^Merge branch, ^Merge pull request, ^wip, ^WIP

Output:
  Format:         markdown
  Style:          customer-friendly
  Icons:          off
  Commit hashes:  off
  Authors:        off
  Group by cat:   yes
  Date header:    yes

Voice:
  Tone:           professional
  Audience:       end-users
  Rewrite:        yes

Defaults:
  Range:          since last tag
  Save to:        CHANGELOG.md
  Prepend:        yes
  Push artifact:  no
```

Then ask what they want to change using AskUserQuestion:

Options:
1. "Change voice/tone" — Show tone options
2. "Change output format" — Show format options
3. "Edit categories" — Add/remove/rename categories
4. "Edit exclusions" — Modify excluded prefixes/patterns
5. "Done" — Exit settings

### If Direct Action Provided:

Execute the action immediately:

**`voice <tone>`**: Update `voice.tone` in config. Valid tones:
- `professional` — Clean, business-appropriate language
- `casual` — Friendly, conversational tone
- `technical` — Developer-oriented, preserves technical detail
- `marketing` — Benefit-focused, enthusiastic language

**`audience <type>`**: Update `voice.audience` in config. Valid types:
- `end-users` — Non-technical product users
- `developers` — Technical audience (API consumers, contributors)
- `stakeholders` — Business/management audience
- `internal` — Team-internal documentation

**`icons on|off`**: Update `output.use_icons`.

**`hashes on|off`**: Update `output.include_commit_hash`.

**`authors on|off`**: Update `output.include_author`.

**`rewrite on|off`**: Update `voice.rewrite_technical`.

**`format markdown|html`**: Update `output.format`.

**`file <path>`**: Update `defaults.save_to_file`.

**`exclude add <prefix>`**: Append to `exclude_prefixes` array (no duplicates).

**`exclude remove <prefix>`**: Remove from `exclude_prefixes` array.

**`reset`**: Overwrite config with the default template (same as initial install).

### Interactive Category Editing

If user chooses "Edit categories":

Use AskUserQuestion to offer:
1. "Add a category" — Ask for: key, label, commit prefixes
2. "Remove a category" — Show list, pick one to remove
3. "Rename a category" — Show list, pick one, enter new label
4. "Edit prefixes" — Show list, pick category, add/remove prefixes
5. "Back" — Return to main settings menu

### Saving Changes

After any change:
1. Read current `~/.claude/changelog-config.json`
2. Apply the modification immutably (spread existing, overlay changes)
3. Write back to `~/.claude/changelog-config.json` with 2-space indentation
4. Confirm: "Updated {setting name} to {new value}."

## Error Handling

**Config file missing**: Create it from the default template and continue.

**Invalid tone/audience/format**: Show valid options and re-prompt.

**Duplicate exclude prefix**: Skip silently with message "'{prefix}' is already excluded."

## Tips

- Settings apply globally across all repositories
- Per-project overrides: create a `.changelog-config.json` in the repo root
  (the /changelog skill should check repo root first, then fall back to global)
- Use `show` to verify settings before generating a changelog
- The `marketing` tone works well for app store update descriptions
- The `technical` tone is useful for developer-facing changelogs (API SDKs, libraries)
