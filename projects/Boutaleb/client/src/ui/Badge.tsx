import * as React from 'react';

const variants = {
    default: 'bg-bg text-text border border-border',
    success: 'bg-success/10 text-success border border-success/30',
    warning: 'bg-warning/10 text-warning border border-warning/30',
    danger: 'bg-danger/10 text-danger border border-danger/30',
    info: 'bg-info/10 text-info border border-info/30',
} as const;

export interface BadgeProps {
    variant?: keyof typeof variants;
    children: React.ReactNode;
    className?: string;
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variants[variant]} ${className ?? ''}`.trim()}
        >
            {children}
        </span>
    );
}
