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
    /** "Not for me" votes: recorded, shown only in the ERP blog console. */
    downs: number;
    featured?: boolean;
    caption: string;
    /** The first section's title only names it in the contents; the
     *  article opens on its paragraphs, no heading. */
    sections: PostSection[];
    thread: PostComment[];
};

export type PostBlock = { kind: 'p'; text: string } | { kind: 'quote'; text: string } | { kind: 'image'; label: string };
export type PostSection = { id: string; title: string; blocks: PostBlock[] };

export type PostComment = {
    id: string;
    name: string;
    /** ISO date. */
    at: string;
    text: string;
    likes: number;
    byAuthor?: boolean;
    replies?: PostComment[];
};

const author = 'Zakariae Boutaleb';

/** The author card beside every post. PLACEHOLDER copy (blog-post.html). */
export const authorCard = {
    name: author,
    role: 'Founder & developer',
    bio: 'Writes about branding, process, and the business side of running a small studio.',
};

// The wireframe's sample article and thread, under every post until real ones.
const sample = {
    caption:
        "The studio's original wordmark sketch, kept unchanged since the first client delivery in 2019, photographed against the same oak sample used in that first project.",
    sections: [
        {
            id: 's1',
            title: 'Why longevity matters',
            blocks: [
                {
                    kind: 'p',
                    text: 'Trend-chasing feels productive because it’s visible — a new logo mark, a new palette, a new “look” every couple of years. But for furniture brands specifically, that instinct works against the thing customers are actually buying: durability, both physical and perceptual.',
                },
                {
                    kind: 'p',
                    text: 'When a brand’s identity shifts every eighteen months, it quietly tells the customer the product underneath might too. Longevity in the mark becomes part of the pitch for longevity in the object.',
                },
                { kind: 'quote', text: '“A brand that looks the same in five years isn’t stagnant — it’s proof the first decision was the right one.”' },
                {
                    kind: 'p',
                    text: 'That doesn’t mean freezing everything. It means separating what’s allowed to evolve (photography, campaign language, seasonal palettes) from what isn’t (the mark, the type system, the core color logic).',
                },
                { kind: 'image', label: 'In-article image' },
            ],
        },
        {
            id: 's2',
            title: 'What to keep fixed',
            blocks: [
                {
                    kind: 'p',
                    text: 'Three things, deliberately: the wordmark geometry, the ink/accent color relationship, and the display typeface. Everything else — photography direction, campaign copy tone, secondary palettes — was left open to move with the market.',
                },
                { kind: 'p', text: 'The result held up better than a full refresh would have, and cost a fraction of one.' },
            ],
        },
    ] satisfies PostSection[],
    thread: [
        {
            id: 'c1',
            name: 'Hamza R.',
            at: '2026-07-15',
            text: 'This matches what we’ve seen with our own furniture line — every “refresh” made customers ask if the quality had changed too, even when it hadn’t.',
            likes: 12,
            replies: [
                {
                    id: 'c2',
                    name: author,
                    at: '2026-07-16',
                    text: 'Exactly — the mark is a proxy for trust in the product, so keeping it stable is part of the product decision, not just the design one.',
                    likes: 5,
                    byAuthor: true,
                },
            ],
        },
        {
            id: 'c3',
            name: 'Sara L.',
            at: '2026-07-14',
            text: 'Curious how you handle the seasonal palette shifts without it feeling inconsistent with the locked core colors — worth a follow-up post?',
            likes: 4,
        },
    ] satisfies PostComment[],
};

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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
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
        downs: 0,
        ...sample,
    },
];

export const postBySlug = (slug: string) => posts.find((p) => p.slug === slug);
export const newestPosts = (n: number) => [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, n);
