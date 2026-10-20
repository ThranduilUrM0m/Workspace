import type { ReactNode } from 'react';
import Link from 'next/link';

// Pieces the three auth screens share (wireframes/login.html,
// forgot-password.html, reset-password.html).

export type Tone = 'err' | 'warn' | 'ok';

export interface Msg {
    text: string;
    tone?: Tone;
}

/* The subtitle's slot doubles as the form-level message: announced when it
   changes, without stealing focus from the field still in use. */
export function FormMsg({ msg }: { msg: Msg }) {
    return (
        <p className="au-msg" role="status" data-tone={msg.tone}>
            {msg.tone === 'ok' ? glyph.tick : glyph.alert}
            <span>{msg.text}</span>
        </p>
    );
}

/* The one filled button. Busy: disabled, says so, one spinner. */
export function Submit({ busy, busyLabel, disabled, children }: { busy?: boolean; busyLabel: string; disabled?: boolean; children: ReactNode }) {
    return (
        <button type="submit" className="au-submit" disabled={busy || disabled} aria-busy={busy || undefined}>
            {busy && <span className="au-spin" aria-hidden="true" />}
            <span>{busy ? busyLabel : children}</span>
        </button>
    );
}

export function PanelIcon({ tone, children }: { tone: 'ok' | 'warn'; children: ReactNode }) {
    return (
        <div className="au-panel-icon" data-tone={tone} aria-hidden="true">
            {children}
        </div>
    );
}

export function BackToLogin() {
    return (
        <div className="au-back">
            <Link className="au-link" href="/login">
                Back to login
            </Link>
        </div>
    );
}

const svg = (body: ReactNode, sw = 2) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} aria-hidden="true">
        {body}
    </svg>
);

export const glyph = {
    alert: svg(
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v6M12 16v.5" />
        </>,
    ),
    tick: svg(<path d="M4 12l5 5L20 6" />),
    tickBold: svg(<path d="M4 12l5 5L20 6" />, 3.5),
    mail: svg(
        <>
            <rect x="3" y="5" width="18" height="14" />
            <path d="M3 7l9 6 9-6" />
        </>,
    ),
    lock: svg(
        <>
            <rect x="4" y="11" width="16" height="9" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>,
    ),
    key: svg(
        <>
            <circle cx="8" cy="15" r="4" />
            <path d="M11 12l9-9M17 6l3 3M14 9l2 2" />
        </>,
    ),
    dead: svg(
        <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16v.5" />
        </>,
    ),
    google: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.04H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.96z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 8.05 1 4.61 3.24 2.18 7.04l3.66 2.85C6.71 7.3 9.14 5.38 12 5.38z" />
        </svg>
    ),
    github: (
        <svg viewBox="0 0 24 24" fill="#1B1B1F" aria-hidden="true">
            <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.77 2.72 1.26 3.38.97.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.08.78 2.17v3.22c0 .3.21.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5z" />
        </svg>
    ),
};

/* The schemas' codes as badge words: two words at most, what, never why. */
export const AUTH_WORDS = {
    required: 'Required',
    email: 'Invalid email',
    tooShort: 'Too short',
    noMatch: 'No match',
    code: 'Six digits',
};
