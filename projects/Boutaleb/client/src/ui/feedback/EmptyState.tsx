import * as React from 'react';
import { Button } from '../Button';

export interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-bg/60 px-6 py-10 text-center">
            <h3 className="text-lg font-display font-semibold text-text">{title}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
            {actionLabel && onAction ? (
                <div className="mt-5">
                    <Button onClick={onAction}>{actionLabel}</Button>
                </div>
            ) : null}
        </div>
    );
}
