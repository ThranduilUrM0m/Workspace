import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

const navLinks = [
    { label: 'Work', href: '/work' },
    { label: 'Process', href: '/process' },
    { label: 'System', href: '/system-internal' },
    { label: 'Contact', href: '/contact' },
];

export interface NavigationOverlayProps {
    children?: React.ReactNode;
}

export function NavigationOverlay({ children }: NavigationOverlayProps) {
    const [open, setOpen] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (newOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    };

    return (
        <>
            <button
                onClick={() => handleOpenChange(!open)}
                aria-label="Toggle navigation menu"
                aria-pressed={open}
                className="inline-flex items-center justify-center rounded-md p-2 text-primary hover:bg-bg transition"
            >
                <span className="sr-only">Menu</span>
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        key="nav-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-primary/95 backdrop-blur-sm md:hidden"
                        onClick={() => handleOpenChange(false)}
                    >
                        <div className="flex h-full flex-col" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between border-b border-surface/20 px-6 py-4">
                                <span className="font-display text-lg tracking-tight text-surface">
                                    Menu
                                </span>
                                <button
                                    onClick={() => handleOpenChange(false)}
                                    aria-label="Close menu"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-surface hover:bg-white/10 transition"
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            <nav className="flex-1 overflow-auto px-6 py-8">
                                <div className="space-y-1">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="block rounded-lg px-4 py-3 text-base font-medium text-surface/80 hover:bg-white/10 hover:text-surface transition"
                                            onClick={() => handleOpenChange(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </nav>

                            <div className="border-t border-surface/20 px-6 py-6">
                                <Button
                                    onClick={() => {
                                        handleOpenChange(false);
                                        window.location.href = '/contact';
                                    }}
                                    className="w-full bg-accent text-primary hover:bg-accent/90"
                                >
                                    Start a Project
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {children}
        </>
    );
}
