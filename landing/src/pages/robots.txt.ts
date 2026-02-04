import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const isProduction = process.env.VERCEL_GIT_COMMIT_REF === 'main';

  const robotsTxt = isProduction
    ? `User-agent: *\nAllow: /\n\nSitemap: https://jbcloud.app/sitemap.xml`
    : `User-agent: *\nDisallow: /`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
