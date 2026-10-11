import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

/* Rebuilt 2026-10-10 from the locked wireframes (shell.css .btn-solid,
   .b-form-cancel, .b-list-act; component map row C2).
   - Hover is a TONE SHIFT over .18s, never movement. Solid goes to
     accent-ink, not accent: white text on raw clay fails 4.5:1.
   - Heavy labels route to the display face: Questrial has one weight.
   - Every variant is a 44px target on a phone. Solid and quiet return to
     their drawn size from the rail breakpoint, as the forms do; the row
     action from the one-line-row breakpoint. */
const button = cva(
  'inline-flex items-center justify-center gap-[.4375rem] rounded-none whitespace-nowrap no-underline cursor-pointer transition-colors disabled:cursor-not-allowed [&_svg]:size-[.875rem] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        /* .btn-solid — the one filled button. */
        solid:
          'bg-dark-fill text-bg font-display font-semibold text-[.8125rem] px-[.9375rem] py-[.5625rem] min-h-hit rail:min-h-0 hover:bg-accent-ink disabled:opacity-40',
        /* .b-form-cancel — words, not a box. */
        quiet:
          'bg-transparent p-0 text-ink-muted font-display text-[.8125rem] min-h-hit rail:min-h-0 hover:text-ink',
        /* .b-list-act — the row's action. Outlined at rest, filled on hover. */
        row:
          'w-full border border-field-line bg-transparent text-ink font-display font-semibold text-xs px-[.875rem] py-[.375rem] min-h-hit row:min-h-0 row:px-[.625rem] hover:bg-dark-fill hover:border-dark-fill hover:text-bg active:translate-y-px active:scale-[.97] motion-reduce:active:transform-none',
        /* The stalled row's action: the one filled button in a list. */
        chase:
          'w-full bg-dark-fill text-bg font-display font-semibold text-xs px-[.875rem] py-[.375rem] min-h-hit row:min-h-0 row:px-[.625rem] hover:bg-accent-ink',
        link:
          /* .8125rem, the size of the quiet and solid labels. Hover is a placeholder until hi-fi. */
          'p-0 text-[.8125rem] text-ink underline underline-offset-[.2em] decoration-1 hover:decoration-accent',
        /* Public forms (contact.html .lbtn.go, thanks.html .ff-go): the
           send / continue action, words and an arrow, no box. Sending
           fades it and drops the underline. */
        go:
          'p-0 bg-transparent min-h-hit font-display font-semibold text-[.9375rem] text-ink underline underline-offset-[.25rem] aria-busy:opacity-50 aria-busy:no-underline aria-busy:cursor-default [&_svg]:transition-[translate] hover:[&_svg]:translate-x-[.125rem] hover:[&_svg]:-translate-y-[.125rem] rtl:[&_svg]:-scale-x-100',
        /* Public forms (.lbtn.muted): Back, "+ Add more detail". */
        back:
          'p-0 bg-transparent min-h-hit font-body text-[.875rem] text-ink-muted-solid underline underline-offset-[.25rem] hover:text-ink',
      },
    },
    defaultVariants: { variant: 'solid' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  /* Render as the child element (a Next <Link>), keeping the styling. */
  asChild?: boolean;
  /* Saving: disabled, says so, so a second press cannot send twice. */
  loading?: boolean;
  loadingLabel?: string;
}

export function Button({
  variant,
  asChild = false,
  loading = false,
  loadingLabel = 'Saving…',
  className,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(button({ variant }), className)}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      type={asChild ? undefined : (type ?? 'button')}
      {...props}
    >
      {loading ? loadingLabel : children}
    </Comp>
  );
}

export { button as buttonVariants };
