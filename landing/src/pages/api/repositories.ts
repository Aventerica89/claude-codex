import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      success: true,
      data: [
        {
          id: 'local',
          name: 'Local Repository',
          path: '~/.claude',
        },
      ],
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
