import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { headerReveal, softPress } from '@repo/ui/components/Variants';
import { Button, NavigationOverlay } from '../ui';
import { CommandSearchModal } from '../ui/overlays';
import logo from '../media/SVG/Logo_1.svg';

export default function Header() {
    const router = useRouter();
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <motion.header
            variants={headerReveal}
            initial="hidden"
            animate="show"
            className="sticky top-0 z-40 bg-bg/[0.72] backdrop-blur-xl supports-[backdrop-filter]:bg-bg/[0.68]"
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
                <Link href="/" className="font-display text-lg tracking-tight text-primary">
                    <Image src={logo} alt="Zakariae Boutaleb" className="h-8 w-auto" />
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    <Link
                        href="/projects"
                        className="text-sm text-muted transition hover:text-primary"
                    >
                        Projects
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm text-muted transition hover:text-primary"
                    >
                        About
                    </Link>
                    <Link href="/blog" className="text-sm text-muted transition hover:text-primary">
                        Blog
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm text-muted transition hover:text-primary"
                    >
                        Contact
                    </Link>

                    <motion.button
                        type="button"
                        variants={softPress}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setSearchOpen(true)}
                        className="text-sm text-muted transition hover:text-primary"
                    >
                        Search
                    </motion.button>

                    <Button asChild variant="primary" className="ml-2">
                        <Link href="/contact">Start a Project</Link>
                    </Button>
                </nav>

                <div className="md:hidden">
                    <NavigationOverlay />
                </div>
            </div>
            <CommandSearchModal
                open={searchOpen}
                onOpenChange={setSearchOpen}
                query={searchQuery}
                onQueryChange={setSearchQuery}
                onSelect={(item) => {
                    setSearchOpen(false);
                    setSearchQuery('');
                    if (item.onSelect) return item.onSelect();
                    if (item.href) router.push(item.href);
                }}
                items={[
                    {
                        id: 'page-projects',
                        label: 'Projects',
                        description: 'Browse selected case studies',
                        href: '/projects',
                    },
                    {
                        id: 'page-about',
                        label: 'About',
                        description: 'Profile, stack, and testimonials',
                        href: '/about',
                    },
                    {
                        id: 'page-blog',
                        label: 'Blog',
                        description: 'Tutorials, deep-dives, and insights',
                        href: '/blog',
                    },
                    {
                        id: 'page-contact',
                        label: 'Contact',
                        description: 'Start a project or send a message',
                        href: '/contact',
                    },
                ]}
            />
        </motion.header>
    );
}
