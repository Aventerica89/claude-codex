# Reverse-Engineer Success Workflow

**Extracted:** 2026-02-18
**Context:** When building a feature you don't know how to implement technically

## Problem

"I don't know what I don't know" — it's easy to invent an inferior solution from scratch
while established OSS projects have already solved the same problem elegantly.

Example: VaporForge Agency Mode needed click-to-select in an iframe preview. Multiple
SaaS products (Storyblok, Contentful, Payload CMS, Sanity) had already solved this with
open-source SDKs. Studying them saved weeks of wrong-direction engineering.

## The Workflow

### Step 1: Find Who's Winning

Search for OSS projects and SaaS tools doing what you want:
- GitHub: `"[feature name]" site:github.com`
- npm: search for packages in the problem space with high download counts
- Ask: "What's the most popular [X] for [framework]?"

### Step 2: License Check FIRST (Before Reading Code)

| License | Commercial SaaS | Copy Code | Adapt Patterns |
|---------|----------------|-----------|----------------|
| MIT | YES | YES (keep header) | YES |
| Apache 2.0 | YES | YES (keep notice) | YES |
| BSD 2/3-Clause | YES | YES | YES |
| ISC | YES | YES | YES |
| LGPL | YES (as library) | NO (incorporate) | YES |
| GPL | Requires open-source | NO | YES (patterns) |
| AGPL | Requires open-source | NO | YES (patterns) |
| BSL/SSPL | Not SaaS production | NO | YES (patterns) |
| Proprietary | Check TOS | NO | YES (behavior study) |

**Clean Room Rule**: Study the API/behavior/protocol (not the code) and re-implement yourself = always safe.

### Step 3: Study the Implementation

For MIT/Apache repos — read the actual source. Identify:
- **Protocol**: What events/messages are exchanged and in what format?
- **Data schema**: What attributes/fields identify components/fields?
- **Handshake**: How do participants signal readiness?
- **Update strategy**: How does the system apply changes (replace DOM? reload? HMR?)?

### Step 4: Extract the Pattern, Not the Code

Understand the pattern and implement it in your stack. Example:
```
Payload CMS uses: postMessage({ type: 'payload-live-preview', data: {...} })
VaporForge adapted: postMessage({ type: 'vf-select', component: '...', file: '...' })
```

### Step 5: Document the Lineage

Note inspiration in code/docs (good practice even when not legally required):
```
// postMessage protocol inspired by Payload CMS live-preview (MIT)
// See: github.com/payloadcms/payload/packages/live-preview
```

## When to Use

- Before building any feature where successful SaaS/OSS products already exist
- Before designing a custom protocol (postMessage, API format, wire format)
- Before inventing a custom UX pattern
- Especially when "I don't know what to ask technically"

## Related Resources

- See `resources-visual-editing.md` in memory for Astro visual editor references
- See `resources-open-source-references.md` in memory for broader reference catalog
