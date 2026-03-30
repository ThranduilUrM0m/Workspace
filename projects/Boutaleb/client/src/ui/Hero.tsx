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
        <div className={`space-y-6 ${className ?? ''}`.trim()}>
            <div className="max-w-3xl space-y-4">
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight">
                    {title}
                </h1>
                {subtitle ? (
                    <p className="text-lg md:text-xl text-muted max-w-2xl leading-relaxed">
                        {subtitle}
                    </p>
                ) : null}
            </div>

            {primaryCta || secondaryCta ? (
                <div className="flex flex-col gap-3 sm:flex-row pt-2">
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
                <div className="pt-8 space-y-2">
                    {metrics.map((metric, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm text-muted">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                            {metric}
                        </div>
                    ))}
                </div>
            ) : null}

            {children}
        </div>
    );
}
