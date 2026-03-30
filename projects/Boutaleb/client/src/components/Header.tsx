import Link from 'next/link';
import { Button, NavigationOverlay } from '../ui';

export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                <Link href="/" className="font-display text-lg tracking-tight text-primary">
                    Zakariae Boutaleb
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <Link href="/work" className="text-sm text-muted transition hover:text-primary">
                        Work
                    </Link>
                    <Link
                        href="/process"
                        className="text-sm text-muted transition hover:text-primary"
                    >
                        Process
                    </Link>
                    <Link
                        href="/system-internal"
                        className="text-sm text-muted transition hover:text-primary"
                    >
                        System
                    </Link>
                    <Button asChild variant="primary">
                        <Link href="/contact">Start a Project</Link>
                    </Button>
                </nav>

                <div className="md:hidden">
                    <NavigationOverlay />
                </div>
            </div>
        </header>
    );
}
