import * as React from 'react';

export interface AvatarProps {
    src?: string;
    alt?: string;
    fallback: string;
    className?: string;
}

export function Avatar({ src, alt, fallback, className }: AvatarProps) {
    return (
        <span
            className={`inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/8 text-sm font-semibold text-text ${className ?? ''}`.trim()}
        >
            {src ? (
                <img src={src} alt={alt ?? fallback} className="h-full w-full object-cover" />
            ) : (
                fallback.slice(0, 2).toUpperCase()
            )}
        </span>
    );
}
