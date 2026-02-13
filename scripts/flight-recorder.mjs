#!/usr/bin/env node
/**
 * Flight Recorder — Rolling conversation log for context crash recovery.
 *
 * Reads the active JSONL transcript, extracts the last N exchange pairs
 * (user → Claude), and writes a compact, human-readable markdown file.
 *
 * Format: Hybrid
 *   - User messages: full verbatim (truncated at 500 chars)
 *   - Claude responses: summarized — key text + files touched + tools run
 *
 * Usage:
 *   node ~/.claude/scripts/flight-recorder.mjs [projectDir]
 *
 * Output:
 *   ~/.claude/contexts/{project}-flight-recorder.md
 */

import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join, basename } from 'path';
import { homedir } from 'os';

/* ── Config ── */
const MAX_EXCHANGES = 30;        // ~3 sessions of ~10 exchanges
const MAX_USER_TEXT = 500;        // truncate user messages
const MAX_CLAUDE_TEXT = 400;      // truncate Claude summary text
const MAX_TAIL_LINES = 4000;     // read last N lines of JSONL (perf)

const home = homedir();
const projectDir = process.argv[2] || process.cwd();
const projectsRoot = join(home, '.claude', 'projects');
const contextDir = join(home, '.claude', 'contexts');

/* ── Helpers ── */

/**
 * Find the most recently modified JSONL across ALL project directories.
 * Claude Code's project slug format varies, so instead of guessing the slug
 * we search all directories for the freshest transcript.
 */
function findLatestJsonl() {
  let bestFile = null;
  let bestMtime = 0;

  let projectDirs;
  try {
    projectDirs = readdirSync(projectsRoot);
  } catch {
    return null;
  }

  for (const dir of projectDirs) {
    const dirPath = join(projectsRoot, dir);
    let stat;
    try { stat = statSync(dirPath); } catch { continue; }
    if (!stat.isDirectory()) continue;

    let files;
    try { files = readdirSync(dirPath).filter(f => f.endsWith('.jsonl')); } catch { continue; }

    for (const f of files) {
      const fp = join(dirPath, f);
      try {
        const st = statSync(fp);
        if (st.mtimeMs > bestMtime) {
          bestMtime = st.mtimeMs;
          bestFile = fp;
        }
      } catch { /* skip */ }
    }
  }

  return bestFile;
}

function tailLines(filePath, n) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  return lines.slice(-n);
}

function extractFilePath(input) {
  if (!input) return null;
  return input.file_path || input.path || input.filePath || null;
}

function truncate(text, max) {
  if (!text) return '';
  const cleaned = text.trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max) + '...';
}

function formatTimestamp(ts) {
  if (!ts) return '?';
  // "2026-02-09T17:58:13.964Z" → "Feb 09 17:58"
  try {
    const d = new Date(ts);
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    const mo = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${mo} ${day} ${hh}:${mm}`;
  } catch {
    return ts.slice(0, 16);
  }
}

/* ── Parse JSONL into exchanges ── */

function parseExchanges(lines) {
  const entries = [];
  for (const line of lines) {
    try {
      const d = JSON.parse(line);
      if (d.type === 'user' || d.type === 'assistant') {
        entries.push(d);
      }
    } catch { /* skip malformed */ }
  }

  const exchanges = [];
  let currentUser = null;
  let assistantTexts = [];
  let tools = [];
  let filesTouched = new Set();
  let commands = [];

  for (const e of entries) {
    if (e.type === 'user') {
      // Extract user message text
      const msg = e.message || {};
      let text = '';
      if (typeof msg.content === 'string') {
        text = msg.content;
      } else if (Array.isArray(msg.content)) {
        text = msg.content
          .filter(b => b.type === 'text')
          .map(b => b.text || '')
          .join(' ');
      }
      const trimmed = text.trim();

      // Only start a new exchange on REAL user messages (>5 chars of text).
      // System/hook injected "user" entries with empty or tiny text are
      // merged into the current exchange as continuation.
      if (trimmed.length > 5) {
        // Flush previous exchange
        if (currentUser) {
          exchanges.push({
            user: currentUser,
            assistantTexts: [...assistantTexts],
            tools: [...tools],
            filesTouched: [...filesTouched],
            commands: [...commands],
          });
        }
        currentUser = { text: trimmed, ts: e.timestamp || '' };
        assistantTexts = [];
        tools = [];
        filesTouched = new Set();
        commands = [];
      }
      // If trimmed.length <= 5, skip — assistant data keeps accumulating
      // into the previous exchange.
      if (!currentUser) {
        // Edge case: no real user message seen yet, create a placeholder
        currentUser = { text: '', ts: e.timestamp || '' };
      }
    } else if (e.type === 'assistant' && currentUser) {
      const msg = e.message || {};
      const content = msg.content || [];
      for (const block of content) {
        if (block.type === 'text') {
          const t = (block.text || '').trim();
          if (t.length > 10) assistantTexts.push(t);
        }
        if (block.type === 'tool_use') {
          const name = block.name || '?';
          tools.push(name);
          const input = block.input || {};
          // Extract file paths
          const fp = extractFilePath(input);
          if (fp) filesTouched.add(fp);
          // Extract bash commands
          if (name === 'Bash' && input.command) {
            commands.push(truncate(input.command, 120));
          }
          // Extract file paths from Edit/Write
          if ((name === 'Edit' || name === 'Write') && input.file_path) {
            filesTouched.add(input.file_path);
          }
          if (name === 'Read' && input.file_path) {
            filesTouched.add(input.file_path);
          }
        }
      }
    }
  }

  // Flush last exchange
  if (currentUser) {
    exchanges.push({
      user: currentUser,
      assistantTexts: [...assistantTexts],
      tools: [...tools],
      filesTouched: [...filesTouched],
      commands: [...commands],
    });
  }

  return exchanges;
}

/* ── Format exchanges as markdown ── */

function formatExchange(ex, index) {
  const lines = [];
  const ts = formatTimestamp(ex.user.ts);

  // Skip exchanges with empty user text and no assistant response
  if (!ex.user.text && ex.assistantTexts.length === 0 && ex.tools.length === 0) {
    return null;
  }

  lines.push(`### Chunk ${index} | ${ts}`);
  lines.push('');

  // User message (full verbatim, truncated if huge)
  if (ex.user.text) {
    lines.push(`**User:** ${truncate(ex.user.text, MAX_USER_TEXT)}`);
  } else {
    lines.push('**User:** *(system/hook message)*');
  }
  lines.push('');

  // Claude summary
  if (ex.assistantTexts.length > 0) {
    // Combine all text blocks, take most meaningful ones
    const combined = ex.assistantTexts.join(' ');
    lines.push(`**Claude:** ${truncate(combined, MAX_CLAUDE_TEXT)}`);
    lines.push('');
  }

  // Files touched
  if (ex.filesTouched.length > 0) {
    const shortPaths = ex.filesTouched.map(p => {
      // Shorten paths: /Users/jb/vaporforge/src/foo.ts → src/foo.ts
      const idx = p.indexOf('/src/');
      if (idx !== -1) return p.slice(idx + 1);
      const idx2 = p.indexOf('/ui/');
      if (idx2 !== -1) return p.slice(idx2 + 1);
      return basename(p);
    });
    lines.push(`**Files:** ${shortPaths.join(', ')}`);
    lines.push('');
  }

  // Commands run
  if (ex.commands.length > 0) {
    const uniqueCmds = [...new Set(ex.commands)].slice(0, 5);
    lines.push(`**Commands:** \`${uniqueCmds.join('` `')}\``);
    lines.push('');
  }

  // Tools summary (deduplicated count)
  if (ex.tools.length > 0) {
    const toolCounts = {};
    for (const t of ex.tools) toolCounts[t] = (toolCounts[t] || 0) + 1;
    const summary = Object.entries(toolCounts)
      .map(([name, count]) => count > 1 ? `${name}(x${count})` : name)
      .join(', ');
    lines.push(`**Tools:** ${summary}`);
    lines.push('');
  }

  return lines.join('\n');
}

function buildDocument(exchanges, projectName, transcriptFile) {
  const header = [
    '# Flight Recorder',
    '',
    `**Project:** ${projectName}`,
    `**Source:** ${basename(transcriptFile)}`,
    `**Generated:** ${new Date().toISOString().slice(0, 19)}`,
    `**Exchanges:** ${exchanges.length} (last ${MAX_EXCHANGES} kept)`,
    '',
    '> Auto-generated rolling conversation log.',
    '> Use this to restore context after compaction or crashes.',
    '',
    '---',
    '',
  ];

  const chunks = [];
  for (let i = 0; i < exchanges.length; i++) {
    const formatted = formatExchange(exchanges[i], i + 1);
    if (formatted) chunks.push(formatted);
  }

  return header.join('\n') + chunks.join('\n---\n\n');
}

/* ── Main ── */

function main() {
  const transcriptFile = findLatestJsonl();
  if (!transcriptFile) {
    console.error('No JSONL transcript found in any project directory');
    process.exit(0); // Don't fail the hook
  }

  const lines = tailLines(transcriptFile, MAX_TAIL_LINES);
  const allExchanges = parseExchanges(lines);

  // Filter out empty exchanges (system messages with no real content)
  const meaningful = allExchanges.filter(ex =>
    ex.user.text.length > 0 ||
    ex.assistantTexts.length > 0 ||
    ex.tools.length > 0
  );

  // Keep last N
  const recent = meaningful.slice(-MAX_EXCHANGES);

  if (recent.length === 0) {
    console.log('No meaningful exchanges found, skipping.');
    process.exit(0);
  }

  // Determine project name from directory
  const projectName = basename(projectDir);

  // Ensure output directory exists
  mkdirSync(contextDir, { recursive: true });

  const outputPath = join(contextDir, `${projectName}-flight-recorder.md`);
  const doc = buildDocument(recent, projectName, transcriptFile);

  writeFileSync(outputPath, doc, 'utf-8');
  console.log(`Flight recorder: ${recent.length} exchanges → ${outputPath}`);
}

main();
