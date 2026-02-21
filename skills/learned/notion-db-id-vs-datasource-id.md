# Notion DB URL ID vs API data_source_id

**Extracted:** 2026-02-20
**Context:** Whenever creating pages in a Notion database via MCP

## Problem

A Notion database URL contains an ID (e.g., `885cd9c275bd45bb93e17fe0f156d1b1`) that looks like it should be the `data_source_id` for page creation — but it is NOT. Using the URL ID directly fails or creates pages in the wrong location.

Additionally, property names in Notion DBs are not standardized — the title property may not be called `Title` (e.g., it could be `Standard`, `Task Name`, `Name`), and select options must be known in advance.

## Solution

**Before creating any pages in a Notion DB**, call `notion-fetch` on the database URL to discover:

1. The actual `data_source_id` (collection ID) — shown as `collection://{data_source_id}` in fetch results
2. The correct title property name
3. Valid values for all select/multi-select fields

```
notion-fetch(url: "https://www.notion.so/885cd9c275bd45bb93e17fe0f156d1b1?v=...")
```

Then use the `data_source_id` from the fetch result, not the URL ID.

## Example

Session: Claude Code Standards DB
- URL ID (from browser): `885cd9c275bd45bb93e17fe0f156d1b1`
- Actual data_source_id (from fetch): `8049bc40-29af-4ce1-ad80-cc973d78cc98`
- Title property: `Standard` (not `Title`)
- Type options: `Convention`, `Command`, `Reference`, `Setup`, `Automation`

```json
// WRONG — using URL ID directly
{"parent": {"data_source_id": "885cd9c275bd45bb93e17fe0f156d1b1"}}

// CORRECT — using ID from notion-fetch result
{"parent": {"data_source_id": "8049bc40-29af-4ce1-ad80-cc973d78cc98"}}
```

## When to Use

Any time you need to create Notion pages in a specific database and only have the DB URL or the URL-visible ID. Always fetch schema first — it takes one extra call but prevents silent failures and wrong property names.
