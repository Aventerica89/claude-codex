export interface UserRepo {
  name: string
  owner: string
  description: string
  category: RepoCategory
}

export type RepoCategory =
  | 'Healthcare'
  | 'WordPress/Bricks'
  | 'Claude Code/Dev Tools'
  | 'Infrastructure/Utilities'
  | 'Other'

export const REPO_CATEGORIES: RepoCategory[] = [
  'Healthcare',
  'WordPress/Bricks',
  'Claude Code/Dev Tools',
  'Infrastructure/Utilities',
  'Other',
]

export const MY_REPOS: UserRepo[] = [
  // Healthcare / Medical
  { name: 'HDFlowsheet', owner: 'JBMD-Creations', description: 'Hemodialysis flowsheet app (desktop)', category: 'Healthcare' },
  { name: 'HDFlowsheet-Cloud', owner: 'JBMD-Creations', description: 'Hemodialysis flowsheet app (cloud)', category: 'Healthcare' },
  { name: 'renvio-companion-app', owner: 'Aventerica89', description: 'Renal/dialysis patient companion app', category: 'Healthcare' },
  { name: 'v0-hd-companion-charting-system', owner: 'Aventerica89', description: 'HD companion charting system', category: 'Healthcare' },
  { name: 'med-spa-ranker', owner: 'Aventerica89', description: 'Med spa SEO/ranking tool', category: 'Healthcare' },
  { name: 'v0-med-spa-template', owner: 'Aventerica89', description: 'Med spa website template', category: 'Healthcare' },
  { name: 'radiance-hub', owner: 'Aventerica89', description: 'Med spa client portal', category: 'Healthcare' },

  // WordPress / Bricks Builder
  { name: 'wp-jupiter', owner: 'Aventerica89', description: 'WordPress client site', category: 'WordPress/Bricks' },
  { name: 'wp-neptune', owner: 'Aventerica89', description: 'WordPress client site', category: 'WordPress/Bricks' },
  { name: 'bricks-cc', owner: 'Aventerica89', description: 'Bricks Builder site development', category: 'WordPress/Bricks' },
  { name: 'bricks-builder-agent', owner: 'Aventerica89', description: 'Bricks Builder site development', category: 'WordPress/Bricks' },
  { name: 'WPModernUI', owner: 'JBMD-Creations', description: 'WordPress Modern UI theme/plugin', category: 'WordPress/Bricks' },

  // Claude Code / Dev Tools
  { name: 'claude-codex', owner: 'Aventerica89', description: 'Claude Code configuration and rules', category: 'Claude Code/Dev Tools' },
  { name: 'claude-command', owner: 'Aventerica89', description: 'Claude command utilities', category: 'Claude Code/Dev Tools' },
  { name: 'claude-new-project', owner: 'Aventerica89', description: 'New project templates for Claude', category: 'Claude Code/Dev Tools' },
  { name: 'Claude', owner: 'Aventerica89', description: 'Claude experiments/projects', category: 'Claude Code/Dev Tools' },
  { name: 'artifact-manager', owner: 'Aventerica89', description: 'Claude Code artifact management', category: 'Claude Code/Dev Tools' },
  { name: 'env-var-assistant', owner: 'Aventerica89', description: 'Environment variable management tool', category: 'Claude Code/Dev Tools' },
  { name: '1code', owner: 'Aventerica89', description: 'CLI tool', category: 'Claude Code/Dev Tools' },

  // Infrastructure / Utilities
  { name: 'URLsToGo', owner: 'Aventerica89', description: 'URL shortener service', category: 'Infrastructure/Utilities' },
  { name: 'cf-url-shortener-template', owner: 'Aventerica89', description: 'Cloudflare Workers URL shortener', category: 'Infrastructure/Utilities' },
  { name: 'jb-cloud-docs', owner: 'Aventerica89', description: 'Documentation site (docs.jbcloud.app)', category: 'Infrastructure/Utilities' },
  { name: 'jb-cloud-app-tracker', owner: 'Aventerica89', description: 'App/deployment tracking dashboard', category: 'Infrastructure/Utilities' },
  { name: 'Supabase', owner: 'JBMD-Creations', description: 'Supabase backend projects', category: 'Infrastructure/Utilities' },
  { name: 'my-supabase-app', owner: 'Aventerica89', description: 'Supabase app template', category: 'Infrastructure/Utilities' },
  { name: 'RepoBar', owner: 'Aventerica89', description: 'Repository management tool', category: 'Infrastructure/Utilities' },
  { name: 'aerospace-studio', owner: 'Aventerica89', description: 'Aerospace window manager config', category: 'Infrastructure/Utilities' },

  // Other Projects
  { name: 'Astro', owner: 'Aventerica89', description: 'Astro framework projects', category: 'Other' },
  { name: 'personal-apps', owner: 'Aventerica89', description: 'Personal utility apps', category: 'Other' },
  { name: 'recipe-nutrition-tracker', owner: 'Aventerica89', description: 'Recipe and nutrition tracking', category: 'Other' },
  { name: 'Lovable', owner: 'JBMD-Creations', description: 'Lovable.dev projects', category: 'Other' },
  { name: 'keep-a-changelog', owner: 'olivierlacan', description: 'Changelog format reference', category: 'Other' },
  { name: 'claude-code', owner: 'anthropics', description: 'Official Claude Code repo', category: 'Other' },
]
