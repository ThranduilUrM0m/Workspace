import { readableEmail } from './thanks';

describe('readableEmail', () => {
    it('keeps a plain address', () => {
        expect(readableEmail('sara@atlas-riads.ma')).toBe('sara@atlas-riads.ma');
    });

    it('drops anything that is not one', () => {
        expect(readableEmail(undefined)).toBeNull();
        expect(readableEmail('')).toBeNull();
        expect(readableEmail('not an email')).toBeNull();
        expect(readableEmail(`${'a'.repeat(250)}@b.ma`)).toBeNull();
    });
});
