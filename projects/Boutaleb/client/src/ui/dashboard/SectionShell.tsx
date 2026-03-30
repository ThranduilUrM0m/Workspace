import * as React from 'react';

export interface SectionShellProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export function SectionShell({ title, description, children, actions }: SectionShellProps) {
    return (
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-lg font-display font-semibold text-text">{title}</h2>
                    {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
                </div>
                {actions}
            </div>
            {children}
        </section>
    );
}
