import { createClient, type Client } from '@libsql/client'

let client: Client | null = null
let initialized = false

export function getDb(): Client {
  if (client) return client

  const url = import.meta.env.TURSO_DATABASE_URL
  const authToken = import.meta.env.TURSO_AUTH_TOKEN

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set')
  }

  client = createClient({
    url,
    authToken,
  })

  return client
}

export async function ensureDb(): Promise<Client> {
  const db = getDb()
  if (!initialized) {
    await initDb()
    initialized = true
  }
  return db
}

export async function initDb(): Promise<void> {
  const db = getDb()

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS codex_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      slug TEXT NOT NULL,
      name TEXT NOT NULL,
      content_override TEXT,
      enabled INTEGER DEFAULT 1,
      usage_count INTEGER DEFAULT 0,
      last_used TEXT,
      last_edited TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id TEXT NOT NULL,
      repo TEXT NOT NULL,
      deployed_at TEXT DEFAULT (datetime('now')),
      deployed_by TEXT DEFAULT 'admin',
      status TEXT DEFAULT 'success'
    );

    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      nodes TEXT NOT NULL,
      edges TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS app_connections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      item_id TEXT NOT NULL,
      connected_at TEXT DEFAULT (datetime('now'))
    );
  `)

  // Add plugin-related columns to existing codex_items table
  try {
    await db.execute('ALTER TABLE codex_items ADD COLUMN plugin_component_id TEXT')
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    await db.execute('ALTER TABLE codex_items ADD COLUMN plugin_id TEXT')
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    await db.execute('ALTER TABLE codex_items ADD COLUMN is_plugin_managed INTEGER DEFAULT 0')
  } catch (e) {
    // Column already exists, ignore
  }

  // Initialize plugin tables
  await migratePluginTables()
}

export async function migratePluginTables(): Promise<void> {
  const db = getDb()

  // Fix stale schema: if plugins table exists without source_id, drop and recreate
  try {
    const info = await db.execute("PRAGMA table_info(plugins)")
    const columns = info.rows.map((r) => r.name as string)
    if (columns.length > 0 && !columns.includes('source_id')) {
      await db.executeMultiple(`
        DROP TABLE IF EXISTS plugin_favorites;
        DROP TABLE IF EXISTS plugin_installations;
        DROP TABLE IF EXISTS component_relationships;
        DROP TABLE IF EXISTS plugin_components;
        DROP TABLE IF EXISTS plugins;
        DROP TABLE IF EXISTS plugin_sources;
      `)
    }
  } catch (e) {
    // Table doesn't exist yet, proceed normally
  }

  await db.executeMultiple(`
    -- Plugin sources registry
    CREATE TABLE IF NOT EXISTS plugin_sources (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('official', 'community', 'local')),
      url TEXT,
      description TEXT,
      last_synced TEXT,
      enabled INTEGER DEFAULT 1,
      metadata TEXT
    );

    -- Plugin metadata
    CREATE TABLE IF NOT EXISTS plugins (
      id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      author TEXT,
      version TEXT,
      repository_url TEXT,
      homepage_url TEXT,
      license TEXT,
      keywords TEXT,
      categories TEXT,
      agent_count INTEGER DEFAULT 0,
      skill_count INTEGER DEFAULT 0,
      command_count INTEGER DEFAULT 0,
      rule_count INTEGER DEFAULT 0,
      readme TEXT,
      changelog TEXT,
      icon_url TEXT,
      banner_url TEXT,
      screenshots TEXT,
      install_count INTEGER DEFAULT 0,
      star_count INTEGER DEFAULT 0,
      last_updated TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (source_id) REFERENCES plugin_sources(id)
    );

    -- Plugin components
    CREATE TABLE IF NOT EXISTS plugin_components (
      id TEXT PRIMARY KEY,
      plugin_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('agent', 'skill', 'command', 'rule')),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      content TEXT,
      category TEXT,
      tags TEXT,
      model TEXT,
      tools TEXT,
      dependencies TEXT,
      command_syntax TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (plugin_id) REFERENCES plugins(id)
    );

    -- Relationships between components
    CREATE TABLE IF NOT EXISTS component_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_component_id TEXT NOT NULL,
      to_component_id TEXT NOT NULL,
      relationship_type TEXT NOT NULL CHECK(
        relationship_type IN ('uses', 'requires', 'extends', 'calls', 'depends_on')
      ),
      description TEXT,
      strength INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (from_component_id) REFERENCES plugin_components(id),
      FOREIGN KEY (to_component_id) REFERENCES plugin_components(id),
      UNIQUE(from_component_id, to_component_id, relationship_type)
    );

    -- Installation tracking
    CREATE TABLE IF NOT EXISTS plugin_installations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plugin_id TEXT NOT NULL,
      component_ids TEXT,
      target_repository TEXT NOT NULL,
      installed_by TEXT DEFAULT 'admin',
      installed_at TEXT DEFAULT (datetime('now')),
      version TEXT,
      config_overrides TEXT,
      FOREIGN KEY (plugin_id) REFERENCES plugins(id)
    );

    -- User favorites
    CREATE TABLE IF NOT EXISTS plugin_favorites (
      user_id TEXT DEFAULT 'default',
      plugin_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, plugin_id),
      FOREIGN KEY (plugin_id) REFERENCES plugins(id)
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_plugins_source ON plugins(source_id);
    CREATE INDEX IF NOT EXISTS idx_plugins_categories ON plugins(categories);
    CREATE INDEX IF NOT EXISTS idx_components_plugin ON plugin_components(plugin_id);
    CREATE INDEX IF NOT EXISTS idx_components_type ON plugin_components(type);
    CREATE INDEX IF NOT EXISTS idx_relationships_from ON component_relationships(from_component_id);
    CREATE INDEX IF NOT EXISTS idx_relationships_to ON component_relationships(to_component_id);
    CREATE INDEX IF NOT EXISTS idx_installations_plugin ON plugin_installations(plugin_id);
    CREATE INDEX IF NOT EXISTS idx_installations_repo ON plugin_installations(target_repository);
  `)

  // Insert default plugin sources
  await db.execute({
    sql: `INSERT OR IGNORE INTO plugin_sources (id, name, type, url, description) VALUES
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?),
      (?, ?, ?, ?, ?)`,
    args: [
      'anthropic-official',
      'Anthropic Official',
      'official',
      'https://github.com/anthropics/claude-plugins-official',
      'Official Claude Code plugins from Anthropic',
      'awesome-community',
      'Awesome Claude Plugins',
      'community',
      'https://github.com/ccplugins/awesome-claude-code-plugins',
      'Community-curated Claude Code plugins',
      'local',
      'Local Plugins',
      'local',
      null,
      'Locally installed plugins and custom codex items',
    ],
  })
}
