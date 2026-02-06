// Plugin System Type Definitions

export type PluginSourceType = 'official' | 'community' | 'local'

export type ComponentType = 'agent' | 'skill' | 'command' | 'rule'

export type RelationshipType = 'uses' | 'requires' | 'extends' | 'calls' | 'depends_on'

export interface PluginSource {
  id: string
  name: string
  type: PluginSourceType
  url: string | null
  description: string | null
  last_synced: string | null
  enabled: boolean
  metadata?: {
    categories?: string[]
    total_plugins?: number
    last_error?: string
  }
}

export interface Plugin {
  id: string
  source_id: string
  name: string
  description: string | null
  author: string | null
  version: string | null
  repository_url: string | null
  homepage_url: string | null
  license: string | null
  keywords: string[]
  categories: string[]
  agent_count: number
  skill_count: number
  command_count: number
  rule_count: number
  readme: string | null
  changelog: string | null
  icon_url: string | null
  banner_url: string | null
  screenshots: string[]
  install_count: number
  star_count: number
  last_updated: string | null
  created_at: string
}

export interface PluginComponent {
  id: string
  plugin_id: string
  type: ComponentType
  name: string
  slug: string
  description: string | null
  content: string | null
  category: string | null
  tags: string[]
  model?: string
  tools?: string[]
  dependencies?: string[]
  command_syntax?: string
  created_at: string
}

export interface ComponentRelationship {
  id: number
  from_component_id: string
  to_component_id: string
  relationship_type: RelationshipType
  description: string | null
  strength: number
  created_at: string
}

export interface PluginInstallation {
  id: number
  plugin_id: string
  component_ids: string[]
  target_repository: string
  installed_by: string
  installed_at: string
  version: string | null
  config_overrides?: Record<string, any>
}

export interface PluginFavorite {
  user_id: string
  plugin_id: string
  created_at: string
}

// API Request/Response Types

export interface PluginListRequest {
  source?: string[]
  category?: string[]
  type?: string[]
  search?: string
  sort?: 'popular' | 'recent' | 'alphabetical'
  limit?: number
  offset?: number
}

export interface PluginListResponse {
  success: boolean
  data: {
    plugins: Plugin[]
    total: number
    filters: {
      sources: Array<{ id: string; name: string; count: number }>
      categories: Array<{ name: string; count: number }>
      types: Array<{ type: string; count: number }>
    }
  }
}

export interface PluginDetailResponse {
  success: boolean
  data: {
    plugin: Plugin
    components: PluginComponent[]
    relationships: ComponentRelationship[]
    installations: PluginInstallation[]
    readme: string | null
    isFavorite: boolean
  }
}

export interface PluginInstallRequest {
  targetRepository: string
  components?: string[]
  configOverrides?: Record<string, any>
}

export interface PluginInstallResponse {
  success: boolean
  data: {
    installationId: number
    installedComponents: string[]
    targetRepository: string
  }
}

export interface PluginSyncRequest {
  sources?: string[]
  force?: boolean
}

export interface PluginSyncResponse {
  success: boolean
  data: {
    synced: number
    errors: Array<{ source: string; error: string }>
  }
}

export interface RelationshipGraphResponse {
  success: boolean
  data: {
    nodes: Array<{
      id: string
      type: ComponentType
      name: string
      category: string | null
    }>
    edges: Array<{
      from: string
      to: string
      type: RelationshipType
      strength: number
    }>
  }
}

// Parsed Plugin Manifest (from GitHub)

export interface PluginManifest {
  name: string
  description?: string
  author?: {
    name: string
    url?: string
  }
  homepage?: string
  repository?: string
  license?: string
  version?: string
  keywords?: string[]
  categories?: string[]
  commands?: string
  skills?: string
  agents?: string
  rules?: string
}

// Utility Types

export interface ParsedComponent {
  type: ComponentType
  name: string
  slug: string
  description?: string
  content: string
  category?: string
  tags?: string[]
  metadata?: {
    model?: string
    tools?: string[]
    dependencies?: string[]
  }
}

export interface ConflictInfo {
  component_id: string
  component_name: string
  conflict_type: 'name' | 'version' | 'dependency'
  existing_version?: string
  new_version?: string
  resolution_options: Array<'skip' | 'rename' | 'overwrite' | 'update'>
}
