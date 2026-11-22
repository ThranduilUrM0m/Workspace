'use client';

import { useEffect } from 'react';

// Layout the home hero needs from JS, all measured from the real DOM:
// 1. BESPOKE is sized to the exact width of "made with care" (two fonts, any locale).
// 2. Both words sit across the chest, just under the taped patch (stacked: fixed share of the photo).
// 3. When the pitch would cover the figure (portrait screens), the image stage
//    stops above the pitch ([data-stack]); CSS guesses by aspect ratio until this runs.
// 4. BUILT reads bottom-up: the ink of its B lands exactly on the CTA's bottom edge.
// 5. From 100rem wide, BUILT grows to the hero's full height (the script grows in CSS).

// Source image geometry (public/images/hero/wall-*.{jpg,png}, 1920x1224).
const IMG_W = 1920;
const IMG_H = 1224;
const FIG_HALF = 145; // figure's half-width in image px (bbox x 815-1100, centre ~960)
const BUILT_INK = 0.9; // share of BUILT's line box its letters actually cover
const PITCH_GAP = 16; // big screens: pitch hugs the BUILT ghost
const STACK_Y = 0.64; // stacked layout: words' centre as a fraction of the visible photo
const PATCH_BOTTOM = 600; // lowest row of the taped patch in image px (measured, rows 496-600)
const WORDS_GAP = 12; // px between the patch and the top of the white word
const WORDS_MAX_Y = 0.78; // side-by-side safety: words' centre never below this share of the hero

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
            const h = hero.getBoundingClientRect();
            const rtl = getComputedStyle(hero).direction === 'rtl';
            const big = matchMedia('(min-width: 100rem)').matches;

            // 5. Big screens: BUILT runs the full height, from the CTA bottom up to a
            //    small top margin, and the pitch sits right against it.
            built.style.fontSize = '';
            pitch.style.insetInlineStart = '';
            if (big) {
                const top = main.getBoundingClientRect().top + 24;
                const length = cta.getBoundingClientRect().bottom - top;
                let size = 100;
                for (let i = 0; i < 4; i++) {
                    built.style.fontSize = `${size}px`;
                    size *= length / built.getBoundingClientRect().height;
                }
                built.style.fontSize = `${size}px`;
                // The line box (.85em) is wider than the letters: the ink fills
                // BUILT_INK of it from the box's left edge (rotate:180deg puts it there
                // in both directions; measured on Bricolage 700, bowls included).
                const b = built.getBoundingClientRect();
                const edge = rtl ? h.right - b.left : b.left + b.width * BUILT_INK - h.left;
                pitch.style.insetInlineStart = `${edge + PITCH_GAP}px`;
            }

            // 3. stack decision, on the unstacked geometry (image over the whole hero)
            const H0 = hero.clientHeight;
            const W = hero.clientWidth;
            const s0 = Math.max(W / IMG_W, H0 / IMG_H);
            const figLeft = W / 2 - FIG_HALF * s0;
            const figRight = W / 2 + FIG_HALF * s0;
            const p = pitch.getBoundingClientRect();
            const covers = rtl ? p.left - h.left < figRight + 16 : p.right - h.left > figLeft - 16;
            hero.toggleAttribute('data-stack', covers);
            hero.style.setProperty('--stack-room', `${h.bottom - p.top + 16}px`);

            // 1. width match. Bricolage has an optical-size axis, so its width is not
            //    linear in font-size: refine a few times (converges to < 1px).
            const target = care.getBoundingClientRect().width;
            // Hidden or not laid out yet: dividing by a 0 width would pin BESPOKE at 0px.
            if (target <= 0) return;
            let size = 100;
            for (let i = 0; i < 4; i++) {
                bespoke.style.fontSize = `${size}px`;
                size *= target / bespoke.getBoundingClientRect().width;
            }
            bespoke.style.fontSize = `${size}px`;

            // 2. words across the chest, clear of the patch and its later animation.
            //    Stacked (phones): a fraction of the visible photo (approved, unchanged).
            //    Side by side: anchored to the figure itself, so short laptops and tall
            //    monitors both put the words' top edge just under the patch.
            const st = stage.getBoundingClientRect();
            const m = main.getBoundingClientRect();
            const bottom = Math.min(st.bottom, m.bottom);
            let y = m.top + (bottom - m.top) * STACK_Y - st.top;
            if (!covers) {
                // image is cover-fitted and bottom-aligned (object-position 50% 100%)
                const s = Math.max(st.width / IMG_W, st.height / IMG_H);
                const patchBottom = st.height - (IMG_H - PATCH_BOTTOM) * s;
                const half = bespoke.getBoundingClientRect().height / 2;
                const floor = m.top - st.top + (bottom - m.top) * WORDS_MAX_Y;
                y = Math.min(patchBottom + WORDS_GAP + half, floor);
            }
            stage.style.setProperty('--anchor-y', `${y}px`);

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
        let alive = true;
        const schedule = () => {
            if (!alive) return; // fonts.ready can settle after unmount (locale switch)
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(fit);
        };
        const ro = new ResizeObserver(schedule);
        ro.observe(hero);
        document.fonts.ready.then(schedule);
        return () => {
            alive = false;
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, []);

    return null;
}
