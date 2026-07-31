// App Router file — coexists with pages/ (Pages Router). See decisions/ADR-010-nextjs-app-router-incremental-adoption.md
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const staticRoutes: MetadataRoute.Sitemap = ['', '/blog', '/portfolio', '/contact'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  const posts = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog`)
    .then((res) => res.json())
    .catch(() => []);

  const postRoutes: MetadataRoute.Sitemap = posts.map((post: { slug: string; updatedAt: string }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
  }));

  return [...staticRoutes, ...postRoutes];
}
