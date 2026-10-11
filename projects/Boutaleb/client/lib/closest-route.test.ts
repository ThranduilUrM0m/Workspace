import { closestRoute } from './closest-route';

describe('closestRoute', () => {
    it('finds a one-letter typo', () => {
        expect(closestRoute('/proces')).toEqual({ key: 'process', href: '/services#process' });
        expect(closestRoute('/servics')).toEqual({ key: 'services', href: '/services' });
    });

    it('allows two edits on a long slug', () => {
        expect(closestRoute('/legal-notce/')).toEqual({ key: 'legalNotice', href: '/legal-notice' });
        expect(closestRoute('/PORTFOLIIO')).toEqual({ key: 'portfolio', href: '/portfolio' });
    });

    it('answers nothing when no route is close', () => {
        expect(closestRoute('/xyz-old-link')).toBeNull();
        expect(closestRoute('/')).toBeNull();
        expect(closestRoute('/blog/some-old-post')).toBeNull();
    });
});
