---
name: hipaa-sync
description: Sync all HIPAA documentation — update memory files, regenerate PDFs from HTML source files, regenerate DOCX, archive old interaction log entries, and verify cross-document consistency. Run at the end of any HIPAA-related session.
---

# HIPAA Sync

Synchronizes all HIPAA documentation after any session that updated facts, contacts, risk assessments, or events.

## Paths

- **Source HTML:** `~/Desktop/HIPAA/Source/` (editable files)
- **Output PDFs:** `~/Desktop/HIPAA/` (one per HTML source)
- **Archive:** `~/Desktop/HIPAA/Archive/`
- **Memory file:** `~/.claude/projects/-Users-jb/memory/hdflowsheet-hipaa.md`
- **Chrome:** `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **Pandoc:** `/opt/homebrew/bin/pandoc`

## Steps — Execute in Order

### 1. Review What Changed This Session

Before touching any files, summarize to the user:
- What new facts were learned today
- What documents were updated
- What the current status of the situation is

### 2. Update Memory File

Read `~/.claude/projects/-Users-jb/memory/hdflowsheet-hipaa.md` and update:
- Status line with today's date and current situation
- Attorney contact status (who responded, who didn't, next follow-up date)
- Any new risk level changes
- Next pending action

### 3. Regenerate All PDFs

Run Chrome headless for each HTML in `Source/`. Map each HTML to its PDF output name:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
SRC=~/Desktop/HIPAA/Source
OUT=~/Desktop/HIPAA

for html in "$SRC"/*.html; do
  name=$(basename "$html" .html)
  "$CHROME" --headless=new \
    --print-to-pdf="$OUT/$name.pdf" \
    --no-pdf-header-footer \
    --print-to-pdf-no-header \
    "file://$html" 2>/dev/null && echo "Generated $name.pdf"
done
```

### 4. Regenerate DOCX Files

Regenerate DOCX for key documents (not all — only the ones attorneys or employers may receive):

```bash
PANDOC=/opt/homebrew/bin/pandoc
SRC=~/Desktop/HIPAA/Source
OUT=~/Desktop/HIPAA/Source

for name in HIPAA-Action-Plan interaction-log HDFlowsheet-HIPAA-Disclosure-v2 personal-timeline; do
  $PANDOC "$SRC/$name.html" -o "$OUT/$name.docx" 2>/dev/null && echo "Generated $name.docx"
done
```

### 5. Archive Old Interaction Log Entries (When Log Grows)

When the interaction-log has more than 3 months of entries, or the user requests archiving:

1. Read `Source/interaction-log.html`
2. Extract entries older than 30 days into a dated archive file: `Archive/interaction-log-YYYY-MM.html`
3. Leave only the current month's entries in the main file
4. Add a note at the top of the main file linking to archived logs

Do NOT auto-archive without confirming with the user first.

### 6. Cross-Document Consistency Check

Scan for inconsistencies across documents. Common things to verify:
- Attorney contact status is identical in Action Plan, Attorney Research, and Attorney Options
- Risk assessment table matches across all documents that include one
- "Status" line (admin leave, no employer contact, etc.) is identical everywhere
- No document still says Rosati is #1 if ranking has been updated

Flag any inconsistencies to the user before completing sync.

### 7. Confirm Completion

Report to user:
- Files updated (list)
- PDFs regenerated (list with byte sizes)
- DOCX regenerated (list)
- Any inconsistencies found and fixed
- Memory file update summary
- Suggested next follow-up date (e.g., "Follow up on attorney emails by Feb 20 if no response")

## When to Run

- End of any HIPAA session where new information was added
- After attorney calls or contacts
- After receiving any communication from HR, AHS, or the BON
- Before printing or sharing documents with an attorney
- Weekly while situation is active

## Notes

- Never modify `HDFlowsheet-HIPAA-Disclosure-v2` content without explicit user instruction — it is a legal document pending attorney review
- Never push any of these files to a git repo or cloud service
- The `Source/` subfolder contains sensitive legal strategy — treat as confidential
