import type { ReactNode } from 'react';
import Link from 'next/link';
import '@/styles/auth.css';

// The auth screens' frame (shell/auth.css): wordmark, one centred card,
// the image slot on desktop. No shell, no sidebar: nothing here to fight.
export function AuthFrame({ children }: { children: ReactNode }) {
    return (
        <div className="au">
            <div className="au-left">
                <nav className="au-nav" aria-label="Boutaleb">
                    <Link className="au-wordmark" href="/">
                        boutaleb<span>.</span>
                    </Link>
                </nav>
                <main className="au-main">{children}</main>
            </div>
            {/* The photograph is parked for the brand phase (HANDOFF §8). */}
            <div className="au-right" aria-hidden="true">
                <div className="au-frame" />
            </div>
        </div>
    );
}
