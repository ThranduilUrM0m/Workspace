// Blog posts: one list read by the homepage slider, /blog and /blog/<slug>.
// Shaped like the future Posts API record (ERP Blog console). Counts are the
// public ones only: downvotes are recorded but never shown (README 58c).
// PLACEHOLDER: wireframe sample posts until the first real ones are written.

export type PostCategory = 'branding' | 'web-design' | 'process' | 'business';

export const postCategoryLabel: Record<PostCategory, string> = {
    branding: 'Branding',
    'web-design': 'Web design',
    process: 'Process',
    business: 'Business',
};

export type Post = {
    slug: string;
    title: string;
    excerpt: string;
    category: PostCategory;
    tags: string[];
    /** ISO date. */
    publishedAt: string;
    readMinutes: number;
    author: string;
    comments: number;
    views: number;
    likes: number;
    featured?: boolean;
};

const author = 'Zakariae Boutaleb';

export const posts: Post[] = [
    {
        slug: 'design-system-survives',
        title: 'Building a design system that survives client requests',
        excerpt: 'Tokens, components, and the handful of rules that keep your design system from rotting after six months of real use.',
        category: 'web-design',
        tags: ['design-systems'],
        publishedAt: '2026-08-18',
        readMinutes: 8,
        author,
        comments: 12,
        views: 128,
        likes: 34,
    },
    {
        slug: 'no-code-shortcut',
        title: 'No-Code Isn’t a Shortcut',
        excerpt:
            'A client came in wanting to skip development entirely and drag-and-drop their way to a product. Six months and a stalled build later, they needed something that actually worked.',
        category: 'process',
        tags: ['process'],
        publishedAt: '2026-08-02',
        readMinutes: 5,
        author,
        comments: 6,
        views: 412,
        likes: 18,
    },
    {
        slug: 'longevity-beats-trend',
        title: 'Why longevity beats trend in furniture branding',
        excerpt: 'A short pull-quote or opening line from the post, enough to make someone want to click through and read the rest.',
        category: 'branding',
        tags: ['branding'],
        publishedAt: '2026-07-14',
        readMinutes: 6,
        author,
        comments: 4,
        views: 88,
        likes: 12,
        featured: true,
    },
    {
        slug: 'intake-pipeline',
        title: 'From your first email to kickoff',
        excerpt: 'Every step between your first email and the kickoff call.',
        category: 'process',
        tags: ['process'],
        publishedAt: '2026-07-10',
        readMinutes: 4,
        author,
        comments: 7,
        views: 96,
        likes: 21,
    },
    {
        slug: 'pricing-honestly',
        title: 'Pricing case studies honestly',
        excerpt: 'A year of quotes, scope creep, and what a project like yours should actually cost.',
        category: 'business',
        tags: ['pricing'],
        publishedAt: '2026-07-03',
        readMinutes: 7,
        author,
        comments: 19,
        views: 210,
        likes: 58,
    },
    {
        slug: 'typography-nobody-notices',
        title: 'Typography choices nobody notices',
        excerpt: 'The small kerning and pairing decisions that quietly make a brand feel considered.',
        category: 'branding',
        tags: ['typography'],
        publishedAt: '2026-06-20',
        readMinutes: 5,
        author,
        comments: 4,
        views: 64,
        likes: 15,
    },
    {
        slug: 'saying-no-font-pick',
        title: 'Saying no to a client’s font pick',
        excerpt: 'Why your typeface pick may get pushed back, and why that protects your project.',
        category: 'web-design',
        tags: ['clients'],
        publishedAt: '2026-06-06',
        readMinutes: 4,
        author,
        comments: 9,
        views: 150,
        likes: 27,
    },
    {
        slug: 'messy-draft',
        title: 'A messy draft is still progress',
        excerpt: 'Why you see a rough first pass early instead of waiting for something presentable.',
        category: 'process',
        tags: ['process'],
        publishedAt: '2026-05-22',
        readMinutes: 3,
        author,
        comments: 3,
        views: 80,
        likes: 11,
    },
];

export const newestPosts = (n: number) => [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, n);
