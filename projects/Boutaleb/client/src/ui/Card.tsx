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
            className={`rounded-xl border border-border bg-surface shadow-soft ${className ?? ''}`.trim()}
        >
            {hasHeader ? (
                <div className="border-b border-border px-6 py-4">
                    {title ? <h3 className="text-base font-semibold text-text">{title}</h3> : null}
                    {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
                </div>
            ) : null}

            {children ? (
                <div className={`px-6 py-5 ${bodyClassName ?? ''}`.trim()}>{children}</div>
            ) : null}
        </section>
    );
}
