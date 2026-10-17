// Clerk's error codes, folded into the few answers the auth screens give
// (HANDOFF §4). Several codes share one answer on purpose: "no such
// account" and "wrong password" both read "Email or password is
// incorrect", so the form never tells anyone who has an account here.

export type AuthFailure =
    | { kind: 'creds' }
    | { kind: 'locked' | 'limited'; minutes: number | null }
    | { kind: 'badCode' }
    | { kind: 'deadCode' }
    | { kind: 'breached' }
    | { kind: 'notInvited' }
    | { kind: 'unknown' };

interface ApiError {
    code?: string;
    longMessage?: string;
    message?: string;
}

/** The shape of a ClerkAPIResponseError, read loosely: tests build plain objects. */
export interface ClerkLikeError {
    status?: number;
    retryAfter?: number;
    errors?: ApiError[];
}

const CREDS = new Set([
    'form_password_incorrect',
    'form_identifier_not_found',
    'strategy_for_user_invalid',
    'form_password_validation_failed',
]);
const DEAD = new Set(['verification_expired', 'verification_failed', 'verification_missing']);
const NOT_INVITED = new Set(['not_allowed_access', 'sign_up_restricted_waitlist', 'external_account_not_found']);

/** Minutes to wait: Retry-After when sent, else the figure in Clerk's sentence. */
function waitMinutes(e: ClerkLikeError, first: ApiError | undefined): number | null {
    if (e.retryAfter && e.retryAfter > 0) return Math.max(1, Math.ceil(e.retryAfter / 60));
    const text = `${first?.longMessage ?? ''} ${first?.message ?? ''}`;
    const m = /(\d+)\s*(minute|hour|second)/i.exec(text);
    if (!m) return null;
    const n = Number(m[1]);
    const unit = m[2]!.toLowerCase();
    return unit === 'hour' ? n * 60 : unit === 'second' ? Math.max(1, Math.ceil(n / 60)) : n;
}

export function readAuthError(error: unknown): AuthFailure {
    const e = (error ?? {}) as ClerkLikeError;
    const first = e.errors?.[0];
    const code = first?.code ?? '';
    if (code === 'user_locked') return { kind: 'locked', minutes: waitMinutes(e, first) };
    if (e.status === 429 || code === 'too_many_requests') return { kind: 'limited', minutes: waitMinutes(e, first) };
    if (CREDS.has(code)) return { kind: 'creds' };
    if (code === 'form_password_pwned') return { kind: 'breached' };
    if (code === 'form_code_incorrect') return { kind: 'badCode' };
    if (DEAD.has(code)) return { kind: 'deadCode' };
    if (NOT_INVITED.has(code)) return { kind: 'notInvited' };
    return { kind: 'unknown' };
}

/** "Try again in 4 minutes": the wait is stated so it can be planned around. */
export function tryAgain(minutes: number | null): string {
    if (minutes === null) return 'Try again shortly.';
    return `Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
}

/**
 * Where to land after signing in. Clerk sends a signed-out visitor here
 * with ?redirect_url=<absolute URL>; only a path on the owner side of
 * this origin is honoured, so the link cannot be used to bounce elsewhere.
 */
export function returnPath(redirectUrl: string | null | undefined, origin: string): string {
    if (!redirectUrl) return '/app';
    try {
        const url = new URL(redirectUrl, origin);
        if (url.origin !== origin) return '/app';
        if (!/^\/app(\/|$)/.test(url.pathname)) return '/app';
        return url.pathname + url.search + url.hash;
    } catch {
        return '/app';
    }
}
