import { bundleProblem, readBundle } from './bundle';

const b = (s = 'x') => new TextEncoder().encode(s);

describe('readBundle', () => {
    it('strips the one folder a zipped folder is wrapped in, and the OS litter', () => {
        const out = readBundle({
            'site/': b(),
            'site/index.html': b(),
            'site/css/style.css': b(),
            'site/.DS_Store': b(),
            '__MACOSX/site/._index.html': b(),
        });
        expect(out.files.map((f) => f.path)).toEqual(['css/style.css', 'index.html']);
        expect(out.skipped).toEqual([]);
    });

    it('leaves a flat zip alone and skips types a wireframe has no use for', () => {
        const out = readBundle({ 'index.html': b(), 'menu.html': b(), 'notes.md': b(), 'art/hero.psd': b() });
        expect(out.files.map((f) => f.path)).toEqual(['index.html', 'menu.html']);
        expect(out.skipped).toEqual(['notes.md', 'art/hero.psd']);
    });

    it('does not strip a folder that only some files share', () => {
        const out = readBundle({ 'index.html': b(), 'img/a.png': b() });
        expect(out.files.map((f) => f.path)).toEqual(['img/a.png', 'index.html']);
    });
});

describe('bundleProblem', () => {
    it('needs at least one top-level page', () => {
        expect(bundleProblem(readBundle({}))).toBe('empty');
        expect(bundleProblem(readBundle({ 'a/index.html': b(), 'b/x.css': b() }))).toBe('noPages');
        expect(bundleProblem(readBundle({ 'index.html': b() }))).toBeNull();
    });
});
