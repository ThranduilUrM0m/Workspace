import { postCategoryLabel, type Post, type PostCategory } from '@/content/posts';

// The blog cover (Blueprinting/products/boutaleb-image-slots.md, COVER): a
// typographic image made from the post's own data, no file to source. One
// spec feeds both surfaces: <PostCover> on the page and the per-post share
// image (blog/[slug]/opengraph-image.tsx), so they cannot drift apart.

export const COVER_VIEWBOX = { width: 160, height: 100 } as const;

const INK = '#1B1B1F';
const PAPER = '#F7F5F2';
const SAND = '#EDE7DE';
const ACCENT = '#C4694A';

// One ground per category, from the locked palette only. Ink on the accent
// ground, not paper: paper on terracotta is under 4:1.
const GROUNDS: Record<PostCategory, { ground: string; ink: string; mark: string }> = {
    branding: { ground: INK, ink: PAPER, mark: ACCENT },
    'web-design': { ground: ACCENT, ink: INK, mark: PAPER },
    process: { ground: SAND, ink: INK, mark: ACCENT },
    business: { ground: PAPER, ink: INK, mark: ACCENT },
};

export type CoverSpec = {
    /** One or two lines of the oversized word, from the first tag. */
    lines: string[];
    category: string;
    ground: string;
    ink: string;
    mark: string;
    /** Font size in viewBox units, sized so the longest line fits the width. */
    fontSize: number;
};

// Bricolage Grotesque Bold runs about 0.56 em per character; the word may
// use 120 of the 160 units (14 margin each side survives the narrowest crop).
const WORD_WIDTH = 120;
const EM_PER_CHAR = 0.56;
const MAX_FONT = 30;
const MIN_FONT = 12;

export function coverSpec(post: Pick<Post, 'tags' | 'category' | 'title'>): CoverSpec {
    const raw = (post.tags[0] ?? post.title).trim();
    const lines = raw
        .split(/[-\s]+/)
        .filter(Boolean)
        .slice(0, 2);
    const longest = Math.max(...lines.map((l) => l.length), 1);
    const fontSize = Math.max(MIN_FONT, Math.min(MAX_FONT, WORD_WIDTH / (longest * EM_PER_CHAR)));
    return { lines, category: postCategoryLabel[post.category], fontSize, ...GROUNDS[post.category] };
}
