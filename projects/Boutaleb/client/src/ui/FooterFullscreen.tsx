import * as React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Alert } from './index';

const footerLinks = {
    navigation: [
        { label: 'Selected Work', href: '/work' },
        { label: 'Process', href: '/process' },
        { label: 'System', href: '/system-internal' },
        { label: 'Contact', href: '/contact' },
    ],
    social: [
        { label: 'LinkedIn', href: 'https://linkedin.com', external: true },
        { label: 'GitHub', href: 'https://github.com', external: true },
        { label: 'Behance', href: 'https://behance.net', external: true },
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
        <footer className="relative overflow-hidden bg-footer text-surface">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,168,106,0.16),transparent_24%),radial-gradient(circle_at_80%_18%,rgba(28,106,106,0.18),transparent_24%),linear-gradient(180deg,rgba(17,18,20,0.98),rgba(10,11,13,1))]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]" />
            <div className="relative max-w-7xl mx-auto min-h-screen px-6 py-16 md:py-20">
                <div className="grid gap-12 lg:grid-cols-[1.15fr_0.65fr_0.95fr] lg:gap-14">
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent/[0.82]">
                                Zakariae Boutaleb
                            </p>
                            <h3 className="max-w-[12ch] font-display text-4xl leading-[0.95] tracking-[-0.04em] text-white md:text-5xl">
                                Let's build the system behind your growth.
                            </h3>
                            <p className="max-w-md text-base leading-7 text-surface/[0.72]">
                                Premium websites, structured intake, and operational tooling
                                designed to keep delivery calm from the first brief to the final
                                invoice.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            {footerLinks.social.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    target={link.external ? '_blank' : undefined}
                                    rel={link.external ? 'noopener noreferrer' : undefined}
                                    className="rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm text-surface/[0.78] backdrop-blur-md transition hover:border-accent/35 hover:text-accent"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="rounded-[24px] border border-white/[0.10] bg-white/[0.05] p-6 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.22)]">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/[0.82]">
                                Operating manifesto
                            </p>
                            <p className="mt-4 text-sm leading-7 text-surface/[0.72]">
                                Clarity over complexity. Approval before automation. Finance
                                visibility from day one. Systems that stay readable under pressure.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-surface/[0.60]">
                                Navigate
                            </h4>
                            <nav className="space-y-3">
                                {footerLinks.navigation.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="block text-sm text-surface/[0.72] transition hover:text-accent"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>

                    <div className="rounded-[28px] border border-white/[0.10] bg-white/[0.06] p-6 backdrop-blur-2xl shadow-[0_22px_52px_rgba(0,0,0,0.24)] md:p-7">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent/[0.82]">
                                Start here
                            </p>
                            <h4 className="font-display text-2xl tracking-[-0.03em] text-white">
                                Send the brief
                            </h4>
                            <p className="text-sm leading-6 text-surface/[0.68]">
                                Keep it concise. The next response should feel more structured than
                                a normal contact reply.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
                            <div>
                                <label
                                    htmlFor="footer-name"
                                    className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-surface/[0.54]"
                                >
                                    Name
                                </label>
                                <input
                                    id="footer-name"
                                    type="text"
                                    name="name"
                                    placeholder="Your name"
                                    value={formState.name}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.name}
                                    className="w-full rounded-[18px] border border-white/[0.14] bg-white/[0.07] px-4 py-3 text-surface placeholder:text-surface/[0.42] focus:border-accent/45 focus:bg-white/[0.09] focus:outline-none transition"
                                />
                                {errors.name ? (
                                    <p className="mt-2 text-xs text-danger">{errors.name}</p>
                                ) : null}
                            </div>

                            <div>
                                <label
                                    htmlFor="footer-email"
                                    className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-surface/[0.54]"
                                >
                                    Email
                                </label>
                                <input
                                    id="footer-email"
                                    type="email"
                                    name="email"
                                    placeholder="Email address"
                                    value={formState.email}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.email}
                                    className="w-full rounded-[18px] border border-white/[0.14] bg-white/[0.07] px-4 py-3 text-surface placeholder:text-surface/[0.42] focus:border-accent/45 focus:bg-white/[0.09] focus:outline-none transition"
                                />
                                {errors.email ? (
                                    <p className="mt-2 text-xs text-danger">{errors.email}</p>
                                ) : null}
                            </div>

                            <div>
                                <label
                                    htmlFor="footer-message"
                                    className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-surface/[0.54]"
                                >
                                    Project brief
                                </label>
                                <textarea
                                    id="footer-message"
                                    name="message"
                                    placeholder="What are you building, what is getting in the way, and what should this solve?"
                                    value={formState.message}
                                    onChange={handleChange}
                                    aria-invalid={!!errors.message}
                                    rows={4}
                                    className="w-full rounded-[18px] border border-white/[0.14] bg-white/[0.07] px-4 py-3 text-surface placeholder:text-surface/[0.42] focus:border-accent/45 focus:bg-white/[0.09] focus:outline-none transition resize-none"
                                />
                                {errors.message ? (
                                    <p className="mt-2 text-xs text-danger">{errors.message}</p>
                                ) : null}
                            </div>

                            {submitted ? (
                                <Alert
                                    tone="success"
                                    invert
                                    title="Brief received."
                                    description="The next step should come back with more structure than a typical contact reply."
                                    className="border-white/[0.12] bg-white/[0.08]"
                                />
                            ) : (
                                <Button
                                    type="submit"
                                    className="w-full border-accent bg-accent text-primary hover:bg-accent/[0.92]"
                                >
                                    Send Brief
                                </Button>
                            )}
                        </form>
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.10] pt-8 text-xs text-surface/[0.58] sm:flex-row sm:items-center sm:justify-between">
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
