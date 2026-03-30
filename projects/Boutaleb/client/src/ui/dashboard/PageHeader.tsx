import * as React from 'react';

export interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h1 className="text-3xl font-display font-semibold text-text">{title}</h1>
                {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
            </div>
            {actions}
        </div>
    );
}
