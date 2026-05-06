import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';

const base =
    'group relative inline-flex min-h-[50px] items-center justify-center gap-2 overflow-hidden rounded-full border px-5 py-3.5 text-sm font-semibold tracking-[-0.01em] transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-60';

const variants = {
    primary:
        'border-primary bg-primary text-surface shadow-hero hover:-translate-y-0.5 hover:bg-primary/[0.96] hover:shadow-[0_28px_64px_rgba(14,16,22,0.26)]',
    secondary:
        'border-border/80 bg-white/[0.72] text-primary backdrop-blur-xl shadow-[0_16px_38px_rgba(14,16,22,0.08)] hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.88]',
    ghost: 'border-transparent bg-transparent text-primary hover:bg-primary/[0.045]',
    danger: 'border-danger/70 bg-danger text-white shadow-[0_18px_40px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 hover:bg-danger/[0.92]',
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
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_42%,rgba(255,255,255,0.08))] opacity-0 transition duration-200 group-hover:opacity-100"
            />
            <span
                aria-hidden
                className="pointer-events-none absolute inset-[1px] rounded-full border border-white/10 opacity-70"
            />
            {loading ? (
                <span
                    className="relative z-[1] mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                />
            ) : null}
            {asChild ? (
                <Slottable>{children}</Slottable>
            ) : (
                <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
            )}
        </Comp>
    );
}
