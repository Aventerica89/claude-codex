// Claude Codex Sync - Fetch from GitHub bookmarklet
// Drag this to your bookmarks bar or create a bookmark with this code as the URL

javascript:(async () => {
  const GITHUB_URL = 'https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md';

  // Show loading indicator
  const loading = document.createElement('div');
  loading.style.cssText = 'position:fixed;top:20px;right:20px;padding:16px 24px;background:#3b82f6;color:white;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);z-index:999999;font-family:system-ui;font-size:14px;font-weight:500;';
  loading.textContent = '⏳ Fetching Claude Codex...';
  document.body.appendChild(loading);

  try {
    // Fetch from GitHub
    const response = await fetch(GITHUB_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const content = await response.text();
    const version = content.match(/version[:\s]+(\d+\.\d+\.\d+)/i)?.[1] || new Date().toISOString().split('T')[0];

    // Try to inject into textarea (if on Claude.ai)
    const textarea = document.querySelector('textarea[placeholder*="custom instructions"], textarea[placeholder*="Custom instructions"], textarea');

    if (textarea && window.location.hostname.includes('claude.ai')) {
      // Confirm injection
      if (confirm(`Inject Claude Codex v${version} into custom instructions?`)) {
        textarea.value = content;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));

        loading.textContent = `✅ Codex v${version} injected!`;
        loading.style.background = '#10b981';
      } else {
        // Copy to clipboard instead
        await navigator.clipboard.writeText(content);
        loading.textContent = `📋 Codex v${version} copied to clipboard!`;
        loading.style.background = '#8b5cf6';
      }
    } else {
      // Not on Claude.ai or textarea not found - copy to clipboard
      await navigator.clipboard.writeText(content);
      loading.textContent = `📋 Codex v${version} copied to clipboard!`;
      loading.style.background = '#8b5cf6';
    }

    // Remove after 3 seconds
    setTimeout(() => loading.remove(), 3000);
  } catch (error) {
    loading.textContent = `❌ Failed: ${error.message}`;
    loading.style.background = '#ef4444';
    setTimeout(() => loading.remove(), 5000);
  }
})();
