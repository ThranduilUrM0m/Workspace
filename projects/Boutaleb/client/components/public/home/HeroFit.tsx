'use client';

import { useEffect } from 'react';

// Layout the home hero needs from JS, all measured from the real DOM:
// 1. BESPOKE is sized to the exact width of "made with care" (two fonts, any locale).
// 2. Both words sit on the figure's collar, wherever object-fit:cover crops the image.
// 3. When the pitch would cover the figure (portrait screens), the image stage
//    stops above the pitch ([data-stack]); CSS guesses by aspect ratio until this runs.
// 4. BUILT reads bottom-up: the ink of its B lands exactly on the CTA's bottom edge.

// Source image geometry (public/images/hero/wall-*.{jpg,png}, 1920x1224).
const IMG_W = 1920;
const IMG_H = 1224;
const ANCHOR_Y = 0.522; // words' centre, as a fraction of the image height (collar line)
const FIG_HALF = 145; // figure's half-width in image px (bbox x 815-1100, centre ~960)

export function HeroFit() {
    useEffect(() => {
        const hero = document.getElementById('sec-hero');
        if (!hero) return;
        const q = <T extends HTMLElement>(s: string) => hero.querySelector<T>(s);
        const stage = q('.h-stage');
        const care = q('.h-care');
        const bespoke = q('.h-bespoke');
        const built = q('.h-built');
        const cta = q('.h-cta');
        const pitch = q('.h-pitch');
        const main = q('.hero-main');
        if (!stage || !care || !bespoke || !built || !cta || !pitch || !main) return;

        const fit = () => {
            // 3. stack decision, on the unstacked geometry (image over the whole hero)
            const H0 = hero.clientHeight;
            const W = hero.clientWidth;
            const s0 = Math.max(W / IMG_W, H0 / IMG_H);
            const figLeft = W / 2 - FIG_HALF * s0;
            const figRight = W / 2 + FIG_HALF * s0;
            const p = pitch.getBoundingClientRect();
            const h = hero.getBoundingClientRect();
            const rtl = getComputedStyle(hero).direction === 'rtl';
            const covers = rtl ? p.left - h.left < figRight + 16 : p.right - h.left > figLeft - 16;
            hero.toggleAttribute('data-stack', covers);
            hero.style.setProperty('--stack-room', `${h.bottom - p.top + 16}px`);

            // 1. width match. Bricolage has an optical-size axis, so its width is not
            //    linear in font-size: refine a few times (converges to < 1px).
            const target = care.getBoundingClientRect().width;
            let size = 100;
            for (let i = 0; i < 4; i++) {
                bespoke.style.fontSize = `${size}px`;
                size *= target / bespoke.getBoundingClientRect().width;
            }
            bespoke.style.fontSize = `${size}px`;

            // 2. vertical anchor inside the (possibly shortened) stage
            const sh = stage.clientHeight;
            const s = Math.max(W / IMG_W, sh / IMG_H);
            const dispH = IMG_H * s;
            const y = ANCHOR_Y * dispH - (dispH - sh); // image anchored to the bottom
            const half = care.getBoundingClientRect().height / 2;
            stage.style.setProperty('--anchor-y', `${Math.max(y, half)}px`);

            // 4. BUILT on the CTA baseline
            const cs = getComputedStyle(built);
            const ctx = document.createElement('canvas').getContext('2d');
            if (ctx) {
                ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
                const bearing = -ctx.measureText('B').actualBoundingBoxLeft;
                const gap = main.getBoundingClientRect().bottom - cta.getBoundingClientRect().bottom;
                built.style.bottom = `${gap - bearing}px`;
            }
            hero.setAttribute('data-fit', '');
        };

        let raf = 0;
        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(fit);
        };
        const ro = new ResizeObserver(schedule);
        ro.observe(hero);
        document.fonts.ready.then(schedule);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, []);

    return null;
}
