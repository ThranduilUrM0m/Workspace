import Link from 'next/link';
import Image from 'next/image';
import { Button, NavigationOverlay } from '../ui';
import logo from '../media/SVG/Logo_1.svg';

export default function Header() {
    return (
        <header className="sticky top-0 z-40 bg-bg/[0.72] backdrop-blur-xl supports-[backdrop-filter]:bg-bg/[0.68]">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-5">
                <Link href="/" className="flex items-center">
                    <Image src={logo} alt="Zakariae Boutaleb" className="h-8 w-auto" />
                </Link>

                <nav className="hidden items-center gap-2 bg-surface/[0.76] px-2 py-2 shadow-soft backdrop-blur-xl md:flex">
                    <Link
                        href="/projects"
                        className="px-4 py-2 text-sm text-muted transition hover:bg-bg hover:text-primary"
                    >
                        Projects
                    </Link>
                    <Link
                        href="/about"
                        className="px-4 py-2 text-sm text-muted transition hover:bg-bg hover:text-primary"
                    >
                        About
                    </Link>
                    <Link
                        href="/blog"
                        className="px-4 py-2 text-sm text-muted transition hover:bg-bg hover:text-primary"
                    >
                        Blog
                    </Link>
                    <Link
                        href="/contact"
                        className="px-4 py-2 text-sm text-muted transition hover:bg-bg hover:text-primary"
                    >
                        Contact
                    </Link>
                    <Button asChild variant="primary" className="ml-1">
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
