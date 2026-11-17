import { posts } from '@/content/posts';
import { coverSpec } from './cover';

describe('coverSpec', () => {
    it('splits a hyphenated tag over two lines and sizes for the longer one', () => {
        const spec = coverSpec({ tags: ['design-systems'], category: 'web-design', title: 'x' });
        expect(spec.lines).toEqual(['design', 'systems']);
        // 7 characters at 0.56 em must fit 120 units: 120 / (7 * 0.56) ~ 30.6, capped at 30.
        expect(spec.fontSize).toBe(30);
    });

    it('shrinks a long single word so it still fits the width', () => {
        const spec = coverSpec({ tags: ['typography'], category: 'branding', title: 'x' });
        expect(spec.lines).toEqual(['typography']);
        expect(spec.fontSize * 0.56 * 10).toBeLessThanOrEqual(120.001);
    });

    it('falls back to the title when a post has no tag', () => {
        expect(coverSpec({ tags: [], category: 'process', title: 'Hello' }).lines).toEqual(['Hello']);
    });

    it('gives every category its own ground and never paper ink on the accent ground', () => {
        const cats = ['branding', 'web-design', 'process', 'business'] as const;
        const specs = cats.map((category) => coverSpec({ tags: ['x'], category, title: 'x' }));
        expect(new Set(specs.map((s) => s.ground)).size).toBe(4);
        const accent = specs.find((s) => s.ground === '#C4694A');
        expect(accent?.ink).toBe('#1B1B1F');
    });

    it('covers every sample post inside the minimum and maximum size', () => {
        for (const p of posts) {
            const { fontSize, lines } = coverSpec(p);
            expect(lines.length).toBeGreaterThan(0);
            expect(lines.length).toBeLessThanOrEqual(2);
            expect(fontSize).toBeGreaterThanOrEqual(12);
            expect(fontSize).toBeLessThanOrEqual(30);
        }
    });
});
