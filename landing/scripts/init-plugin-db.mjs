// Initialize Plugin Database Tables
// Run with: node scripts/init-plugin-db.mjs

import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('❌ TURSO_DATABASE_URL is not set')
  process.exit(1)
}

console.log('🚀 Initializing Plugin Database...\n')

const client = createClient({
  url,
  authToken,
})

async function main() {
  try {
    // Run the migration
    console.log('📊 Creating plugin tables...')

    await client.executeMultiple(`
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

    console.log('✓ Plugin tables created')

    // Add plugin-related columns to codex_items if they don't exist
    console.log('\n📊 Updating codex_items table...')

    try {
      await client.execute(`
        ALTER TABLE codex_items ADD COLUMN plugin_component_id TEXT;
      `)
      console.log('✓ Added plugin_component_id column')
    } catch (e) {
      if (e.message?.includes('duplicate column name')) {
        console.log('✓ plugin_component_id column already exists')
      } else {
        throw e
      }
    }

    try {
      await client.execute(`
        ALTER TABLE codex_items ADD COLUMN plugin_id TEXT;
      `)
      console.log('✓ Added plugin_id column')
    } catch (e) {
      if (e.message?.includes('duplicate column name')) {
        console.log('✓ plugin_id column already exists')
      } else {
        throw e
      }
    }

    try {
      await client.execute(`
        ALTER TABLE codex_items ADD COLUMN is_plugin_managed INTEGER DEFAULT 0;
      `)
      console.log('✓ Added is_plugin_managed column')
    } catch (e) {
      if (e.message?.includes('duplicate column name')) {
        console.log('✓ is_plugin_managed column already exists')
      } else {
        throw e
      }
    }

    // Insert default plugin sources
    console.log('\n📊 Inserting default plugin sources...')

    await client.execute({
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

    console.log('✓ Plugin sources inserted')

    // Verify tables were created
    console.log('\n📊 Verifying tables...')

    const tables = await client.execute(`
      SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'plugin%'
    `)

    console.log(`✓ Found ${tables.rows.length} plugin tables:`)
    tables.rows.forEach((row) => {
      console.log(`  - ${row.name}`)
    })

    console.log('\n✅ Plugin database initialization complete!')
    console.log('\n💡 Next steps:')
    console.log('  1. Run the sync API to fetch plugins: POST /api/plugins/sync')
    console.log('  2. View plugins in the dashboard: /dashboard/plugins')
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    process.exit(1)
  }
}

main()
