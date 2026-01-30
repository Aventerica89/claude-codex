// Content script for Claude.ai integration

console.log('[Codex] Content script loaded on:', window.location.href)

// Check if we're on a Projects page
function isProjectsPage() {
  return window.location.pathname.includes('/project/')
}

// Find the custom instructions textarea
function findCustomInstructionsTextarea() {
  // Try multiple selectors (Claude.ai UI may change)
  const selectors = [
    'textarea[placeholder*="custom instructions"]',
    'textarea[placeholder*="Custom instructions"]',
    'textarea[aria-label*="custom instructions"]',
    'textarea[name="custom-instructions"]',
    'textarea[id*="custom-instructions"]',
    'div[data-testid="custom-instructions"] textarea',
    'div[class*="custom-instructions"] textarea'
  ]

  for (const selector of selectors) {
    const element = document.querySelector(selector)
    if (element) {
      console.log('[Codex] Found custom instructions textarea:', selector)
      return element
    }
  }

  // Fallback: find any large textarea (risky but better than nothing)
  const textareas = document.querySelectorAll('textarea')
  for (const textarea of textareas) {
    if (textarea.offsetHeight > 100) { // Likely a large input field
      console.log('[Codex] Found potential textarea (fallback)')
      return textarea
    }
  }

  console.warn('[Codex] Could not find custom instructions textarea')
  return null
}

// Inject Codex config into textarea
async function injectCodex(forceRefresh = false) {
  const textarea = findCustomInstructionsTextarea()

  if (!textarea) {
    return {
      success: false,
      error: 'Custom instructions textarea not found. Make sure you\'re in Project Settings.'
    }
  }

  try {
    // Get config from background script
    const response = await chrome.runtime.sendMessage({
      action: 'getConfig',
      forceRefresh
    })

    if (response.error) {
      throw new Error(response.error)
    }

    const { content, version, fromCache } = response

    // Confirm with user before injecting
    const confirmMessage = fromCache
      ? `Sync Claude Codex v${version}?\n\n(Using cached version)`
      : `Sync Claude Codex v${version}?\n\n(Fresh from GitHub)`

    if (!confirm(confirmMessage)) {
      return { success: false, cancelled: true }
    }

    // Inject content
    textarea.value = content

    // Trigger input event so Claude.ai detects the change
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new Event('change', { bubbles: true }))

    // Show success notification
    showNotification(`✅ Codex v${version} synced!`, 'success')

    return {
      success: true,
      version,
      fromCache,
      length: content.length
    }
  } catch (error) {
    console.error('[Codex] Injection failed:', error)
    showNotification(`❌ Sync failed: ${error.message}`, 'error')
    return { success: false, error: error.message }
  }
}

// Show temporary notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    animation: slideIn 0.3s ease-out;
  `

  // Add animation
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `
  document.head.appendChild(style)

  document.body.appendChild(notification)

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out'
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Add sync button to page
function addSyncButton() {
  if (!isProjectsPage()) return

  // Check if button already exists
  if (document.getElementById('claude-codex-sync-btn')) return

  const button = document.createElement('button')
  button.id = 'claude-codex-sync-btn'
  button.textContent = '🔄 Sync Codex'
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
    z-index: 999998;
    transition: transform 0.2s, box-shadow 0.2s;
  `

  button.onmouseover = () => {
    button.style.transform = 'translateY(-2px)'
    button.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1)'
  }

  button.onmouseout = () => {
    button.style.transform = 'translateY(0)'
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)'
  }

  button.onclick = async () => {
    button.disabled = true
    button.textContent = '⏳ Syncing...'

    const result = await injectCodex(false)

    button.disabled = false
    button.textContent = '🔄 Sync Codex'

    if (result.success) {
      console.log('[Codex] Sync successful:', result)
    } else if (!result.cancelled) {
      console.error('[Codex] Sync failed:', result.error)
    }
  }

  document.body.appendChild(button)
  console.log('[Codex] Sync button added to page')
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'injectCodex') {
    injectCodex(request.forceRefresh)
      .then(sendResponse)
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }
})

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addSyncButton)
} else {
  addSyncButton()
}

// Re-add button on navigation (SPA routing)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    setTimeout(addSyncButton, 1000) // Wait for page to settle
  }
}).observe(document, { subtree: true, childList: true })
