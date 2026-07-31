// App Router file — coexists with pages/ (Pages Router). See decisions/ADR-010-nextjs-app-router-incremental-adoption.md
import type { MetadataRoute } from 'next';
import { blogApi, projectsApi } from '../src/lib/apiClients';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002';
  const staticRoutes: MetadataRoute.Sitemap = ['', '/about', '/blog', '/projects', '/work', '/process', '/contact'].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await blogApi.getPosts({ limit: 1000 });
    postRoutes = (Array.isArray(data) ? data : []).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
    }));
  } catch {
    postRoutes = [];
  }

  let projectRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data } = await projectsApi.getProjects();
    projectRoutes = (Array.isArray(data) ? data : []).map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: new Date(),
    }));
  } catch {
    projectRoutes = [];
  }

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
