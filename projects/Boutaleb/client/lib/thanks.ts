// /contact answers 303 to /thanks and sets this cookie to the sender's
// email for 30 minutes (public-forms.md, README 41). /thanks reads it for
// the "a copy is on its way" line; without it the page reads the same,
// minus that line. httpOnly: only the server ever reads it.
export const THANKS_COOKIE = 'bt_thanks_email';
export const THANKS_COOKIE_MAX_AGE = 30 * 60;

// Loose on purpose: it only decides whether to show the line. The value is
// rendered as text, never HTML.
export function readableEmail(value: string | undefined) {
    if (!value || value.length > 254) return null;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : null;
}
