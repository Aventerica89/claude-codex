# Claude Codex Browser Extension

One-click sync of Claude Codex configuration to Claude.ai Projects.

## Features

- **One-Click Sync** - Click the floating button on Claude.ai to sync your Codex config
- **Automatic Caching** - Fetches from GitHub and caches for 1 hour
- **Version Tracking** - Shows which version is currently synced
- **Offline Support** - Uses cached config if GitHub is unreachable
- **Auto-Refresh** - Refreshes from GitHub every hour in the background

## Installation

### Chrome/Edge

1. **Build the icons** (one-time):
   ```bash
   cd browser-extension
   ./create-icons.sh  # Creates icons from SVG
   ```

2. **Load as unpacked extension**:
   - Open Chrome/Edge
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `browser-extension/` directory

3. **Verify installation**:
   - Extension icon should appear in toolbar
   - Click icon to see popup with status

### Safari (macOS)

Safari requires Xcode conversion:

```bash
cd browser-extension
xcrun safari-web-extension-converter . --app-name "Claude Codex Sync"
```

Then:
1. Open the generated Xcode project
2. Build and run
3. Enable extension in Safari preferences

## Usage

### Method 1: Floating Button (Recommended)

1. Navigate to `claude.ai/projects`
2. Open your Project settings
3. Click the **"🔄 Sync Codex"** button (bottom-right of page)
4. Confirm the sync dialog
5. Config is automatically injected into custom instructions

### Method 2: Extension Popup

1. Click the extension icon in toolbar
2. Click **"🔄 Sync to Claude.ai"**
3. Must be on a `claude.ai/projects` page

### Method 3: Copy to Clipboard

1. Click extension icon
2. Copy the displayed config
3. Paste into Project custom instructions

## How It Works

### Background Fetch

```javascript
// Runs on extension install and every hour
fetch('https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md')
  → Cache in chrome.storage.local
  → Display in popup
```

### Content Injection

```javascript
// When you click "Sync Codex" button
1. Find custom instructions textarea
2. Get cached config from storage
3. Inject into textarea
4. Trigger input event so Claude.ai detects change
5. Show success notification
```

### Caching Strategy

- **First time**: Fetch from GitHub
- **Subsequent**: Use cache if < 1 hour old
- **Force refresh**: Click "Refresh from GitHub" button
- **Offline**: Use last cached version

## Configuration

### Update GitHub URL

Edit `background.js`:

```javascript
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/YOUR_USERNAME/claude-codex/main/CLAUDE.md'
```

### Change Cache Duration

Edit `background.js`:

```javascript
const CACHE_DURATION = 3600000 // 1 hour in milliseconds
```

### Customize Button Position

Edit `content.js`:

```javascript
button.style.cssText = `
  position: fixed;
  bottom: 20px;  // Change to top/bottom
  right: 20px;   // Change to left/right
  ...
`
```

## Troubleshooting

### Button Not Appearing

**Possible causes:**
1. Not on a Claude.ai Projects page
2. Page hasn't fully loaded yet
3. Claude.ai UI changed (selector mismatch)

**Solutions:**
```javascript
// Check console for errors
// Content script should log: "[Codex] Content script loaded"

// Try manual injection
chrome.tabs.executeScript({ file: 'content.js' })
```

### Sync Fails

**Possible causes:**
1. Can't find custom instructions textarea
2. GitHub fetch failed
3. No cached config available

**Solutions:**
1. Make sure you're in Project Settings (not just chat)
2. Check network tab for GitHub fetch errors
3. Click "Refresh from GitHub" to force fetch

### Config Not Updating

**Possible causes:**
1. Using cached version (< 1 hour old)
2. GitHub repo not updated
3. Extension needs restart

**Solutions:**
1. Click "Refresh from GitHub" in popup
2. Verify GitHub has latest: `https://github.com/Aventerica89/claude-codex`
3. Right-click extension icon → "Reload extension"

### Textarea Not Found

If the content script can't find the textarea:

```javascript
// Add debug logging
console.log(document.querySelectorAll('textarea'))

// Try all textareas manually
Array.from(document.querySelectorAll('textarea')).forEach((el, i) => {
  console.log(`Textarea ${i}:`, el.placeholder, el.offsetHeight)
})

// Find the right one and update content.js selector
```

## Development

### Run Locally

```bash
# Install dependencies (if any)
npm install

# Watch for changes (if using build tools)
npm run watch

# Reload extension
chrome://extensions/ → Click "Reload"
```

### Debug Console

```bash
# Background script console
chrome://extensions/ → "Inspect views: background page"

# Content script console
Right-click on claude.ai page → "Inspect" → Console

# Popup console
Right-click extension icon → "Inspect popup"
```

### Testing

```bash
# Test on different Claude.ai pages
https://claude.ai/projects
https://claude.ai/project/abc123
https://claude.ai/chat/new

# Test with slow network
DevTools → Network → Throttling: Slow 3G

# Test offline
DevTools → Network → Offline
```

## File Structure

```
browser-extension/
├── manifest.json         # Extension manifest (Manifest V3)
├── background.js         # Service worker (fetch from GitHub)
├── content.js            # Injected into claude.ai pages
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md             # This file
```

## Permissions Explained

```json
{
  "storage": "Store cached config locally",
  "activeTab": "Access current tab URL and inject content",
  "host_permissions": [
    "https://raw.githubusercontent.com/*",  // Fetch from GitHub
    "https://claude.ai/*"                   // Inject into Claude.ai
  ]
}
```

## Security

**What data is collected?**
- None. The extension is fully local.

**What data is sent to servers?**
- Only fetches from GitHub (public repo)
- No analytics, tracking, or telemetry

**Is my config safe?**
- Yes. It's cached locally in `chrome.storage.local`
- Only you can access it
- Cleared when you clear extension data

## Publishing to Chrome Web Store

1. **Prepare icons** (required sizes: 16, 48, 128)
2. **Create promotional images**:
   - 440x280 (small tile)
   - 920x680 (large tile)
   - 1280x800 (screenshot)
3. **Zip the extension**:
   ```bash
   zip -r claude-codex-sync.zip browser-extension/
   ```
4. **Upload to Chrome Web Store**:
   - https://chrome.google.com/webstore/devconsole
   - Pay $5 one-time developer fee
   - Upload ZIP
   - Fill in description, screenshots, etc.
   - Submit for review

## Alternative: Bookmarklet

If you prefer not to install an extension, use this bookmarklet:

```javascript
javascript:(async()=>{const r=await fetch('https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md');const t=await r.text();const ta=document.querySelector('textarea');if(ta){ta.value=t;ta.dispatchEvent(new Event('input',{bubbles:true}));alert('Synced!')}else{navigator.clipboard.writeText(t);alert('Copied to clipboard!')}})();
```

Drag this to your bookmarks bar, then click it on Claude.ai.

## Future Enhancements

- [ ] Dark mode support
- [ ] Multiple config profiles
- [ ] Diff view before syncing
- [ ] Sync to specific Project by name
- [ ] Auto-sync on Project creation
- [ ] Keyboard shortcuts
- [ ] Firefox support
- [ ] Mobile support (iOS/Android)

## Contributing

Found a bug or want to improve the extension?
https://github.com/Aventerica89/claude-codex/issues

## License

MIT - See LICENSE file
