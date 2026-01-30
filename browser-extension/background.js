// Background service worker for Claude Codex Sync extension

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Aventerica89/claude-codex/main/CLAUDE.md'
const CACHE_KEY = 'claudeCodexContent'
const VERSION_KEY = 'claudeCodexVersion'
const LAST_FETCH_KEY = 'lastFetchTime'
const CACHE_DURATION = 3600000 // 1 hour in milliseconds

// Fetch latest config from GitHub
async function fetchCodexConfig() {
  try {
    const response = await fetch(GITHUB_RAW_URL)

    if (!response.ok) {
      throw new Error(`GitHub fetch failed: ${response.status}`)
    }

    const content = await response.text()
    const timestamp = new Date().toISOString()

    // Extract version from content (if present)
    const versionMatch = content.match(/version[:\s]+(\d+\.\d+\.\d+)/i)
    const version = versionMatch ? versionMatch[1] : timestamp.split('T')[0]

    // Cache the content
    await chrome.storage.local.set({
      [CACHE_KEY]: content,
      [VERSION_KEY]: version,
      [LAST_FETCH_KEY]: timestamp
    })

    console.log(`[Codex] Fetched and cached config v${version}`)

    return { content, version, timestamp }
  } catch (error) {
    console.error('[Codex] Fetch failed:', error)

    // Return cached content if available
    const cached = await chrome.storage.local.get([CACHE_KEY, VERSION_KEY, LAST_FETCH_KEY])

    if (cached[CACHE_KEY]) {
      console.log('[Codex] Using cached config')
      return {
        content: cached[CACHE_KEY],
        version: cached[VERSION_KEY],
        timestamp: cached[LAST_FETCH_KEY],
        fromCache: true
      }
    }

    throw error
  }
}

// Get config (from cache or fetch)
async function getCodexConfig(forceRefresh = false) {
  const cached = await chrome.storage.local.get([CACHE_KEY, VERSION_KEY, LAST_FETCH_KEY])

  // Return cache if valid
  if (!forceRefresh && cached[CACHE_KEY] && cached[LAST_FETCH_KEY]) {
    const age = Date.now() - new Date(cached[LAST_FETCH_KEY]).getTime()

    if (age < CACHE_DURATION) {
      console.log(`[Codex] Using cache (age: ${Math.round(age / 60000)}min)`)
      return {
        content: cached[CACHE_KEY],
        version: cached[VERSION_KEY],
        timestamp: cached[LAST_FETCH_KEY],
        fromCache: true
      }
    }
  }

  // Cache expired or force refresh
  return await fetchCodexConfig()
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    getCodexConfig(request.forceRefresh)
      .then(sendResponse)
      .catch(error => sendResponse({ error: error.message }))
    return true // Keep channel open for async response
  }

  if (request.action === 'clearCache') {
    chrome.storage.local.clear()
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }))
    return true
  }
})

// Fetch on install/update and setup alarm
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install' || details.reason === 'update') {
    console.log(`[Codex] Extension ${details.reason}ed`)

    // Setup periodic refresh alarm
    chrome.alarms.create('refreshCodex', { periodInMinutes: 60 })
    console.log('[Codex] Alarm created for hourly refresh')

    try {
      await fetchCodexConfig()
      console.log('[Codex] Initial config fetched')
    } catch (error) {
      console.error('[Codex] Initial fetch failed:', error)
    }
  }
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'refreshCodex') {
    console.log('[Codex] Periodic refresh triggered')
    try {
      await fetchCodexConfig()
    } catch (error) {
      console.error('[Codex] Periodic refresh failed:', error)
    }
  }
})
