import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

/* Two patterns, both square. Rebuilt 2026-10-10 from the locked wireframes.
   - default: a white card with a 1px ink ring (board .b-card, ERP panels).
   - blog: the public blog card (public/blog.html .post) — a white mat of
     .625rem around the picture and text. It replaces the old 5vh border
     (vh is banned, and Tailwind would generate any class named here), and
     the locked card is padding on a white ground, not a border.
     Hover, on a real pointer only, turns the ring clay. Nothing lifts:
     hover is a tone shift, never movement. */
const card = cva('rounded-none bg-card shadow-[0_0_0_1px_var(--color-line)]', {
  variants: {
    variant: {
      default: '',
      blog: 'grid grid-rows-[auto_auto_1fr] p-[.625rem] transition-shadow pointer-fine:hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-accent)_45%,transparent)]',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof card> {}

export function Card({ variant, className, ...props }: CardProps) {
  return <div className={cn(card({ variant }), className)} {...props} />;
}
