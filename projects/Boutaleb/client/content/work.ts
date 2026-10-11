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

export type CaseStudy = {
    role: string;
    tools: string[];
    /** Hidden when absent (portfolio-detail-modal.html OPEN notes). */
    liveUrl?: string;
    pdfUrl?: string;
    hero: string;
    overview: string;
    problem: string;
    solution: string;
    shots: { label: string; caption?: string }[];
    tokens?: { colors: { hex: string; name: string }[]; type: { family: string; sample: string; use: [string, string] }[] };
    details?: string[];
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
    caseStudy: CaseStudy;
};

// The wireframe's sample case study (Cedar & Stone), until real write-ups.
const sample = (title: string): CaseStudy => ({
    role: 'Design and build',
    tools: ['Next.js', 'Figma'],
    hero: `hero image — ${title}, full bleed, static`,
    overview: 'A full identity system for an independent furniture studio — wordmark, packaging, and a restrained material palette built around the brand’s focus on longevity over trend.',
    problem: 'The studio’s existing identity looked dated next to newer, design-forward competitors, and undersold the quality of the craftsmanship behind each piece.',
    solution: 'A quieter, type-led system — a single custom serif mark, natural paper stocks, and packaging that photographs as well unboxed as it does on a shelf.',
    shots: [{ label: 'screen — homepage', caption: 'Homepage, before/after comparison' }, { label: 'screen — product page' }],
    tokens: {
        colors: [
            { hex: '#B85C38', name: 'Terracotta' },
            { hex: '#3F4B3B', name: 'Sage' },
            { hex: '#2B2622', name: 'Charcoal oak' },
            { hex: '#EFE6D8', name: 'Bone' },
        ],
        type: [
            { family: "'Playfair Display', serif", sample: 'Canela — Aa Gg', use: ['Display serif', 'headlines, wordmark'] },
            { family: "'Inter', sans-serif", sample: 'Suisse Int’l — Aa Gg', use: ['Body / UI sans', 'copy, packaging labels'] },
        ],
    },
    details: ['packaging close-up', 'business card'],
});

export const projects: Project[] = [
    {
        slug: 'qasidaty',
        title: 'Qasidaty',
        category: 'web-platform',
        year: 2024,
        blurb: 'A poetry publishing platform built from scratch, from manuscript intake to reader-facing storefront.',
        featured: true,
        caseStudy: sample('Qasidaty'),
    },
    {
        slug: 'risala',
        title: 'Risala',
        category: 'internal-tooling',
        year: 2024,
        blurb: 'An ERP system replacing three disconnected spreadsheets with one source of truth.',
        featured: true,
        caseStudy: sample('Risala'),
    },
    { slug: 'project-03', title: 'Project 03', category: 'e-commerce', year: 2025, blurb: 'Placeholder project.', featured: false, caseStudy: sample('Project 03') },
    { slug: 'project-04', title: 'Project 04', category: 'web-app', year: 2025, blurb: 'Placeholder project.', featured: false, caseStudy: sample('Project 04') },
    { slug: 'project-05', title: 'Project 05', category: 'brand-site', year: 2025, blurb: 'Placeholder project.', featured: false, caseStudy: sample('Project 05') },
    { slug: 'project-06', title: 'Project 06', category: 'landing-page', year: 2026, blurb: 'Placeholder project.', featured: false, caseStudy: sample('Project 06') },
];

export const featuredProjects = () => projects.filter((p) => p.featured);
export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);
