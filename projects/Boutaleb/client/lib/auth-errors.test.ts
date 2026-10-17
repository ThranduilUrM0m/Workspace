import { readAuthError, returnPath, tryAgain } from './auth-errors';

const api = (code: string, extra: object = {}) => ({ errors: [{ code, message: '' }], ...extra });

describe('readAuthError', () => {
    it('gives an unknown address and a wrong password the same answer', () => {
        expect(readAuthError(api('form_identifier_not_found'))).toEqual({ kind: 'creds' });
        expect(readAuthError(api('form_password_incorrect'))).toEqual({ kind: 'creds' });
        expect(readAuthError(api('strategy_for_user_invalid'))).toEqual({ kind: 'creds' });
    });

    it('reads the wait from Retry-After first', () => {
        expect(readAuthError(api('too_many_requests', { status: 429, retryAfter: 230 }))).toEqual({ kind: 'limited', minutes: 4 });
    });

    it("falls back to the figure in Clerk's sentence for a lockout", () => {
        const e = { errors: [{ code: 'user_locked', message: 'Account locked', longMessage: 'You will be able to try again in 30 minutes.' }] };
        expect(readAuthError(e)).toEqual({ kind: 'locked', minutes: 30 });
        const hours = { errors: [{ code: 'user_locked', longMessage: 'Try again in 1 hour.' }] };
        expect(readAuthError(hours)).toEqual({ kind: 'locked', minutes: 60 });
    });

    it('says nothing about time when Clerk does not', () => {
        expect(readAuthError(api('user_locked'))).toEqual({ kind: 'locked', minutes: null });
    });

    it('treats a 429 with no code as rate limiting', () => {
        expect(readAuthError({ status: 429, errors: [] })).toEqual({ kind: 'limited', minutes: null });
    });

    it('splits a wrong code from a dead one', () => {
        expect(readAuthError(api('form_code_incorrect'))).toEqual({ kind: 'badCode' });
        expect(readAuthError(api('verification_expired'))).toEqual({ kind: 'deadCode' });
        expect(readAuthError(api('verification_failed'))).toEqual({ kind: 'deadCode' });
    });

    it('maps a breached password, an uninvited account and anything else', () => {
        expect(readAuthError(api('form_password_pwned'))).toEqual({ kind: 'breached' });
        expect(readAuthError(api('not_allowed_access'))).toEqual({ kind: 'notInvited' });
        expect(readAuthError(api('something_new'))).toEqual({ kind: 'unknown' });
        expect(readAuthError(null)).toEqual({ kind: 'unknown' });
    });
});

describe('tryAgain', () => {
    it('states the wait', () => {
        expect(tryAgain(4)).toBe('Try again in 4 minutes.');
        expect(tryAgain(1)).toBe('Try again in 1 minute.');
        expect(tryAgain(null)).toBe('Try again shortly.');
    });
});

describe('returnPath', () => {
    const origin = 'http://localhost:3002';
    it('honours an owner path on this origin', () => {
        expect(returnPath('http://localhost:3002/app/projects?tab=2', origin)).toBe('/app/projects?tab=2');
        expect(returnPath('/app', origin)).toBe('/app');
    });
    it('refuses another origin, a public path or junk', () => {
        expect(returnPath('https://evil.example/app', origin)).toBe('/app');
        expect(returnPath('//evil.example/app', origin)).toBe('/app');
        expect(returnPath('http://localhost:3002/en/contact', origin)).toBe('/app');
        expect(returnPath('http://localhost:3002/apple', origin)).toBe('/app');
        expect(returnPath(null, origin)).toBe('/app');
        expect(returnPath('http://[bad', origin)).toBe('/app');
    });
});
