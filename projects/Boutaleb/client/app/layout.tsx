import type { ReactNode } from 'react';

// The public site's <html> lives in app/[locale]/layout.tsx, where the
// language is known. This root only passes through.
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
