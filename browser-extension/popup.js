// Popup logic for Claude Codex Sync extension

const versionEl = document.getElementById('version')
const lastUpdatedEl = document.getElementById('lastUpdated')
const sourceEl = document.getElementById('source')
const syncBtn = document.getElementById('syncBtn')
const refreshBtn = document.getElementById('refreshBtn')
const clearBtn = document.getElementById('clearBtn')

// Format timestamp
function formatTime(timestamp) {
  if (!timestamp) return 'Never'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}min ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

// Load status
async function loadStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getConfig',
      forceRefresh: false
    })

    if (response.error) {
      throw new Error(response.error)
    }

    versionEl.textContent = response.version || '1.0.0'
    lastUpdatedEl.textContent = formatTime(response.timestamp)
    sourceEl.textContent = response.fromCache ? 'Cached' : 'GitHub'

    console.log('[Popup] Status loaded:', response)
  } catch (error) {
    console.error('[Popup] Failed to load status:', error)
    versionEl.textContent = 'Error'
    lastUpdatedEl.textContent = error.message
    sourceEl.textContent = '-'
  }
}

// Sync to Claude.ai
async function syncToClaudeAi() {
  syncBtn.disabled = true
  syncBtn.innerHTML = '<span class="spinner"></span> Syncing...'

  try {
    // Check if we're on Claude.ai
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

    if (!tab.url || !tab.url.includes('claude.ai')) {
      alert('Please navigate to claude.ai/projects first')
      return
    }

    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'injectCodex',
      forceRefresh: false
    })

    if (response.success) {
      console.log('[Popup] Sync successful:', response)
      alert(`✅ Codex v${response.version} synced!`)
    } else if (!response.cancelled) {
      throw new Error(response.error || 'Sync failed')
    }
  } catch (error) {
    console.error('[Popup] Sync failed:', error)
    alert(`❌ Sync failed: ${error.message}`)
  } finally {
    syncBtn.disabled = false
    syncBtn.innerHTML = '🔄 Sync to Claude.ai'
  }
}

// Refresh from GitHub
async function refreshFromGitHub() {
  refreshBtn.disabled = true
  refreshBtn.innerHTML = '<span class="spinner"></span> Refreshing...'

  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getConfig',
      forceRefresh: true
    })

    if (response.error) {
      throw new Error(response.error)
    }

    console.log('[Popup] Refresh successful:', response)
    alert(`✅ Fetched latest from GitHub\n\nVersion: ${response.version}`)

    // Reload status
    await loadStatus()
  } catch (error) {
    console.error('[Popup] Refresh failed:', error)
    alert(`❌ Refresh failed: ${error.message}`)
  } finally {
    refreshBtn.disabled = false
    refreshBtn.innerHTML = '↻ Refresh from GitHub'
  }
}

// Clear cache
async function clearCache() {
  if (!confirm('Clear cached config? This will fetch fresh from GitHub next time.')) {
    return
  }

  clearBtn.disabled = true
  clearBtn.innerHTML = '<span class="spinner"></span> Clearing...'

  try {
    await chrome.runtime.sendMessage({ action: 'clearCache' })

    console.log('[Popup] Cache cleared')
    alert('✅ Cache cleared')

    // Reload status
    versionEl.textContent = '-'
    lastUpdatedEl.textContent = '-'
    sourceEl.textContent = '-'
  } catch (error) {
    console.error('[Popup] Clear failed:', error)
    alert(`❌ Clear failed: ${error.message}`)
  } finally {
    clearBtn.disabled = false
    clearBtn.innerHTML = '🗑️ Clear Cache'
  }
}

// Event listeners
syncBtn.addEventListener('click', syncToClaudeAi)
refreshBtn.addEventListener('click', refreshFromGitHub)
clearBtn.addEventListener('click', clearCache)

// Load status on popup open
loadStatus()
