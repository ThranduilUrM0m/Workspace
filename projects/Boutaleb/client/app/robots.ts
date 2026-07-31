// App Router file — coexists with pages/ (Pages Router). See decisions/ADR-010-nextjs-app-router-incremental-adoption.md
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
