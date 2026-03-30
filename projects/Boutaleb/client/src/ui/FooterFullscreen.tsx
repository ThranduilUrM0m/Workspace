import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Alert } from './index';

const footerLinks = {
    work: [
        { label: 'Selected Work', href: '/work' },
        { label: 'Process', href: '/process' },
        { label: 'System', href: '/system-internal' },
    ],
    company: [
        { label: 'About', href: '#about' },
        { label: 'Experience', href: '#experience' },
        { label: 'Manifesto', href: '#manifesto' },
    ],
    social: [
        { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
        { label: 'GitHub', href: 'https://github.com', external: true },
        { label: 'Twitter', href: 'https://twitter.com', external: true },
    ],
};

export interface FooterFullscreenProps {
    children?: React.ReactNode;
}

export function FooterFullscreen({ children }: FooterFullscreenProps) {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!formState.name.trim()) newErrors.name = 'Name is required';
        if (!formState.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email))
            newErrors.email = 'Invalid email';
        if (!formState.message.trim()) newErrors.message = 'Message is required';

        if (Object.keys(newErrors).length === 0) {
            setSubmitted(true);
            setFormState({ name: '', email: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        } else {
            setErrors(newErrors);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    return (
        <footer className="bg-primary text-surface">
            <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
                <div className="grid gap-12 md:grid-cols-3">
                    {/* Column 1: Company Info */}
                    <div className="space-y-4">
                        <h3 className="font-display text-lg font-bold">Zakariae Boutaleb</h3>
                        <p className="text-sm text-surface/70 leading-relaxed">
                            Building beautiful, scalable digital experiences with modern technology
                            and thoughtful design systems.
                        </p>
                        <div className="flex gap-3 pt-4">
                            {footerLinks.social.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    target={link.external ? '_blank' : undefined}
                                    rel={link.external ? 'noopener noreferrer' : undefined}
                                    className="text-sm text-surface/70 hover:text-accent transition"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Work & Process</h4>
                        <nav className="space-y-2">
                            {footerLinks.work.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="block text-sm text-surface/70 hover:text-accent transition"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Column 3: Contact Form */}
                    <div className="space-y-4">
                        <h4 className="font-semibold">Get in Touch</h4>
                        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
                            <div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={formState.name}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.name}
                                    className="w-full rounded-md bg-white/10 px-3 py-2 text-surface placeholder:text-surface/50 border border-white/20 focus:border-accent focus:outline-none transition"
                                />
                                {errors.name ? (
                                    <p className="mt-1 text-xs text-danger">{errors.name}</p>
                                ) : null}
                            </div>

                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={formState.email}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.email}
                                    className="w-full rounded-md bg-white/10 px-3 py-2 text-surface placeholder:text-surface/50 border border-white/20 focus:border-accent focus:outline-none transition"
                                />
                                {errors.email ? (
                                    <p className="mt-1 text-xs text-danger">{errors.email}</p>
                                ) : null}
                            </div>

                            <div>
                                <textarea
                                    name="message"
                                    placeholder="Message"
                                    value={formState.message}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.message}
                                    rows={3}
                                    className="w-full rounded-md bg-white/10 px-3 py-2 text-surface placeholder:text-surface/50 border border-white/20 focus:border-accent focus:outline-none transition resize-none"
                                />
                                {errors.message ? (
                                    <p className="mt-1 text-xs text-danger">{errors.message}</p>
                                ) : null}
                            </div>

                            {submitted ? (
                                <Alert tone="success" title="Thanks! We'll be in touch soon." />
                            ) : (
                                <Button
                                    type="submit"
                                    className="w-full bg-accent text-primary hover:bg-accent/90"
                                >
                                    Send Message
                                </Button>
                            )}
                        </form>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="mt-16 border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-surface/60">
                    <p>&copy; {new Date().getFullYear()} Zakariae Boutaleb. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="#privacy" className="hover:text-accent transition">
                            Privacy
                        </Link>
                        <Link href="#terms" className="hover:text-accent transition">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>

            {children}
        </footer>
    );
}
