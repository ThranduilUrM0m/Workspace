import * as React from 'react';

export interface SkeletonBlockProps {
    className?: string;
}

export function SkeletonBlock({ className }: SkeletonBlockProps) {
    return (
        <div
            className={`animate-pulse rounded-xl bg-border/70 ${className ?? 'h-20 w-full'}`.trim()}
            aria-hidden
        />
    );
}
