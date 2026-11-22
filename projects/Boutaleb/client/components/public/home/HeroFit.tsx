'use client';

import { useEffect } from 'react';

// Layout the home hero needs from JS, all measured from the real DOM:
// 1. BESPOKE is sized to the exact width of "made with care" (two fonts); in Arabic it
//    is 70% of the hero width instead (Reem Kufi, locked 2026-11-22).
// 2. Both words are centred in the first screen, page top (header included) to the
//    hero's bottom edge (developer, 2026-11-22; replaces the under-the-patch anchor).
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
const AR_WORD_SHARE = 0.7; // Arabic white word: share of the hero width
const PATCH_BOTTOM = 600; // lowest row of the taped patch in image px (measured, rows 496-600)
const WORDS_GAP = 12; // px kept between the patch and the top of the words
const ZOOM_MAX = 1.35; // photo zoom cap when lifting the patch clear of the words

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
            const target = rtl ? W * AR_WORD_SHARE : care.getBoundingClientRect().width;
            // Hidden or not laid out yet: dividing by a 0 width would pin BESPOKE at 0px.
            if (target <= 0) return;
            let size = 100;
            for (let i = 0; i < 4; i++) {
                bespoke.style.fontSize = `${size}px`;
                size *= target / bespoke.getBoundingClientRect().width;
            }
            bespoke.style.fontSize = `${size}px`;

            // 2. words centred between the page top (above the header) and the hero's
            //    bottom edge, in viewport coordinates so a scrolled page measures the same.
            //    The stage shrinks when stacked, so the result is relative to its top.
            const st = stage.getBoundingClientRect();
            const y = (h.bottom - window.scrollY) / 2 - st.top;
            stage.style.setProperty('--anchor-y', `${y}px`);

            //    The words no longer follow the figure, so the photo follows the words:
            //    when the taped patch would reach down into them, zoom the photo from
            //    its bottom edge (feet stay put, the patch rises, only wall is cropped).
            let zoom = 1;
            if (!covers) {
                const s = Math.max(st.width / IMG_W, st.height / IMG_H);
                const half = Math.max(care.getBoundingClientRect().height, bespoke.getBoundingClientRect().height) / 2;
                const wordsTop = y - half;
                const need = (st.height - wordsTop + WORDS_GAP) / (IMG_H - PATCH_BOTTOM);
                if (need > s) zoom = Math.min(need / s, ZOOM_MAX);
            }
            stage.style.setProperty('--img-zoom', `${zoom}`);

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
