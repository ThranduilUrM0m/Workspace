import * as React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import type { CTA } from './types';

export interface HeroProps {
    title: string;
    subtitle?: string;
    primaryCta?: CTA;
    secondaryCta?: CTA;
    metrics?: string[];
    children?: React.ReactNode;
    className?: string;
}

export function Hero({
    title,
    subtitle,
    primaryCta,
    secondaryCta,
    metrics,
    children,
    className,
}: HeroProps) {
    return (
        <div className={`space-y-10 ${className ?? ''}`.trim()}>
            <div className="max-w-[46rem] space-y-6">
                <h1 className="max-w-[11ch] font-display text-[clamp(3.35rem,7vw,7rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-primary">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="max-w-[38rem] text-[clamp(1.05rem,1.8vw,1.28rem)] leading-8 text-muted">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {primaryCta || secondaryCta ? (
                <div className="flex flex-col gap-3.5 pt-1 sm:flex-row sm:flex-wrap sm:items-center">
                    {primaryCta ? (
                        <Button asChild variant={primaryCta.variant ?? 'primary'}>
                            <Link
                                href={primaryCta.href}
                                target={primaryCta.external ? '_blank' : undefined}
                            >
                                {primaryCta.label}
                            </Link>
                        </Button>
                    ) : null}
                    {secondaryCta ? (
                        <Button asChild variant={secondaryCta.variant ?? 'secondary'}>
                            <Link
                                href={secondaryCta.href}
                                target={secondaryCta.external ? '_blank' : undefined}
                            >
                                {secondaryCta.label}
                            </Link>
                        </Button>
                    ) : null}
                </div>
            ) : null}

            {metrics && metrics.length > 0 ? (
                <div className="grid gap-3 pt-6 sm:grid-cols-2 xl:max-w-[46rem] xl:grid-cols-3">
                    {metrics.map((metric, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 rounded-full border border-border/[0.78] bg-white/[0.72] px-4 py-3.5 text-sm leading-6 text-primary shadow-[0_14px_30px_rgba(14,16,22,0.06)] backdrop-blur-xl"
                        >
                            <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(201,168,106,0.16)]" />
                            <span>{metric}</span>
                        </div>
                    ))}
                </div>
            ) : null}

            {children}
        </div>
    );
}
