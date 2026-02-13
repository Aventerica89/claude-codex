#!/usr/bin/env node

const chokidar = require('chokidar')
const simpleGit = require('simple-git')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const WATCH_DIR = path.join(process.env.HOME, '.claude')
const DEBOUNCE_MS = 30000 // 30 seconds
const PUSH_INTERVAL_MS = 300000 // 5 minutes
const STATE_FILE = path.join(__dirname, '.sync-state.json')

// State
let changeBuffer = []
let commitTimer = null
let pushTimer = null
let git = simpleGit(WATCH_DIR)

// Load or create state
function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    }
  } catch (err) {
    console.error('[Sync] Failed to load state:', err.message)
  }
  return { lastCommit: null, lastPush: null, pendingPush: false }
}

function saveState(state) {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
  } catch (err) {
    console.error('[Sync] Failed to save state:', err.message)
  }
}

// Generate commit message from changed files
function generateCommitMessage(files) {
  const categories = {
    commands: [],
    agents: [],
    skills: [],
    rules: [],
    other: []
  }

  files.forEach(f => {
    const rel = path.relative(WATCH_DIR, f)
    if (rel.startsWith('commands/')) categories.commands.push(rel)
    else if (rel.startsWith('agents/')) categories.agents.push(rel)
    else if (rel.startsWith('skills/')) categories.skills.push(rel)
    else if (rel.startsWith('rules/')) categories.rules.push(rel)
    else categories.other.push(rel)
  })

  const parts = []
  if (categories.commands.length) parts.push(`${categories.commands.length} command(s)`)
  if (categories.agents.length) parts.push(`${categories.agents.length} agent(s)`)
  if (categories.skills.length) parts.push(`${categories.skills.length} skill(s)`)
  if (categories.rules.length) parts.push(`${categories.rules.length} rule(s)`)
  if (categories.other.length) parts.push(`${categories.other.length} other file(s)`)

  const summary = parts.join(', ')
  const fileList = files.slice(0, 5).map(f => `- ${path.relative(WATCH_DIR, f)}`).join('\n')

  return `sync: update ${summary}\n\n${fileList}${files.length > 5 ? `\n...and ${files.length - 5} more` : ''}`
}

// Commit changes
async function commitChanges(files) {
  if (files.length === 0) return

  try {
    const status = await git.status()
    if (!status.modified.length && !status.not_added.length) {
      console.log('[Sync] No changes to commit')
      return
    }

    const message = generateCommitMessage(files)
    await git.add('./*')
    await git.commit(message)

    const state = loadState()
    state.lastCommit = new Date().toISOString()
    state.pendingPush = true
    saveState(state)

    console.log(`[Sync] Committed: ${message.split('\n')[0]}`)

    // Schedule push
    schedulePush()
  } catch (err) {
    console.error('[Sync] Commit failed:', err.message)
  }
}

// Push to remote
async function pushToRemote() {
  const state = loadState()
  if (!state.pendingPush) {
    console.log('[Sync] No pending changes to push')
    return
  }

  try {
    // Pull with rebase first to avoid conflicts
    await git.pull('origin', 'main', { '--rebase': 'true' })

    // Push
    await git.push('origin', 'main')

    state.lastPush = new Date().toISOString()
    state.pendingPush = false
    saveState(state)

    console.log('[Sync] Pushed to remote successfully')
  } catch (err) {
    console.error('[Sync] Push failed:', err.message)
    // Don't clear pendingPush - will retry next interval
  }
}

// Schedule push (batched every 5 minutes)
function schedulePush() {
  if (pushTimer) return // Already scheduled

  pushTimer = setTimeout(async () => {
    await pushToRemote()
    pushTimer = null
  }, PUSH_INTERVAL_MS)
}

// Start watching
function startWatcher() {
  console.log(`[Sync] Starting watcher on ${WATCH_DIR}`)

  const watcher = chokidar.watch(WATCH_DIR, {
    ignored: [
      // Ignore dot-prefixed items WITHIN the watch dir, not the dir itself
      (filePath) => {
        const rel = path.relative(WATCH_DIR, filePath)
        if (!rel || rel === '.') return false
        const firstSegment = rel.split(path.sep)[0]
        return firstSegment.startsWith('.') && firstSegment !== '.'
      },
      /node_modules\//,
      /cache\//,
      /debug\//,
      /file-history\//,
      /paste-cache\//,
      /shell-snapshots\//,
      /session-env\//,
      /todos\//,
      /plans\//,
      /tasks\//,
      /telemetry\//,
      /history\.jsonl/,
      /stats-cache\.json/,
      /pause-state\.json/,
      /security_warnings_state_/,
      /settings\.json$/,
      /settings\.local\.json$/,
      /changelog-config\.json$/,
      /\.sync-state\.json$/,
      /sync\.log$/,
      /sync\.error\.log$/,
      /projects\//,
      /contexts\//,
      /plugins\/claude-codex\//
    ],
    persistent: true,
    ignoreInitial: true,
    followSymlinks: true
  })

  watcher
    .on('add', handleChange)
    .on('change', handleChange)
    .on('unlink', handleChange)

  function handleChange(filepath) {
    console.log(`[Sync] Detected change: ${path.relative(WATCH_DIR, filepath)}`)

    changeBuffer.push(filepath)

    // Debounce: commit after 30 seconds of no changes
    clearTimeout(commitTimer)
    commitTimer = setTimeout(async () => {
      await commitChanges([...new Set(changeBuffer)]) // Deduplicate
      changeBuffer = []
    }, DEBOUNCE_MS)
  }

  console.log('[Sync] Watcher started. Monitoring for changes...')
  console.log(`[Sync] Debounce: ${DEBOUNCE_MS}ms | Push interval: ${PUSH_INTERVAL_MS}ms`)

  // Start periodic push interval
  setInterval(async () => {
    const state = loadState()
    if (state.pendingPush) {
      await pushToRemote()
    }
  }, PUSH_INTERVAL_MS)
}

// CLI commands
const command = process.argv[2]

switch (command) {
  case 'install':
    console.log('[Sync] Installing LaunchAgent...')
    const plistPath = path.join(process.env.HOME, 'Library/LaunchAgents/com.claude-codex.sync.plist')
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.claude-codex.sync</string>
    <key>ProgramArguments</key>
    <array>
        <string>${process.execPath}</string>
        <string>${__filename}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>${process.env.HOME}/.claude/sync.log</string>
    <key>StandardErrorPath</key>
    <string>${process.env.HOME}/.claude/sync.error.log</string>
</dict>
</plist>`

    fs.writeFileSync(plistPath, plist)
    execSync(`launchctl load ${plistPath}`)
    console.log('[Sync] LaunchAgent installed and started')
    console.log(`[Sync] Logs: ~/.claude/sync.log`)
    break

  case 'uninstall':
    console.log('[Sync] Uninstalling LaunchAgent...')
    const plist2 = path.join(process.env.HOME, 'Library/LaunchAgents/com.claude-codex.sync.plist')
    if (fs.existsSync(plist2)) {
      execSync(`launchctl unload ${plist2}`)
      fs.unlinkSync(plist2)
    }
    console.log('[Sync] LaunchAgent uninstalled')
    break

  case 'status':
    const state = loadState()
    console.log('[Sync] Status:')
    console.log(`  Last commit: ${state.lastCommit || 'never'}`)
    console.log(`  Last push: ${state.lastPush || 'never'}`)
    console.log(`  Pending push: ${state.pendingPush ? 'yes' : 'no'}`)
    break

  default:
    // Start watcher
    startWatcher()
}
