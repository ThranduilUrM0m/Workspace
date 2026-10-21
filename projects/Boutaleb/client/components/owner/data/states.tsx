'use client';

import type { CSSProperties } from 'react';

// C19, the data-state pieces every ERP screen composes (HANDOFF §21,
// wireframes/shell/shell.css "Data states"). Loading is a skeleton in the
// shape of the answer; it fades in only after .4s, so a fast load never
// flashes, and breathes rather than shimmers.

/** One skeleton bar. Square, aria-hidden: the region carries aria-busy. */
export function Skel({ w = '100%', h = '.625rem' }: { w?: string; h?: string }) {
    return <i className="b-skel" aria-hidden="true" style={{ '--w': w, '--h': h } as CSSProperties} />;
}

/** The sentence a screen reader hears while a region loads. */
export function Loading({ what }: { what: string }) {
    return (
        <p className="b-sr" role="status">
            Loading {what}…
        </p>
    );
}

export const OFFLINE = (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M6.2 15.5h8.3a3 3 0 0 0 .7-5.9 4.6 4.6 0 0 0-8.6-1.4A3.7 3.7 0 0 0 6.2 15.5Z" />
        <path d="M3.5 3.5l13 13" />
    </svg>
);

/** When the last attempt was, as the failed panel states it: "09:41". */
export const atTime = (ms: number) =>
    new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca' }).format(ms);
