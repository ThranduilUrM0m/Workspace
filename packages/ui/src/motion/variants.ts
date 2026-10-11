import { type Variants, type Transition } from 'framer-motion';

/* Calm reveals, no particle/carousel effects. Revised 2026-10-10 against the
   locked wireframes (component map C14, C21, C22):
   - cardHover is GONE. Hover is a tone shift in CSS (theme.css, .18s);
     nothing moves under the pointer, so nothing needs a motion variant.
   - Every variant here is an entrance or exit. Wrap the app in
     <MotionConfig reducedMotion="user"> so reduced motion drops the
     movement and keeps the fade, as every wireframe soul does.
   Add a variant when a real screen needs it, not speculatively. */

/* Public site and dialogs. */
const standard = [0.22, 1, 0.36, 1] as const;
/* ERP entrances — the wireframes' cubic-bezier(.2,.7,.2,1). */
const settle = [0.2, 0.7, 0.2, 1] as const;

const transition = (duration: number): Transition => ({ duration, ease: standard });

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition(0.28) },
  exit: { opacity: 0, transition: transition(0.18) },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: transition(0.28) },
  exit: { opacity: 0, y: 10, transition: transition(0.18) },
};

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: standard } },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition(0.18) },
  exit: { opacity: 0, transition: transition(0.18) },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: transition(0.18) },
};

/* A dialog on a phone: slides up from the bottom (board b-sheet, .34s). */
export const sheetUp: Variants = {
  hidden: { y: '100%' },
  show: { y: 0, transition: { duration: 0.34, ease: settle } },
  exit: { y: '100%', transition: { duration: 0.22, ease: settle } },
};

/* ---- List entrance (shell.css "List entrance", B.listEnter) ----
   First render only — never on filter or fold. Rows rise down each group
   50ms apart from 150ms; the rail follows at .35s; feed lines 45ms apart
   from 450ms. Put listGroup on the group, listRow on each row. */
export const listGroup: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.15, staggerChildren: 0.05 } },
};

export const listRow: Variants = {
  hidden: { opacity: 0, y: '0.625rem' },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: settle } },
};

export const listRail: Variants = {
  hidden: { opacity: 0, y: '0.625rem' },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: settle, delay: 0.35 } },
};

export const listFeed: Variants = {
  hidden: {},
  show: { transition: { delayChildren: 0.45, staggerChildren: 0.045 } },
};

/* The group heading's short rule draws itself (origin left). */
export const ruleDraw: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.6, ease: settle, delay: 0.1 } },
};

/* Late / silent chips beat once, after everything has landed. */
export const beat: Variants = {
  hidden: { scale: 1 },
  show: { scale: [1, 1.06, 1], transition: { duration: 0.6, ease: 'easeInOut', delay: 1 } },
};

/* ---- Form soul (shell.css "Form soul", B.formSoul) ----
   First render: the card lifts, then heading, sections and preview rise in
   reading order 60ms apart from 80ms. */
export const formCard: Variants = {
  hidden: { opacity: 0, y: '1rem' },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: settle, delayChildren: 0.08, staggerChildren: 0.06 },
  },
};

export const formPart: Variants = {
  hidden: { opacity: 0, y: '0.625rem' },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: settle } },
};
