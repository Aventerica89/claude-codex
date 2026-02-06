import type { APIRoute } from 'astro';
import { getDb } from '../../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { plugin_id, component_ids, repository_path } = body;

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

    const installationId = `install_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const repoName = repository_path?.split('/').pop() || 'local';

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
        repository_path || '~/.claude',
        component_ids.length,
        'completed',
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          installation_id: installationId,
          installed_count: component_ids.length,
          repository: repoName,
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
