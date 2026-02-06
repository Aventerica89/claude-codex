// Plugin Parsers - Parse plugin metadata from GitHub repositories

import type {
  PluginManifest,
  ParsedComponent,
  ComponentType,
  Plugin,
  PluginComponent,
} from './types'

interface GitHubFile {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
  url: string
}

interface GitHubTreeItem {
  path: string
  type: string
  url: string
}

/**
 * Get GitHub API headers with optional authentication
 */
function getGitHubHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  }

  // Add GitHub token if available (increases rate limit from 60 to 5000/hour)
  if (typeof process !== 'undefined' && process.env?.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  } else if (typeof import.meta !== 'undefined' && import.meta.env?.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${import.meta.env.GITHUB_TOKEN}`
  }

  return headers
}

/**
 * Parse plugin manifest from .claude-plugin/plugin.json
 */
export function parsePluginManifest(manifestJson: any): PluginManifest {
  return {
    name: manifestJson.name || 'Unknown Plugin',
    description: manifestJson.description,
    author: manifestJson.author,
    homepage: manifestJson.homepage,
    repository: manifestJson.repository,
    license: manifestJson.license || 'MIT',
    version: manifestJson.version || '1.0.0',
    keywords: Array.isArray(manifestJson.keywords) ? manifestJson.keywords : [],
    categories: Array.isArray(manifestJson.categories) ? manifestJson.categories : [],
    commands: manifestJson.commands,
    skills: manifestJson.skills,
    agents: manifestJson.agents,
    rules: manifestJson.rules,
  }
}

/**
 * Parse Anthropic official plugin structure
 * Structure: plugins/{plugin-name}/{agents,skills,commands,rules}/*.md
 */
export async function parseAnthropicPlugin(
  pluginPath: string,
  repoUrl: string
): Promise<{ plugin: Partial<Plugin>; components: ParsedComponent[] }> {
  const pluginName = pluginPath.split('/').pop() || 'unknown'
  const pluginId = `anthropic:${pluginName}`

  // Fetch plugin.json if it exists
  let manifest: PluginManifest | null = null
  try {
    const manifestUrl = `${repoUrl}/main/plugins/${pluginName}/.claude-plugin/plugin.json`
    const response = await fetch(manifestUrl, { headers: getGitHubHeaders() })
    if (response.ok) {
      manifest = parsePluginManifest(await response.json())
    }
  } catch (e) {
    console.warn(`No manifest found for ${pluginName}`)
  }

  // Fetch README.md
  let readme: string | null = null
  try {
    const readmeUrl = `${repoUrl}/main/plugins/${pluginName}/README.md`
    const response = await fetch(readmeUrl, { headers: getGitHubHeaders() })
    if (response.ok) {
      readme = await response.text()
    }
  } catch (e) {
    console.warn(`No README found for ${pluginName}`)
  }

  const components: ParsedComponent[] = []
  const componentTypes: ComponentType[] = ['agents', 'skills', 'commands', 'rules']

  // Fetch components from each directory
  for (const typeDir of componentTypes) {
    const type = typeDir.slice(0, -1) as ComponentType // Remove 's'
    const dirUrl = `https://api.github.com/repos/anthropics/claude-plugins-official/contents/plugins/${pluginName}/${typeDir}`

    try {
      const response = await fetch(dirUrl, {
        headers: getGitHubHeaders(),
      })

      if (!response.ok) continue

      const files: GitHubFile[] = await response.json()

      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const content = await fetchFileContent(file.download_url!)
          const parsed = parseComponentMarkdown(content, type)

          components.push({
            type,
            name: parsed.name || file.name.replace('.md', ''),
            slug: file.name.replace('.md', ''),
            description: parsed.description,
            content,
            category: parsed.category,
            tags: parsed.tags,
            metadata: parsed.metadata,
          })
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch ${typeDir} for ${pluginName}:`, e)
    }
  }

  const plugin: Partial<Plugin> = {
    id: pluginId,
    source_id: 'anthropic-official',
    name: manifest?.name || pluginName,
    description: manifest?.description || readme?.split('\n')[0],
    author: typeof manifest?.author === 'string' ? manifest.author : manifest?.author?.name,
    version: manifest?.version || '1.0.0',
    repository_url: `https://github.com/anthropics/claude-plugins-official/tree/main/plugins/${pluginName}`,
    homepage_url: manifest?.homepage,
    license: manifest?.license || 'MIT',
    keywords: manifest?.keywords || [],
    categories: manifest?.categories || [],
    readme,
    agent_count: components.filter((c) => c.type === 'agent').length,
    skill_count: components.filter((c) => c.type === 'skill').length,
    command_count: components.filter((c) => c.type === 'command').length,
    rule_count: components.filter((c) => c.type === 'rule').length,
  }

  return { plugin, components }
}

/**
 * Parse community plugin from awesome-claude-code-plugins
 * Structure: plugins/{plugin-name}/{agents,skills,commands,rules}/*.md
 */
export async function parseCommunityPlugin(
  pluginPath: string,
  repoUrl: string
): Promise<{ plugin: Partial<Plugin>; components: ParsedComponent[] }> {
  const pluginName = pluginPath.split('/').pop() || 'unknown'
  const pluginId = `community:${pluginName}`

  // Fetch README.md from plugin directory
  let readme: string | null = null
  let description: string | null = null
  try {
    const readmeUrl = `${repoUrl}/main/plugins/${pluginName}/README.md`
    const response = await fetch(readmeUrl)
    if (response.ok) {
      readme = await response.text()
      description = readme.split('\n').find((line) => line.trim())?.trim() || null
    }
  } catch (e) {
    console.warn(`No README found for ${pluginName}`)
  }

  const components: ParsedComponent[] = []
  const componentTypes: ComponentType[] = ['agents', 'skills', 'commands', 'rules']

  // Fetch components from each directory
  for (const typeDir of componentTypes) {
    const type = typeDir.slice(0, -1) as ComponentType
    const dirUrl = `https://api.github.com/repos/ccplugins/awesome-claude-code-plugins/contents/plugins/${pluginName}/${typeDir}`

    try {
      const response = await fetch(dirUrl, {
        headers: getGitHubHeaders(),
      })

      if (!response.ok) continue

      const files: GitHubFile[] = await response.json()

      for (const file of files) {
        if (file.type === 'file' && file.name.endsWith('.md')) {
          const content = await fetchFileContent(file.download_url!)
          const parsed = parseComponentMarkdown(content, type)

          components.push({
            type,
            name: parsed.name || file.name.replace('.md', ''),
            slug: file.name.replace('.md', ''),
            description: parsed.description,
            content,
            category: parsed.category,
            tags: parsed.tags,
            metadata: parsed.metadata,
          })
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch ${typeDir} for ${pluginName}:`, e)
    }
  }

  const plugin: Partial<Plugin> = {
    id: pluginId,
    source_id: 'awesome-community',
    name: pluginName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    description,
    author: 'Community',
    version: '1.0.0',
    repository_url: `https://github.com/ccplugins/awesome-claude-code-plugins/tree/main/plugins/${pluginName}`,
    license: 'MIT',
    keywords: [],
    categories: [],
    readme,
    agent_count: components.filter((c) => c.type === 'agent').length,
    skill_count: components.filter((c) => c.type === 'skill').length,
    command_count: components.filter((c) => c.type === 'command').length,
    rule_count: components.filter((c) => c.type === 'rule').length,
  }

  return { plugin, components }
}

/**
 * Parse markdown content to extract component metadata
 */
function parseComponentMarkdown(
  content: string,
  type: ComponentType
): {
  name?: string
  description?: string
  category?: string
  tags?: string[]
  metadata?: {
    model?: string
    tools?: string[]
    dependencies?: string[]
  }
} {
  const lines = content.split('\n')
  let name: string | undefined
  let description: string | undefined
  let category: string | undefined
  const tags: string[] = []
  const tools: string[] = []
  const dependencies: string[] = []
  let model: string | undefined

  // Extract from frontmatter or first heading
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Extract name from first heading
    if (!name && line.startsWith('# ')) {
      name = line.substring(2).trim()
    }

    // Extract description from second paragraph
    if (!description && line && !line.startsWith('#') && !line.startsWith('-')) {
      description = line
    }

    // Extract model for agents
    if (type === 'agent' && line.toLowerCase().includes('model:')) {
      const modelMatch = line.match(/model:\s*([\w.-]+)/i)
      if (modelMatch) {
        model = modelMatch[1]
      }
    }

    // Extract tools
    if (line.toLowerCase().includes('tools:')) {
      const toolsMatch = line.match(/tools:\s*(.+)/i)
      if (toolsMatch) {
        const toolsList = toolsMatch[1].split(',').map((t) => t.trim())
        tools.push(...toolsList)
      }
    }

    // Extract tags
    if (line.toLowerCase().includes('tags:')) {
      const tagsMatch = line.match(/tags:\s*(.+)/i)
      if (tagsMatch) {
        const tagsList = tagsMatch[1].split(',').map((t) => t.trim())
        tags.push(...tagsList)
      }
    }

    // Extract category
    if (line.toLowerCase().includes('category:')) {
      const categoryMatch = line.match(/category:\s*(.+)/i)
      if (categoryMatch) {
        category = categoryMatch[1].trim()
      }
    }

    // Extract dependencies
    if (line.toLowerCase().includes('dependencies:') || line.toLowerCase().includes('requires:')) {
      const depsMatch = line.match(/(?:dependencies|requires):\s*(.+)/i)
      if (depsMatch) {
        const depsList = depsMatch[1].split(',').map((d) => d.trim())
        dependencies.push(...depsList)
      }
    }
  }

  return {
    name,
    description,
    category,
    tags: tags.length > 0 ? tags : undefined,
    metadata: {
      model,
      tools: tools.length > 0 ? tools : undefined,
      dependencies: dependencies.length > 0 ? dependencies : undefined,
    },
  }
}

/**
 * Fetch file content from GitHub raw URL
 */
async function fetchFileContent(url: string): Promise<string> {
  const response = await fetch(url, { headers: getGitHubHeaders() })
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  }
  return response.text()
}

/**
 * List all plugins in a repository
 */
export async function listPluginsInRepo(
  owner: string,
  repo: string,
  pluginsPath: string = 'plugins'
): Promise<string[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${pluginsPath}`

  try {
    const response = await fetch(url, {
      headers: getGitHubHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Failed to list plugins: ${response.statusText}`)
    }

    const items: GitHubFile[] = await response.json()
    return items.filter((item) => item.type === 'dir').map((item) => item.name)
  } catch (e) {
    console.error(`Failed to list plugins in ${owner}/${repo}:`, e)
    return []
  }
}
