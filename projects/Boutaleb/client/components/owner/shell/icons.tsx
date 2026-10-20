import type { ReactNode } from 'react';
import { SITE_PLAN_VIEWBOX, SITE_PLAN_WALLS } from '@/components/public/site-plan';
import type { Icon } from './nav';

// The nav glyphs (wireframes/shell/shell.js I), 20px grid, 1.6 stroke.
const PATHS: Record<Icon | 'caret' | 'search', ReactNode> = {
    grid: (
        <>
            <rect x="2.5" y="2.5" width="6" height="6" rx="1" />
            <rect x="11.5" y="2.5" width="6" height="6" rx="1" />
            <rect x="2.5" y="11.5" width="6" height="6" rx="1" />
            <rect x="11.5" y="11.5" width="6" height="6" rx="1" />
        </>
    ),
    bars: (
        <>
            <rect x="2.5" y="3" width="4.5" height="14" rx="1" />
            <rect x="8" y="3" width="4.5" height="9" rx="1" />
            <rect x="13.5" y="3" width="4.5" height="11" rx="1" />
        </>
    ),
    ledger: (
        <>
            <path d="M5 2.5h10v15l-2-1.3-1.7 1.3-1.7-1.3L8 17.5l-1.7-1.3L5 17.5v-15Z" />
            <path d="M7.5 7h5M7.5 10h5M7.5 13h3" />
        </>
    ),
    people: (
        <>
            <circle cx="7" cy="6.5" r="2.5" />
            <path d="M2.5 16c0-3 2-4.8 4.5-4.8s4.5 1.8 4.5 4.8" />
            <circle cx="14.5" cy="7" r="2" />
            <path d="M13 11.5c2 0 4 1.5 4 4.5" />
        </>
    ),
    folder: <path d="M2.5 5.5a1 1 0 0 1 1-1h4l1.5 2h7.5a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-10Z" />,
    funnel: <path d="M2.5 4h15l-6 7v5.5l-3 1.5V11l-6-7Z" />,
    pulse: <path d="M2.5 11.5h3l2.5-6 3.5 10 2.5-7 1.5 3h2" />,
    globe: (
        <>
            <circle cx="10" cy="10" r="7.5" />
            <path d="M2.5 10h15M10 2.5c2 2.4 3 4.9 3 7.5s-1 5.1-3 7.5c-2-2.4-3-4.9-3-7.5s1-5.1 3-7.5Z" />
        </>
    ),
    pencil: (
        <>
            <path d="M4 3.5h8l4 4v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-12a1 1 0 0 1 1-1Z" />
            <path d="M12 3.5v4h4" />
            <path d="M6.5 12l3-1 4-4-2-2-4 4-1 3Z" />
        </>
    ),
    gear: (
        <>
            <circle cx="10" cy="10" r="2.6" />
            <path d="M10 3v2M10 15v2M17 10h-2M5 10H3M14.9 5.1l-1.4 1.4M6.5 13.5l-1.4 1.4M14.9 14.9l-1.4-1.4M6.5 6.5 5.1 5.1" />
        </>
    ),
    exit: (
        <>
            <path d="M8 3H4.5a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1H8" />
            <path d="M12.5 13.5 17 10l-4.5-3.5" />
            <path d="M17 10H7.5" />
        </>
    ),
    caret: <path d="M7 5l5 5-5 5" />,
    search: (
        <>
            <circle cx="9" cy="9" r="5.5" />
            <path d="m17 17-3.2-3.2" />
        </>
    ),
};

export function NavIcon({ name, className }: { name: keyof typeof PATHS; className?: string }) {
    return (
        <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={name === 'caret' ? 2 : 1.6} aria-hidden="true">
            {PATHS[name]}
        </svg>
    );
}

/** Favicon_2, the floor-plan mark: the one icon everywhere an icon is needed. */
export function Mark({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox={SITE_PLAN_VIEWBOX} aria-hidden="true">
            <path d={SITE_PLAN_WALLS} />
        </svg>
    );
}
