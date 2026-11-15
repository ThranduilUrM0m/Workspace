import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { fontVariables } from '../fonts';
import '../globals.css';
import '@/styles/portal.css';

// The client's side (T8.4): a page that exists only behind a magic link. No
// header, no footer, no analytics, no Clerk, never indexed. Its language is
// the client's record, set on the page itself rather than in the URL, so
// this layout sits outside [locale]. Referrer-Policy and Cache-Control come
// from next.config.ts, because a header cannot be set from a layout.
export const metadata: Metadata = {
    title: 'Boutaleb',
    robots: { index: false, follow: false, nocache: true },
    referrer: 'no-referrer',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function PortalLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="fr" dir="ltr" className={fontVariables}>
            <body className="pt-page">{children}</body>
        </html>
    );
}
