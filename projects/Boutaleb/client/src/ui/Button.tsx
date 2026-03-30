import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';

const base =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60';

const variants = {
    primary: 'bg-primary text-surface hover:bg-primary/90',
    secondary: 'border border-border text-text hover:bg-bg',
    ghost: 'text-text hover:bg-bg',
    danger: 'bg-danger text-white hover:bg-danger/90',
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variants;
    loading?: boolean;
    asChild?: boolean;
}

export function Button({
    variant = 'primary',
    loading = false,
    asChild = false,
    className,
    disabled,
    children,
    ...props
}: ButtonProps) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            className={`${base} ${variants[variant]} ${className ?? ''}`.trim()}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading ? (
                <span
                    className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                />
            ) : null}
            {asChild ? <Slottable>{children}</Slottable> : children}
        </Comp>
    );
}
