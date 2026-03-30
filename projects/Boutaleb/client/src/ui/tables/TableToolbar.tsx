import * as React from 'react';

export interface TableToolbarProps {
    title: string;
    description?: string;
    filters?: React.ReactNode;
    actions?: React.ReactNode;
}

export function TableToolbar({ title, description, filters, actions }: TableToolbarProps) {
    return (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
                <h2 className="text-lg font-display font-semibold text-text">{title}</h2>
                {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
            </div>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {filters}
                {actions}
            </div>
        </div>
    );
}
