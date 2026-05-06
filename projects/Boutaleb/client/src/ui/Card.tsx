import * as React from 'react';

export interface CardProps {
    title?: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
    bodyClassName?: string;
}

export function Card({ title, description, children, className, bodyClassName }: CardProps) {
    const hasHeader = title || description;
    return (
        <section
            className={`group relative isolate overflow-hidden rounded-[26px] border border-border/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] shadow-panel backdrop-blur-xl ${className ?? ''}`.trim()}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.80]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute -right-12 top-0 h-24 w-24 rounded-full bg-accent/[0.08] blur-3xl"
            />
            {hasHeader ? (
                <div className="relative border-b border-border/70 px-6 py-5">
                    {title ? (
                        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-primary">
                            {title}
                        </h3>
                    ) : null}
                    {description ? (
                        <p className="mt-1.5 max-w-[42ch] text-sm leading-6 text-muted">
                            {description}
                        </p>
                    ) : null}
                </div>
            ) : null}
            {children ? (
                <div className={`relative px-6 py-6 ${bodyClassName ?? ''}`.trim()}>{children}</div>
            ) : null}
        </section>
    );
}
