// The field icon wells of the public forms (public.css .ff-icon, contact.html),
// one place for every form. Decorative: the field's label names it.

const S = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 } as const;

export const glyph = {
    person: (
        <svg {...S}>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
    ),
    mail: (
        <svg {...S}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
        </svg>
    ),
    tag: (
        <svg {...S}>
            <path d="M20 12l-8 8-9-9V4h7l10 8z" />
            <circle cx="7.5" cy="7.5" r="1" />
        </svg>
    ),
    bubble: (
        <svg {...S}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    phone: (
        <svg {...S}>
            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.4a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2.2z" />
        </svg>
    ),
    briefcase: (
        <svg {...S}>
            <rect x="3" y="7" width="18" height="13" rx="1" />
            <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    globe: (
        <svg {...S}>
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
    ),
    clock: (
        <svg {...S}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 3" />
        </svg>
    ),
    calendar: (
        <svg {...S}>
            <rect x="3" y="4" width="18" height="17" rx="1" />
            <path d="M3 9h18M8 3v3M16 3v3" />
        </svg>
    ),
    pin: (
        <svg {...S}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l4 2" />
        </svg>
    ),
    star: (
        <svg {...S}>
            <path d="M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21 7.5 13.5 2 9h7z" />
        </svg>
    ),
    spark: (
        <svg {...S}>
            <path d="M12 2l2.2 6.8H21l-5.6 4.1 2.1 6.9L12 15.8 6.5 19.8l2.1-6.9L3 8.8h6.8z" />
        </svg>
    ),
    plus: (
        <svg {...S}>
            <path d="M8 12h8M12 8v8" />
            <circle cx="12" cy="12" r="9" />
        </svg>
    ),
    link: (
        <svg {...S}>
            <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
        </svg>
    ),
    upload: (
        <svg {...S}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
        </svg>
    ),
    arrow: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M7 17L17 7M9 7h8v8" />
        </svg>
    ),
};
