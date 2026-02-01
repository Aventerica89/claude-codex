# macOS Workspace Modes (Safari Tab Switching)

**Status:** Idea - needs debugging
**Created:** 2026-01-31

## Concept

Simple macOS automation to switch between work contexts:
- "Web Dev" mode: Basecamp (left monitor) + Bricks Builder (right monitor)
- "Mockup" mode: HTML mockup (left) + Notes (right)

## Approach

AppleScript + Shortcuts.app:
1. Find Safari windows/tabs by URL
2. Position on specific monitors
3. Trigger via keyboard shortcut

## Files Created

```
~/Library/Scripts/WorkspaceModes/
├── WebDev.scpt
├── MockupOverview.scpt
├── DetectMonitors.scpt
└── README.md
```

## Issues to Debug

- Shortcut didn't trigger the script
- May need to test osascript directly first:
  ```bash
  osascript ~/Library/Scripts/WorkspaceModes/WebDev.scpt
  ```
- Check Safari permissions in System Settings → Privacy → Automation
- Shell script in Shortcuts may need full path: `/usr/bin/osascript`

## Monitor Setup

User's monitors:
- External: 2816x1940 (left, x=-2816)
- Main: 3024x1964 (right, x=0)

## Next Steps

1. Test scripts directly in Terminal first
2. Grant Safari automation permissions
3. Debug Shortcuts shell script execution
4. Consider alternatives: Raycast, Alfred, or Hammerspoon
