# /reverse-engineer - Study Winning OSS to Build Faster

Find successful open-source implementations of a feature, check their licenses for commercial safety, study their patterns, and produce an actionable implementation guide.

## When to Use

Run `/reverse-engineer [feature]` when:
- "I don't know how to build this technically"
- "I don't know what to ask"
- Building any feature where SaaS products already exist (visual editor, auth, billing, live preview, etc.)
- Before designing a custom protocol, data format, or UX pattern
- You want to stand on shoulders of giants, not reinvent wheels

## Process

### Step 1: Find Who's Winning

Search GitHub and npm for the top 3-5 implementations:
- GitHub: `"[feature]" [framework] site:github.com`
- npm: packages with >1k weekly downloads in this space
- Look for: official SDKs from SaaS companies, popular OSS tools, battle-tested libraries

### Step 2: License Check (MANDATORY BEFORE READING CODE)

For each candidate, check the LICENSE file:

| License | Can Use Commercially | Can Copy Code | Can Adapt Patterns |
|---------|---------------------|---------------|-------------------|
| MIT | YES | YES (keep attribution) | YES |
| Apache 2.0 | YES | YES (keep notice) | YES |
| BSD 2/3-Clause | YES | YES | YES |
| ISC | YES | YES | YES |
| LGPL | YES (as external lib) | NO incorporation | YES |
| GPL/AGPL | Must open-source product | NO | YES (patterns only) |
| BSL/SSPL | Not SaaS production | NO | YES (patterns only) |
| Proprietary | Check TOS | NO | YES (behavior study) |

**Clean Room Rule:** Study API/behavior/protocol (not code), re-implement yourself = always safe.

### Step 3: Read the Source (MIT/Apache only)

For license-safe repos, read the actual implementation. Identify:
1. **Protocol**: What events/messages are exchanged? In what format?
2. **Data schema**: How are components/fields identified? What attributes?
3. **Handshake**: How do participants signal readiness?
4. **Update strategy**: How are changes applied? (DOM replace? reload? HMR?)
5. **Error handling**: How are failures surfaced?

### Step 4: Extract the Pattern

Write a summary of what to adapt (not copy):
- The CONCEPT, not the code
- The PROTOCOL, not the implementation
- The DATA SCHEMA, adapted for our stack

### Step 5: Implementation Guide

Produce:
1. **What to build**: Clear description of the adapted approach
2. **Files to create/modify**: Specific file paths in our codebase
3. **Data format**: Exact shape of messages/attributes/events
4. **Step sequence**: Ordered implementation steps
5. **References**: Links to source repos with license notes

### Step 6: Save to Resources

Add findings to `~/.claude/projects/-Users-jb/memory/resources-[domain].md` so future sessions don't repeat the research.

## Example

```
/reverse-engineer "iframe visual editor click-to-select"

Finds: Payload CMS live-preview (MIT), Contentful live-preview (MIT), Storyblok Astro (MIT)
License check: All MIT — safe to adapt
Key patterns found:
  - postMessage protocol: { type: 'select', fieldId: '...', entryId: '...' }
  - Data attributes: data-entry-id, data-field-id on every editable element
  - DOM replaceWith() for partial updates (no full reload)
Implementation guide: [specific steps for VaporForge Agency Mode]
Saved to: resources-visual-editing.md
```

## Legal Notes

- Reading MIT/Apache code is ethical and legal for commercial products
- Attribution in comments is good practice: `// Inspired by Payload CMS live-preview (MIT)`
- Don't wholesale copy files — adapt the patterns to your implementation
- When in doubt: implement from scratch using only the behavioral pattern as a guide
- Proprietary SaaS: study the UI/API behavior, never the code
