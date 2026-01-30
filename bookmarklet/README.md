# Claude Codex Bookmarklets

Lightweight browser tools for quick Claude Codex sync. No extension installation required!

## What are Bookmarklets?

Bookmarklets are JavaScript snippets saved as browser bookmarks. Click them to run powerful scripts on any webpage.

**Advantages:**
- No extension installation
- Works in all browsers
- No permissions needed
- Instant setup

## Available Bookmarklets

### 1. Sync from GitHub

Fetches latest Claude Codex config from GitHub and either:
- Injects into Claude.ai Project custom instructions (if on Claude.ai)
- Copies to clipboard (everywhere else)

**Install:**
Drag this link to your bookmarks bar → <a href="javascript:(async()=>{const u='https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md';const l=document.createElement('div');l.style.cssText='position:fixed;top:20px;right:20px;padding:16px 24px;background:#3b82f6;color:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:999999;font-family:system-ui;font-size:14px;font-weight:500;';l.textContent='⏳ Fetching Codex...';document.body.appendChild(l);try{const r=await fetch(u);if(!r.ok)throw new Error(`HTTP ${r.status}`);const c=await r.text();const v=c.match(/version[:\s]+(\d+\.\d+\.\d+)/i)?.[1]||new Date().toISOString().split('T')[0];const t=document.querySelector('textarea[placeholder*=\"custom instructions\"],textarea[placeholder*=\"Custom instructions\"],textarea');if(t&&location.hostname.includes('claude.ai')){if(confirm(`Inject Codex v${v}?`)){t.value=c;t.dispatchEvent(new Event('input',{bubbles:true}));t.dispatchEvent(new Event('change',{bubbles:true}));l.textContent=`✅ Codex v${v} injected!`;l.style.background='#10b981';}else{await navigator.clipboard.writeText(c);l.textContent=`📋 Codex v${v} copied!`;l.style.background='#8b5cf6';}}else{await navigator.clipboard.writeText(c);l.textContent=`📋 Codex v${v} copied!`;l.style.background='#8b5cf6';}setTimeout(()=>l.remove(),3000);}catch(e){l.textContent=`❌ Failed: ${e.message}`;l.style.background='#ef4444';setTimeout(()=>l.remove(),5000);}})();">🔄 Sync Codex</a>

### 2. Add to Codex

Select any text on a webpage, click this bookmarklet, and add it to your Codex as a new pattern.

**Install:**
Drag this link to your bookmarks bar → <a href="javascript:(async()=>{const s=window.getSelection().toString().trim();if(!s){alert('❌ Select text first!');return;}const o=document.createElement('div');o.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);z-index:999998;display:flex;align-items:center;justify-content:center;font-family:system-ui;';const f=document.createElement('div');f.style.cssText='background:white;border-radius:12px;padding:32px;max-width:500px;width:90%;box-shadow:0 20px 25px rgba(0,0,0,0.3);';f.innerHTML=`<h2 style=\"margin:0 0 20px;color:#1f2937;font-size:24px;\">Add to Codex</h2><div style=\"margin-bottom:16px;\"><label style=\"display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;\">Name</label><input type=\"text\" id=\"codex-name\" placeholder=\"e.g. React hook\" style=\"width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;\"></div><div style=\"margin-bottom:16px;\"><label style=\"display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;\">Category</label><select id=\"codex-category\" style=\"width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;\"><option value=\"skills/learned\">Skill</option><option value=\"commands\">Command</option><option value=\"agents\">Agent</option><option value=\"rules\">Rule</option></select></div><div style=\"margin-bottom:20px;\"><label style=\"display:block;margin-bottom:8px;color:#374151;font-weight:600;font-size:14px;\">Description</label><textarea id=\"codex-desc\" placeholder=\"What does this do?\" style=\"width:100%;padding:10px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;min-height:80px;\"></textarea></div><div style=\"display:flex;gap:12px;\"><button id=\"codex-submit\" style=\"flex:1;padding:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;\">Add</button><button id=\"codex-cancel\" style=\"padding:12px 20px;background:#e5e7eb;color:#374151;border:none;border-radius:6px;font-weight:600;cursor:pointer;\">Cancel</button></div>`;o.appendChild(f);document.body.appendChild(o);document.getElementById('codex-cancel').onclick=()=>o.remove();document.getElementById('codex-submit').onclick=async()=>{const n=document.getElementById('codex-name').value.trim();const c=document.getElementById('codex-category').value;const d=document.getElementById('codex-desc').value.trim();if(!n||!d){alert('Fill all fields');return;}const fn=n.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'.md';const content=`---\nname: ${n}\ndescription: ${d}\nsource: ${location.href}\nadded: ${new Date().toISOString().split('T')[0]}\n---\n\n# ${n}\n\n${d}\n\n## Implementation\n\n\`\`\`\n${s}\n\`\`\`\n`;await navigator.clipboard.writeText(content);o.remove();alert(`✅ Copied! Save as ~/.claude/${c}/${fn}`);};})();">➕ Add to Codex</a>

## Manual Installation

If drag-and-drop doesn't work:

### Chrome/Edge/Brave

1. Right-click bookmarks bar → "Add page"
2. Name: `Sync Codex` or `Add to Codex`
3. URL: Copy the code from the `.min.js` files
4. Save

### Safari

1. Right-click bookmarks bar → "Add Bookmark"
2. Name: `Sync Codex` or `Add to Codex`
3. Address: Copy the code from the `.min.js` files
4. Save

### Firefox

1. Right-click bookmarks bar → "New Bookmark"
2. Name: `Sync Codex` or `Add to Codex`
3. Location: Copy the code from the `.min.js` files
4. Save

## Usage Examples

### Sync from GitHub

**On Claude.ai:**
1. Navigate to `claude.ai/projects`
2. Open a Project
3. Go to Settings
4. Click "Sync Codex" bookmarklet
5. Confirm injection
6. Config appears in custom instructions

**On any other page:**
1. Click "Sync Codex" bookmarklet
2. Latest config is copied to clipboard
3. Paste wherever needed

### Add to Codex

**Capture a code snippet:**
1. Find useful code on GitHub/StackOverflow/etc.
2. Select the code
3. Click "Add to Codex" bookmarklet
4. Fill in:
   - Name: "React useDebounce hook"
   - Category: "Skill"
   - Description: "Debounce hook for React"
5. Click "Add"
6. Markdown is copied to clipboard
7. Create file `~/.claude/skills/learned/react-use-debounce-hook.md`
8. Paste content
9. Auto-sync will commit and push

## Troubleshooting

### Bookmarklet doesn't run

**Problem:** Nothing happens when clicked

**Solutions:**
1. Make sure JavaScript is enabled
2. Try on a different page (some sites block bookmarklets)
3. Check browser console for errors

### Can't find textarea on Claude.ai

**Problem:** "Textarea not found" error

**Solutions:**
1. Make sure you're on a Project page (`claude.ai/project/...`)
2. Navigate to Project Settings
3. Look for "Custom instructions" section
4. If still fails, manually copy to clipboard instead

### Fetch fails

**Problem:** "HTTP 404" or network error

**Solutions:**
1. Check GitHub repo is accessible: https://github.com/Aventerica89/claude-codex
2. Check raw URL works: https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md
3. Try again (could be temporary GitHub issue)
4. Check browser network tab for details

### Content doesn't paste correctly

**Problem:** Pasted content is malformed

**Solutions:**
1. Make sure clipboard permissions are granted
2. Try manual paste: Cmd+V (Mac) or Ctrl+V (Windows)
3. Check if content is too large (>100KB)

## Customization

### Change GitHub URL

Edit the bookmarklet code:

```javascript
const GITHUB_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/CLAUDE.md';
```

### Change notification style

Edit the `loading` element styles:

```javascript
loading.style.cssText = '...your custom CSS...';
```

### Add keyboard shortcut

Some browsers (like Vivaldi) support keyboard shortcuts for bookmarks:

1. Right-click bookmark → "Edit"
2. Add shortcut: `Ctrl+Shift+C`

## Advanced: Build Your Own

Want to modify the bookmarklets?

1. Edit the source `.js` files
2. Minify manually or use:
   ```bash
   npx terser sync-from-github.js -c -m -o sync-from-github.min.js
   ```
3. Test locally:
   - Copy code
   - Open browser console
   - Paste and run
4. Save as bookmarklet

## Source Files

- `sync-from-github.js` - Readable source
- `sync-from-github.min.js` - Minified (use this for bookmarklet)
- `add-to-codex.js` - Readable source
- `add-to-codex.min.js` - Minified (use this for bookmarklet)

## Security

**What data is collected?**
- None. Bookmarklets run entirely in your browser.

**What permissions are needed?**
- None. JavaScript runs with page permissions.

**Is my data safe?**
- Yes. Nothing is sent to any server except GitHub (public fetch).

## Comparison: Extension vs Bookmarklet

| Feature | Browser Extension | Bookmarklet |
|---------|-------------------|-------------|
| Installation | Load unpacked | Drag to bookmarks |
| Updates | Manual reload | Edit bookmark |
| Background sync | Yes (hourly) | No (click to sync) |
| Floating button | Yes (automatic) | No (manual click) |
| Offline cache | Yes (1 hour) | No (always fetches) |
| Best for | Daily users | Occasional users |

## FAQ

**Q: Do bookmarklets work on mobile?**
A: Limited. iOS Safari supports them, but mobile browsers often hide bookmarks bar.

**Q: Can I share bookmarklets with my team?**
A: Yes! Share the `.min.js` file or the GitHub raw URL.

**Q: Will these break if Claude.ai changes their UI?**
A: Possibly. The extension is more resilient, but bookmarklets try multiple selectors.

**Q: Can I run bookmarklets automatically on page load?**
A: No. Bookmarklets require manual click for security reasons.

## Contributing

Improve the bookmarklets:
https://github.com/Aventerica89/claude-codex/tree/main/bookmarklet

## License

MIT - See LICENSE file
