import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { fontVariables } from '../fonts';
import '../globals.css';

// The owner side (ERP + auth screens): English only, never indexed, and
// the only part of the site that loads Clerk.
export const metadata: Metadata = {
    title: { template: '%s — Boutaleb', default: 'Boutaleb' },
    robots: { index: false, follow: false },
};

export default function OwnerLayout({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider signInUrl="/login">
            <html lang="en" dir="ltr" className={fontVariables}>
                <body>{children}</body>
            </html>
        </ClerkProvider>
    );
}
