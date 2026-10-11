import type { Post, PostCategory } from '@/content/posts';

// /blog's state lives in its query string (ticket T4.4), so a filtered,
// sorted view is a link that can be shared and works without JavaScript:
//   c     category        ?c=process
//   t     tag             ?t=pricing   (the tag pills on a post link here)
//   sort  newest | read | discussed
//   view  grid | list
//   page  how many pages of PAGE_SIZE are shown ("Load more" adds one)
// Anything unknown falls back to the default, never to an error or a 404.

export const PAGE_SIZE = 9;

export const SORTS = ['newest', 'read', 'discussed'] as const;
export type Sort = (typeof SORTS)[number];
export type View = 'grid' | 'list';

export type BlogQuery = { c?: PostCategory; t?: string; sort: Sort; view: View; page: number };

type Raw = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export function parseBlogQuery(raw: Raw, categories: readonly string[], tags: readonly string[]): BlogQuery {
    const c = one(raw.c);
    const t = one(raw.t);
    const sort = one(raw.sort);
    const page = Number(one(raw.page));
    return {
        c: c && categories.includes(c) ? (c as PostCategory) : undefined,
        t: t && tags.includes(t) ? t : undefined,
        sort: SORTS.includes(sort as Sort) ? (sort as Sort) : 'newest',
        view: one(raw.view) === 'list' ? 'list' : 'grid',
        page: Number.isInteger(page) && page > 1 ? page : 1,
    };
}

/** The query string for `q` with `change` applied; defaults are left out,
 *  and any change but "Load more" starts again from the first page. */
export function blogHref(q: BlogQuery, change: Partial<BlogQuery>): string {
    const next = { ...q, page: 1, ...change };
    const params = new URLSearchParams();
    if (next.c) params.set('c', next.c);
    if (next.t) params.set('t', next.t);
    if (next.sort !== 'newest') params.set('sort', next.sort);
    if (next.view !== 'grid') params.set('view', next.view);
    if (next.page > 1) params.set('page', String(next.page));
    const s = params.toString();
    return s ? `/blog?${s}` : '/blog';
}

const byNewest = (a: Post, b: Post) => b.publishedAt.localeCompare(a.publishedAt);
const ORDER: Record<Sort, (a: Post, b: Post) => number> = {
    newest: byNewest,
    read: (a, b) => b.views - a.views || byNewest(a, b),
    discussed: (a, b) => b.comments - a.comments || byNewest(a, b),
};

/** The archive: filtered by tag, sorted, cut to the pages shown. The
 *  category filter is applied after, so its counts stay those of the tag. */
export function archive(all: Post[], q: BlogQuery) {
    const tagged = q.t ? all.filter((p) => p.tags.includes(q.t!)) : all;
    const matching = (q.c ? tagged.filter((p) => p.category === q.c) : tagged).sort(ORDER[q.sort]);
    const shown = matching.slice(0, q.page * PAGE_SIZE);
    return { tagged, shown, more: matching.length > shown.length };
}

/** The curated rows above the archive. Until the Posts API keeps weekly
 *  counts (T11.3), "Best of the Week" is the most liked post that is not
 *  the featured one; Top Rated is the next three by likes. */
export function curation(all: Post[]) {
    const featured = all.find((p) => p.featured) ?? [...all].sort(byNewest)[0];
    const byLikes = all.filter((p) => p !== featured).sort((a, b) => b.likes - a.likes || byNewest(a, b));
    return {
        featured,
        best: byLikes[0],
        topRated: byLikes.slice(1, 4),
        mostViewed: [...all].sort(ORDER.read).slice(0, 4),
    };
}

/** Up to three posts sharing the category, then a tag, then the newest. */
export function related(all: Post[], post: Post, n = 3): Post[] {
    const others = all.filter((p) => p.slug !== post.slug);
    const score = (p: Post) => (p.category === post.category ? 2 : 0) + (p.tags.some((t) => post.tags.includes(t)) ? 1 : 0);
    return others.sort((a, b) => score(b) - score(a) || byNewest(a, b)).slice(0, n);
}
