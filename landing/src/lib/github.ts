import { githubRateLimiter } from './rate-limiter'

const GITHUB_API = 'https://api.github.com'

const CLAUDE_DIRS = ['commands', 'agents', 'skills', 'rules'] as const
type ClaudeDirType = (typeof CLAUDE_DIRS)[number]

export interface ClaudeDirectoryResult {
  commands: string[]
  agents: string[]
  skills: string[]
  rules: string[]
}

export function parseRepoUrl(
  url: string
): { owner: string; repo: string } | null {
  const match = url.match(
    /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/
  )
  if (!match) return null

  const owner = match[1]
  const repo = match[2]

  // Validate GitHub username/repo name format
  // GitHub allows alphanumeric, hyphens, and underscores
  const validPattern = /^[a-zA-Z0-9_.-]+$/
  if (!validPattern.test(owner) || !validPattern.test(repo)) {
    return null
  }

  // Prevent path traversal attacks
  if (owner.includes('..') || repo.includes('..')) {
    return null
  }

  // Prevent other path separators
  if (owner.includes('/') || owner.includes('\\') ||
      repo.includes('/') || repo.includes('\\')) {
    return null
  }

  return { owner, repo }
}

async function fetchDirContents(
  owner: string,
  repo: string,
  path: string,
  token?: string
): Promise<string[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'claude-codex-sync',
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`

  // Use rate limiter with automatic retry
  const res = await githubRateLimiter.fetchWithRetry(url, { headers })

  if (res.status === 404) return []
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()
  if (!Array.isArray(data)) return []

  return data
    .filter((entry: { type: string }) => entry.type === 'file')
    .map((entry: { name: string }) => entry.name.replace(/\.md$/, ''))
}

export async function fetchClaudeDirectory(
  owner: string,
  repo: string,
  token?: string
): Promise<ClaudeDirectoryResult | null> {
  const result: ClaudeDirectoryResult = {
    commands: [],
    agents: [],
    skills: [],
    rules: [],
  }

  let foundAny = false

  // Check both .claude/{dir} and root-level {dir} (e.g. claude-codex repo)
  const fetches = CLAUDE_DIRS.map(async (dir) => {
    const [dotClaude, rootLevel] = await Promise.all([
      fetchDirContents(owner, repo, `.claude/${dir}`, token),
      fetchDirContents(owner, repo, dir, token),
    ])
    const merged = [...new Set([...dotClaude, ...rootLevel])]
    if (merged.length > 0) foundAny = true
    result[dir] = merged
  })

  await Promise.all(fetches)

  return foundAny ? result : null
}
