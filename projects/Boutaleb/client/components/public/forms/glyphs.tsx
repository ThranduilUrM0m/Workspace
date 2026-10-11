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
};
