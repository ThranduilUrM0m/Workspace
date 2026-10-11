import type { Post } from '@/content/posts';
import { archive, blogHref, curation, PAGE_SIZE, parseBlogQuery, related } from './blog';

const post = (slug: string, over: Partial<Post> = {}): Post =>
    ({
        slug,
        title: slug,
        excerpt: '',
        category: 'process',
        tags: [],
        publishedAt: '2026-01-01',
        readMinutes: 3,
        author: 'A',
        comments: 0,
        views: 0,
        likes: 0,
        downs: 0,
        caption: '',
        sections: [],
        thread: [],
        ...over,
    }) as Post;

const CATS = ['branding', 'process'];
const TAGS = ['pricing'];

describe('parseBlogQuery', () => {
    it('reads a full query', () => {
        expect(parseBlogQuery({ c: 'process', t: 'pricing', sort: 'read', view: 'list', page: '3' }, CATS, TAGS)).toEqual({
            c: 'process',
            t: 'pricing',
            sort: 'read',
            view: 'list',
            page: 3,
        });
    });

    it('falls back to the defaults on anything unknown', () => {
        expect(parseBlogQuery({ c: 'nope', t: 'nope', sort: 'oldest', view: 'cards', page: '-2' }, CATS, TAGS)).toEqual({
            c: undefined,
            t: undefined,
            sort: 'newest',
            view: 'grid',
            page: 1,
        });
        expect(parseBlogQuery({ page: '1.5' }, CATS, TAGS).page).toBe(1);
        expect(parseBlogQuery({ c: ['branding', 'process'] }, CATS, TAGS).c).toBe('branding');
    });
});

describe('blogHref', () => {
    const q = parseBlogQuery({}, CATS, TAGS);

    it('leaves defaults out', () => {
        expect(blogHref(q, {})).toBe('/blog');
        expect(blogHref(q, { sort: 'discussed' })).toBe('/blog?sort=discussed');
    });

    it('keeps the rest of the state and restarts the pages', () => {
        const deep = { ...q, c: 'process' as const, view: 'list' as const, page: 3 };
        expect(blogHref(deep, { sort: 'read' })).toBe('/blog?c=process&sort=read&view=list');
        expect(blogHref(deep, { page: 4 })).toBe('/blog?c=process&view=list&page=4');
        expect(blogHref(deep, { c: undefined })).toBe('/blog?view=list');
    });
});

describe('archive', () => {
    const many = Array.from({ length: PAGE_SIZE + 2 }, (_, i) =>
        post(`p${i}`, { publishedAt: `2026-01-${String(i + 1).padStart(2, '0')}`, views: i % 3, category: i % 2 ? 'branding' : 'process' }),
    );
    const q = parseBlogQuery({}, CATS, TAGS);

    it('shows one page, newest first, and says there is more', () => {
        const { shown, more } = archive(many, q);
        expect(shown).toHaveLength(PAGE_SIZE);
        expect(shown[0]!.slug).toBe(`p${PAGE_SIZE + 1}`);
        expect(more).toBe(true);
        expect(archive(many, { ...q, page: 2 }).more).toBe(false);
    });

    it('filters by category and sorts by views, newest breaking ties', () => {
        const { shown } = archive(many, { ...q, c: 'branding', sort: 'read' });
        expect(shown.every((p) => p.category === 'branding')).toBe(true);
        expect(shown.map((p) => p.views)).toEqual([...shown.map((p) => p.views)].sort((a, b) => b - a));
    });

    it('narrows to a tag before the categories are counted', () => {
        const set = [post('a', { tags: ['pricing'] }), post('b', { tags: ['pricing'], category: 'branding' }), post('c')];
        const { tagged, shown } = archive(set, { ...q, t: 'pricing', c: 'branding' });
        expect(tagged.map((p) => p.slug)).toEqual(['a', 'b']);
        expect(shown.map((p) => p.slug)).toEqual(['b']);
    });
});

describe('curation', () => {
    it('keeps the featured post out of the rows under it', () => {
        const set = [post('f', { featured: true, likes: 99 }), post('a', { likes: 5 }), post('b', { likes: 9 }), post('c', { likes: 1 })];
        const { featured, best, topRated } = curation(set);
        expect(featured.slug).toBe('f');
        expect(best!.slug).toBe('b');
        expect(topRated.map((p) => p.slug)).toEqual(['a', 'c']);
    });
});

describe('related', () => {
    it('prefers the same category, then a shared tag, never the post itself', () => {
        const me = post('me', { category: 'branding', tags: ['x'] });
        const set = [me, post('tag', { tags: ['x'] }), post('cat', { category: 'branding' }), post('none')];
        expect(related(set, me).map((p) => p.slug)).toEqual(['cat', 'tag', 'none']);
    });
});
