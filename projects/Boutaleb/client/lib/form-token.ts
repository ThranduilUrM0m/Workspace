'use client';

import { useCallback, useRef } from 'react';

// The signed timestamp every public form sends back (public-forms.md §3).
// Asked for when the visitor first touches the form, not on page load: the
// footer form is on every page, and a token per pageview would be an API
// call per pageview for nothing. A person needs more than 3 s to fill a
// form after focusing it; the API treats a faster send as a script.

const MIN_AGE_MS = 3_100;

async function fetchToken(): Promise<{ t: string; at: number } | null> {
    try {
        const res = await fetch('/api/enquiries/token', { cache: 'no-store' });
        if (!res.ok) return null;
        const { t } = (await res.json()) as { t: string };
        return { t, at: Date.now() };
    } catch {
        return null;
    }
}

export function useFormToken() {
    const token = useRef<Promise<{ t: string; at: number } | null> | null>(null);

    /** Call on the form's first focus. Idempotent. */
    const prime = useCallback(() => {
        token.current ??= fetchToken();
    }, []);

    /**
     * The token to send, or null if none can be had (the form then shows its
     * failure state: sending without one would be read as a bot and dropped
     * silently). A token asked for only now waits out the 3 s first.
     */
    const take = useCallback(async (): Promise<string | null> => {
        let got = token.current ? await token.current : null;
        if (!got) {
            token.current = fetchToken();
            got = await token.current;
        }
        if (!got) {
            token.current = null;
            return null;
        }
        const wait = got.at + MIN_AGE_MS - Date.now();
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));
        return got.t;
    }, []);

    /** After an "expired" answer: the next send asks for a fresh one. */
    const reset = useCallback(() => {
        token.current = null;
    }, []);

    return { prime, take, reset };
}
