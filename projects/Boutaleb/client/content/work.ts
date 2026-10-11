// Portfolio projects: one list read by the homepage teaser, the /portfolio
// grid and the project detail (modal and page). Shaped like the future
// Projects API record (seo-boutaleb §4: every project gets a real page).
// PLACEHOLDER: the developer's real work replaces these before launch (plan
// R5, long-lead "Portfolio projects", 2026-12-15). Qasidaty and Risala are
// real products in this repo; their write-ups are still wireframe filler.

export type WorkCategory = 'web-platform' | 'internal-tooling' | 'e-commerce' | 'web-app' | 'brand-site' | 'landing-page';

export const workCategoryLabel: Record<WorkCategory, string> = {
    'web-platform': 'Web platform',
    'internal-tooling': 'Internal tooling',
    'e-commerce': 'E-commerce',
    'web-app': 'Web app',
    'brand-site': 'Brand site',
    'landing-page': 'Landing page',
};

export type Project = {
    slug: string;
    title: string;
    category: WorkCategory;
    year: number;
    /** One sentence, the teaser and grid hover line. */
    blurb: string;
    /** Shown in the homepage teaser and at the top of /portfolio. */
    featured: boolean;
};

export const projects: Project[] = [
    {
        slug: 'qasidaty',
        title: 'Qasidaty',
        category: 'web-platform',
        year: 2024,
        blurb: 'A poetry publishing platform built from scratch, from manuscript intake to reader-facing storefront.',
        featured: true,
    },
    {
        slug: 'risala',
        title: 'Risala',
        category: 'internal-tooling',
        year: 2024,
        blurb: 'An ERP system replacing three disconnected spreadsheets with one source of truth.',
        featured: true,
    },
    { slug: 'project-03', title: 'Project 03', category: 'e-commerce', year: 2025, blurb: 'Placeholder project.', featured: false },
    { slug: 'project-04', title: 'Project 04', category: 'web-app', year: 2025, blurb: 'Placeholder project.', featured: false },
    { slug: 'project-05', title: 'Project 05', category: 'brand-site', year: 2025, blurb: 'Placeholder project.', featured: false },
    { slug: 'project-06', title: 'Project 06', category: 'landing-page', year: 2026, blurb: 'Placeholder project.', featured: false },
];

export const featuredProjects = () => projects.filter((p) => p.featured);
