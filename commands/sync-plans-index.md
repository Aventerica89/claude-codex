Sync the plans index at ~/Desktop/plans-index.html with the current state of ~/.claude/plans/.

Steps:
1. Read all .md files in ~/.claude/plans/ and get each file's first H1 heading (first line starting with #) as the title
2. Read the current ~/Desktop/plans-index.html
3. For any plan files NOT already listed in the HTML, add them to the appropriate project section based on the title (VaporForge → vaporforge section, WP Dispatch → wp-dispatch section, etc.) or to a "Recently Added" section if the project is unclear
4. Remove any plan cards referencing files that no longer exist in ~/.claude/plans/
5. Write the updated HTML back to ~/Desktop/plans-index.html
6. Report: how many plans added, how many removed, total plan count

Do not change existing card descriptions — only add missing cards or remove stale ones.
Also check ~/Desktop/ for any *-plan.md files (manually created plans) and ensure they appear in the "Stockpiled Plans" section of the HTML with their correct file paths.
