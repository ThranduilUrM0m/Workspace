import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../lib/cn';
import { modalBackdrop, modalContent, sheetUp } from '../motion/variants';

/* One dialog, two locked chromes. Rebuilt 2026-10-10 (component map C14).

   feature — the 2026-08-12 modal-chrome rule: a clay bar across the top and
     the animated close (cross, with "Close" rising under it). Public
     portfolio detail, the board's item modals.
   tool    — the shared frame (shell.css .b-dlg, 2026-09-25): no bar, a plain
     cross that shifts tone. The image and block pickers.

   Both carry the later rules: header and footer are separated by INSET
   rules, never full-width borders; heights in dvh, never vh; every close is
   a 44px target, grown by an equal negative margin so the header does not
   move; the "Close" word sits at the .62 floor, never faded twice, and is
   shown on keyboard focus and always on a touch screen.

   phone (below 48rem) — sheet: slides up from the bottom (board);
   full: covers the screen (public portfolio); window: stays a centred
   window (pickers). Radix supplies the focus trap, Esc, aria-modal,
   scroll lock and focus return. */

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  /* Small uppercase line above the title (board item modals). */
  eyebrow?: React.ReactNode;
  /* One line under the title; becomes the dialog's description. */
  sub?: React.ReactNode;
  /* An action row — Save, Discard. Not a page footer. */
  footer?: React.ReactNode;
  chrome?: 'feature' | 'tool';
  phone?: 'sheet' | 'full' | 'window';
  /* Desktop width, a knob rather than a variant: '44rem', '60rem'. */
  width?: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
}

const RAIL = '(min-width: 48rem)';

function useRail() {
  return React.useSyncExternalStore(
    (cb) => {
      const m = matchMedia(RAIL);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => matchMedia(RAIL).matches,
    () => true,
  );
}

const PHONE = {
  sheet: 'items-end p-0 rail:items-center rail:p-8',
  full: 'items-stretch p-0 rail:items-center rail:p-8',
  window: 'items-center px-6 py-[3dvh]',
} as const;

const PANEL = {
  sheet: 'max-h-[94dvh] rail:max-h-[88dvh]',
  full: 'h-dvh max-h-none rail:h-auto rail:max-h-[calc(100dvh-4rem)]',
  window: 'max-h-[94dvh]',
} as const;

/* Inset rule: starts and ends at the content gutter, never the edge. */
const rule = "after:absolute after:inset-x-7 after:h-px after:bg-line after:content-['']";

export function Modal({
  open,
  onOpenChange,
  title,
  eyebrow,
  sub,
  footer,
  chrome = 'tool',
  phone = chrome === 'feature' ? 'sheet' : 'window',
  width = chrome === 'feature' ? '44rem' : '60rem',
  children,
  className,
  overlayClassName,
}: ModalProps) {
  const rail = useRail();
  const slides = !rail && phone !== 'window';
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className={cn('fixed inset-0 z-[60] flex justify-center bg-ink/45', PHONE[phone], overlayClassName)}
                variants={modalBackdrop}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <Dialog.Content
                  asChild
                  forceMount
                  {...(sub ? {} : { 'aria-describedby': undefined })}
                >
                  <motion.div
                    style={{ '--dlg-w': width } as React.CSSProperties}
                    className={cn(
                      'relative flex w-full flex-col rounded-none bg-card shadow-[0_1.5rem_3rem_rgb(27_27_31/.2)]',
                      'rail:w-[min(var(--dlg-w),100%)]',
                      phone === 'window' && 'w-[min(var(--dlg-w),100%)]',
                      chrome === 'feature' && 'border-t-[.4375rem] border-accent',
                      PANEL[phone],
                      className,
                    )}
                    variants={slides ? sheetUp : modalContent}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                  >
                    <header className={cn('relative flex items-start justify-between gap-4 px-7 pt-6 pb-[1.125rem] after:bottom-0', rule)}>
                      <div className="min-w-0">
                        {eyebrow && (
                          <span className="mb-1 block font-display text-[.5625rem] font-extrabold uppercase tracking-[.1em] text-ink-muted">
                            {eyebrow}
                          </span>
                        )}
                        <Dialog.Title className="m-0 font-display text-lg font-bold text-ink">{title}</Dialog.Title>
                        {sub && (
                          <Dialog.Description className="mt-[.4375rem] max-w-[62ch] text-[.8125rem] leading-[1.55] text-ink-muted">
                            {sub}
                          </Dialog.Description>
                        )}
                      </div>
                      <Dialog.Close asChild>
                        {chrome === 'feature' ? <CloseControl /> : <CloseCross />}
                      </Dialog.Close>
                    </header>
                    <div className={cn('min-h-0 flex-1 overflow-y-auto overscroll-contain px-7', chrome === 'feature' && 'py-5')}>{children}</div>
                    {footer && (
                      <footer className={cn('relative flex items-center justify-end gap-2 px-7 pt-[.875rem] pb-5 after:top-0', rule)}>
                        {footer}
                      </footer>
                    )}
                  </motion.div>
                </Dialog.Content>
              </motion.div>
            </Dialog.Overlay>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

/* The locked animated close (portfolio-detail-modal, board .b-close). The
   word's space is reserved at rest, so the reveal never shifts the header.
   On a real pointer the word rises on hover and on keyboard focus; on touch
   there is no hover to reveal it, so it is always shown. */
const CloseControl = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CloseControl({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Close"
        className={cn(
          'group -my-[7px] flex min-h-hit min-w-hit shrink-0 flex-col items-center justify-center bg-transparent p-0 text-ink',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className="block text-[1.0625rem] leading-none transition-transform duration-[220ms] ease-close pointer-fine:group-hover:-translate-y-[.1875rem] pointer-fine:group-focus-visible:-translate-y-[.1875rem]"
        >
          &#10005;
        </span>
        <span
          aria-hidden="true"
          className="mt-[.1875rem] font-body text-[.5625rem] leading-none tracking-[.03em] text-label-float transition-[opacity,transform] duration-[220ms] ease-close pointer-fine:-translate-y-1 pointer-fine:opacity-0 pointer-fine:group-hover:translate-y-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-visible:translate-y-0 pointer-fine:group-focus-visible:opacity-100"
        >
          Close
        </span>
      </button>
    );
  },
);

/* The frame's cross (.b-dlg-x): drawn 32px, a tone shift on hover, a 44px
   target through an equal negative margin. */
const CloseCross = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function CloseCross({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label="Close"
        className={cn(
          '-m-[6px] flex size-hit shrink-0 items-center justify-center bg-transparent p-[6px] text-ink-muted transition-colors',
          '[&>span]:flex [&>span]:size-8 [&>span]:items-center [&>span]:justify-center [&>span]:transition-colors',
          'hover:text-ink hover:[&>span]:bg-ink/6',
          className,
        )}
        {...props}
      >
        <span aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M2 2l10 10M12 2 2 12" />
          </svg>
        </span>
      </button>
    );
  },
);
