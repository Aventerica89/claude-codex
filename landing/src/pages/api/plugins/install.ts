import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';
import { randomUUID } from 'crypto';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { plugin_id, component_ids, repository_path } = body;

    // Validate required fields
    if (!plugin_id || !component_ids || !Array.isArray(component_ids)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields: plugin_id, component_ids',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (component_ids.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No components selected',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = getDb();

    // SECURITY FIX #1: Validate plugin exists
    const pluginCheck = await db.execute({
      sql: 'SELECT id FROM plugins WHERE id = ?',
      args: [plugin_id],
    });

    if (pluginCheck.rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid plugin_id: plugin not found',
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY FIX #1: Validate components belong to plugin
    const componentCheck = await db.execute({
      sql: `SELECT id FROM plugin_components WHERE id IN (${component_ids.map(() => '?').join(',')}) AND plugin_id = ?`,
      args: [...component_ids, plugin_id],
    });

    if (componentCheck.rows.length !== component_ids.length) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid component_ids: some components do not belong to this plugin',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY FIX #2: Validate repository_path for path traversal
    const sanitizedPath = repository_path || '~/.claude';
    if (sanitizedPath.includes('..') || (!sanitizedPath.startsWith('/') && !sanitizedPath.startsWith('~/'))) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid repository_path: path traversal detected or invalid format',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY FIX #5: Use cryptographically secure UUID
    const installationId = `install_${randomUUID()}`;
    const repoName = sanitizedPath.split('/').pop() || 'local';

    // TODO ISSUE #3: Implement actual file copying
    // For now, we're only recording the installation in the database
    // Future implementation should:
    // 1. Fetch component files from GitHub/local storage
    // 2. Create target directories if they don't exist
    // 3. Copy files to repository_path
    // 4. Handle conflicts (overwrite, skip, rename)
    // 5. Update status to 'failed' if copy fails

    await db.execute({
      sql: `
        INSERT INTO plugin_installations (
          id, plugin_id, repository_name, repository_path,
          component_count, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `,
      args: [
        installationId,
        plugin_id,
        repoName,
        sanitizedPath,
        component_ids.length,
        'pending', // Changed from 'completed' since files aren't actually copied yet
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          installation_id: installationId,
          installed_count: component_ids.length,
          repository: repoName,
          status: 'pending',
          note: 'Installation recorded. File copying not yet implemented.',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Installation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Installation failed',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
