import { type Variants, type Transition } from 'framer-motion';

type Direction = 'up' | 'down' | 'left' | 'right';

export const motionDefaults = {
    duration: { micro: 0.12, fast: 0.18, base: 0.28, slow: 0.45, hero: 0.6 },
    ease: {
        standard: [0.22, 1, 0.36, 1] as const,
        decelerate: [0.16, 1, 0.3, 1] as const,
        accelerate: [0.4, 0, 1, 1] as const,
    },
    spring: { type: 'spring', stiffness: 260, damping: 24, mass: 0.8 } as const,
};

const makeTransition = (duration = motionDefaults.duration.base): Transition => ({
    duration,
    ease: motionDefaults.ease.standard,
});

export const fade: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: makeTransition() },
    exit: { opacity: 0, transition: makeTransition(motionDefaults.duration.fast) },
};

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: makeTransition() },
    exit: { opacity: 0, y: 10, transition: makeTransition(motionDefaults.duration.fast) },
};

export const fadeInDown: Variants = {
    hidden: { opacity: 0, y: -20 },
    show: { opacity: 1, y: 0, transition: makeTransition() },
    exit: { opacity: 0, y: -10, transition: makeTransition(motionDefaults.duration.fast) },
};

export const fadeInLeft: Variants = {
    hidden: { opacity: 0, x: -24 },
    show: { opacity: 1, x: 0, transition: makeTransition() },
    exit: { opacity: 0, x: -12, transition: makeTransition(motionDefaults.duration.fast) },
};

export const fadeInRight: Variants = {
    hidden: { opacity: 0, x: 24 },
    show: { opacity: 1, x: 0, transition: makeTransition() },
    exit: { opacity: 0, x: 12, transition: makeTransition(motionDefaults.duration.fast) },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.96 },
    show: { opacity: 1, scale: 1, transition: makeTransition() },
    exit: { opacity: 0, scale: 0.98, transition: makeTransition(motionDefaults.duration.fast) },
};

export const popIn: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: motionDefaults.spring },
    exit: { opacity: 0, scale: 0.95, transition: makeTransition(motionDefaults.duration.fast) },
};

export const blurIn: Variants = {
    hidden: { opacity: 0, filter: 'blur(8px)' },
    show: { opacity: 1, filter: 'blur(0px)', transition: makeTransition() },
    exit: {
        opacity: 0,
        filter: 'blur(6px)',
        transition: makeTransition(motionDefaults.duration.fast),
    },
};

export const zoomOutIn: Variants = {
    hidden: { opacity: 0, scale: 1.04 },
    show: { opacity: 1, scale: 1, transition: makeTransition(0.34) },
    exit: { opacity: 0, scale: 0.98, transition: makeTransition(motionDefaults.duration.fast) },
};

export const heroContent: Variants = {
    hidden: { opacity: 0, y: 28 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: motionDefaults.duration.hero,
            ease: motionDefaults.ease.decelerate,
            when: 'beforeChildren',
            staggerChildren: 0.08,
            delayChildren: 0.06,
        },
    },
    exit: { opacity: 0, y: 16, transition: makeTransition(motionDefaults.duration.fast) },
};

export const heroVisual: Variants = {
    hidden: { opacity: 0, x: 28, scale: 0.96, rotate: 1.5 },
    show: {
        opacity: 1,
        x: 0,
        scale: 1,
        rotate: 0,
        transition: { ...motionDefaults.spring, stiffness: 210, damping: 26, mass: 0.9 },
    },
    exit: {
        opacity: 0,
        x: 12,
        scale: 0.98,
        transition: makeTransition(motionDefaults.duration.fast),
    },
};

export const sectionReveal: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: motionDefaults.duration.slow,
            ease: motionDefaults.ease.decelerate,
            when: 'beforeChildren',
        },
    },
    exit: { opacity: 0, y: 10, transition: makeTransition(motionDefaults.duration.fast) },
};

export const imageReveal: Variants = {
    hidden: { opacity: 0, scale: 1.04, clipPath: 'inset(0 0 100% 0 round 28px)' },
    show: {
        opacity: 1,
        scale: 1,
        clipPath: 'inset(0% 0% 0% 0% round 28px)',
        transition: { duration: 0.7, ease: motionDefaults.ease.decelerate },
    },
    exit: { opacity: 0, scale: 0.98, transition: makeTransition(motionDefaults.duration.fast) },
};

export const maskRevealUp: Variants = {
    hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
    show: {
        opacity: 1,
        clipPath: 'inset(0% 0 0 0)',
        transition: { duration: 0.55, ease: motionDefaults.ease.decelerate },
    },
    exit: {
        opacity: 0,
        clipPath: 'inset(0 0 100% 0)',
        transition: makeTransition(motionDefaults.duration.fast),
    },
};

export const liftHover: Variants = {
    initial: { y: 0, scale: 1 },
    hover: { y: -6, scale: 1.01, transition: makeTransition(motionDefaults.duration.fast) },
    tap: { scale: 0.99, transition: makeTransition(0.1) },
};

export const glowHover: Variants = {
    initial: { boxShadow: '0 0 0 rgba(0,0,0,0)' },
    hover: {
        boxShadow: '0 14px 34px rgba(14,16,22,0.16)',
        transition: makeTransition(motionDefaults.duration.fast),
    },
};

export const softPress: Variants = {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.01, y: -1, transition: makeTransition(motionDefaults.duration.fast) },
    tap: { scale: 0.985, y: 0, transition: makeTransition(motionDefaults.duration.micro) },
};

export const cardHover: Variants = {
    initial: { y: 0, scale: 1, boxShadow: '0 10px 30px rgba(14,16,22,0.08)' },
    hover: {
        y: -10,
        scale: 1.01,
        boxShadow: '0 22px 46px rgba(14,16,22,0.14)',
        transition: makeTransition(motionDefaults.duration.fast),
    },
    tap: { scale: 0.995, transition: makeTransition(motionDefaults.duration.micro) },
};

export const underlineGrow: Variants = {
    initial: { scaleX: 0, originX: 0 },
    hover: { scaleX: 1, transition: makeTransition(0.2) },
};

export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0.04): Variants => ({
    hidden: {},
    show: { transition: { staggerChildren, delayChildren } },
    exit: { transition: { staggerChildren: 0.04, staggerDirection: -1 } },
});

export const staggerFast = staggerContainer(0.04, 0.02);
export const staggerSlow = staggerContainer(0.12, 0.08);

export const gridFade: Variants = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: {
            duration: motionDefaults.duration.slow,
            ease: motionDefaults.ease.decelerate,
            when: 'beforeChildren',
            staggerChildren: 0.08,
            delayChildren: 0.06,
        },
    },
    exit: { opacity: 0, y: 10, transition: makeTransition(motionDefaults.duration.fast) },
};

export const gridItem: Variants = {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: makeTransition(0.24) },
    exit: { opacity: 0, y: 8, scale: 0.99, transition: makeTransition(0.14) },
};

export const headlineCascade = (staggerChildren = 0.06): Variants => ({
    hidden: {},
    show: { transition: { staggerChildren, delayChildren: 0.02, when: 'beforeChildren' } },
    exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
});

export const listItem: Variants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: makeTransition(motionDefaults.duration.fast) },
    exit: { opacity: 0, y: 6, transition: makeTransition(0.12) },
};

export const statReveal: Variants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: makeTransition(0.24) },
    exit: { opacity: 0, y: 6, transition: makeTransition(0.12) },
};

export const pageEnter: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: makeTransition(motionDefaults.duration.slow) },
    exit: { opacity: 0, y: 8, transition: makeTransition(motionDefaults.duration.fast) },
};

export const pageCascade: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.04, when: 'beforeChildren' } },
    exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};

export const modalBackdrop: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: makeTransition(motionDefaults.duration.fast) },
    exit: { opacity: 0, transition: makeTransition(motionDefaults.duration.fast) },
};

export const modalContent: Variants = {
    hidden: { opacity: 0, y: 12, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: motionDefaults.spring },
    exit: {
        opacity: 0,
        y: 8,
        scale: 0.98,
        transition: makeTransition(motionDefaults.duration.fast),
    },
};

export const overlayReveal: Variants = {
    hidden: { opacity: 0, clipPath: 'circle(0% at 95% 5%)' },
    show: {
        opacity: 1,
        clipPath: 'circle(150% at 95% 5%)',
        transition: { duration: 0.45, ease: motionDefaults.ease.decelerate },
    },
    exit: {
        opacity: 0,
        clipPath: 'circle(0% at 95% 5%)',
        transition: { duration: 0.3, ease: motionDefaults.ease.accelerate },
    },
};

export const drawerLeft: Variants = {
    hidden: { x: '-100%' },
    show: { x: 0, transition: motionDefaults.spring },
    exit: { x: '-100%', transition: makeTransition(motionDefaults.duration.fast) },
};

export const drawerRight: Variants = {
    hidden: { x: '100%' },
    show: { x: 0, transition: motionDefaults.spring },
    exit: { x: '100%', transition: makeTransition(motionDefaults.duration.fast) },
};

export const accordionSection: Variants = {
    collapsed: { height: 0, opacity: 0, transition: makeTransition(motionDefaults.duration.fast) },
    open: { height: 'auto', opacity: 1, transition: makeTransition(motionDefaults.duration.base) },
};

export const toastIn: Variants = {
    hidden: { opacity: 0, y: 10, x: 10 },
    show: { opacity: 1, y: 0, x: 0, transition: motionDefaults.spring },
    exit: { opacity: 0, y: 8, x: 8, transition: makeTransition(motionDefaults.duration.fast) },
};

export const tooltipIn: Variants = {
    hidden: { opacity: 0, y: 4, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: makeTransition(0.16) },
    exit: { opacity: 0, y: 3, scale: 0.98, transition: makeTransition(0.12) },
};

export const skeletonPulse = {
    animate: {
        opacity: [0.5, 1, 0.5],
        transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
    },
};

export const shimmer = {
    initial: { backgroundPosition: '200% 0%' },
    animate: {
        backgroundPosition: '-200% 0%',
        transition: { duration: 1.5, repeat: Infinity, ease: 'linear' },
    },
};

export const numberTick = {
    initial: { y: 8, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: makeTransition(0.22) },
};

export const progressGrow = {
    initial: { scaleX: 0, transformOrigin: 'left center' },
    animate: { scaleX: 1, transition: makeTransition(0.4) },
};

export const rotateIn: Variants = {
    hidden: { opacity: 0, rotate: -6, scale: 0.96 },
    show: { opacity: 1, rotate: 0, scale: 1, transition: motionDefaults.spring },
    exit: { opacity: 0, rotate: 4, scale: 0.97, transition: makeTransition(0.18) },
};

export const flipY: Variants = {
    hidden: { opacity: 0, rotateY: -90 },
    show: { opacity: 1, rotateY: 0, transition: makeTransition(0.35) },
    exit: { opacity: 0, rotateY: 90, transition: makeTransition(0.2) },
};

export const parallaxY = (distance = 20) => ({
    initial: { y: distance },
    animate: { y: -distance },
    transition: {
        repeat: Infinity,
        repeatType: 'reverse' as const,
        duration: 4,
        ease: 'easeInOut',
    },
});

export const attentionShake = {
    animate: {
        x: [0, -4, 4, -3, 3, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
    },
};

export const bounceIn: Variants = {
    hidden: { scale: 0.85, opacity: 0 },
    show: {
        scale: [0.85, 1.05, 0.98, 1],
        opacity: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
    exit: { scale: 0.95, opacity: 0, transition: makeTransition(0.18) },
};

export const splitReveal = (direction: Direction = 'up'): Variants => {
    const axis = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const amount =
        direction === 'up' ? 20 : direction === 'down' ? -20 : direction === 'left' ? 20 : -20;
    return {
        hidden: { opacity: 0, [axis]: amount } as any,
        show: { opacity: 1, [axis]: 0, transition: makeTransition() } as any,
        exit: { opacity: 0, [axis]: amount / 2, transition: makeTransition(0.16) } as any,
    };
};

export const chipSelect: Variants = {
    inactive: { scale: 1, opacity: 0.9 },
    active: { scale: 1.04, opacity: 1, transition: motionDefaults.spring },
    tap: { scale: 0.98, transition: makeTransition(0.1) },
};
