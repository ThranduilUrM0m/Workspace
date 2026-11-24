'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

// About r4 "The Inspector" (2026-11-24). Message: every detail is decided for a
// reason, and the visitor can check it. Over the section sits a designer's
// inspection layer whose marks are all TRUE, read from the live DOM: the 12
// column guides (the section's real grid), the heading's baseline, the body's
// real characters per line, and the chalk sketch in the photo. Each mark carries
// a REASON in plain client language, with the measured number as small proof.
// The visitor can switch the notes off and on (AboutGuidesToggle).
// The still is the end state; the scroll timeline only draws it in.

export type InspectorCopy = {
    grid: string; // why the heading sits on one grid
    measure: string; // why the text lines are short
    chars: string; // "characters per line" unit
    sketch: string; // what the chalk drawing proves
    hide: string;
    show: string;
};

// Chalk wireframe in the source photo (about-wall-test.jpg, 1536x1024), as shares.
const IMG_W = 1536;
const IMG_H = 1024;
const SKETCH = { x0: 0.166, x1: 0.55, y0: 0.234, y1: 0.773 };
const CHIP_ROOM = 240; // px needed after the heading's last line for its note

type Box = { x: number; y: number; w: number; h: number };
type Marks = {
    cols: Box;
    base: { x0: number; x1: number; y: number; size: number };
    measure: { x0: number; x1: number; y: number; chars: number };
    sketch: Box;
    rtl: boolean;
};

function measure(root: HTMLElement): Marks | null {
    const head = root.querySelector<HTMLElement>('.ab-head');
    const dot = root.querySelector<HTMLElement>('.ab-dot');
    const img = root.querySelector<HTMLElement>('.ab-img');
    const photo = root.querySelector<HTMLImageElement>('.ab-photo');
    const body = root.querySelector<HTMLElement>('.ab-body');
    if (!head || !img || !body || !photo) return null;
    const o = root.getBoundingClientRect();
    // the draw-in moves the heading; marks must sit where it SETTLES
    const tf = getComputedStyle(head).transform;
    const settle = -(tf && tf !== 'none' ? new DOMMatrix(tf).m42 : 0);
    const rtl = getComputedStyle(root).direction === 'rtl';
    const pad = parseFloat(getComputedStyle(root).paddingInlineStart) || 0;

    // last line of the heading: its ink extent and baseline (the dot's bottom IS the baseline)
    const range = document.createRange();
    range.selectNodeContents(head);
    if (dot) range.setEndBefore(dot);
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    const lastTop = Math.max(...rects.map((r) => r.top));
    const last = rects.filter((r) => Math.abs(r.top - lastTop) < 4);
    const lx0 = Math.min(...last.map((r) => r.left)) - o.left;
    const lx1 = Math.max(...last.map((r) => r.right)) - o.left;
    const size = parseFloat(getComputedStyle(head).fontSize);
    const dr = dot?.getBoundingClientRect();
    const baseY = (dr ? dr.bottom - o.top : Math.max(...last.map((r) => r.bottom)) - o.top - size * 0.2) + settle;

    // body: REAL characters per line = characters / rendered lines
    const br = body.getBoundingClientRect();
    const lh = parseFloat(getComputedStyle(body).lineHeight) || 24;
    const lines = Math.max(1, Math.round(br.height / lh));
    const chars = Math.round((body.textContent ?? '').trim().length / lines);

    // where the sketch lands after object-fit: cover + object-position
    const ir = img.getBoundingClientRect();
    const scale = Math.max(ir.width / IMG_W, ir.height / IMG_H);
    const dw = IMG_W * scale;
    const dh = IMG_H * scale;
    const [px, py] = getComputedStyle(photo).objectPosition.split(' ').map((v) => parseFloat(v) / 100);
    const ox = (ir.width - dw) * (px ?? 0.5);
    const oy = (ir.height - dh) * (py ?? 0.5);
    const sx0 = Math.max(0, ox + SKETCH.x0 * dw);
    const sx1 = Math.min(ir.width, ox + SKETCH.x1 * dw);
    const sy0 = Math.max(0, oy + SKETCH.y0 * dh);
    const sy1 = Math.min(ir.height, oy + SKETCH.y1 * dh);

    return {
        cols: { x: pad, y: 0, w: o.width - pad * 2, h: o.height },
        base: { x0: lx0, x1: lx1, y: baseY, size },
        measure: { x0: br.left - o.left, x1: br.right - o.left, y: br.top - o.top, chars },
        sketch: { x: ir.left - o.left + sx0, y: ir.top - o.top + sy0, w: sx1 - sx0, h: sy1 - sy0 },
        rtl,
    };
}

export function AboutInspector({ copy }: { copy: InspectorCopy }) {
    const layer = useRef<HTMLDivElement>(null);
    const [m, setM] = useState<Marks | null>(null);

    useEffect(() => {
        const root = layer.current?.parentElement;
        if (!root) return;
        let raf = 0;
        const run = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setM(measure(root)));
        };
        const ro = new ResizeObserver(run);
        ro.observe(root);
        document.fonts.ready.then(run);
        root.querySelector('img')?.addEventListener('load', run);
        return () => {
            ro.disconnect();
            cancelAnimationFrame(raf);
        };
    }, []);

    // draw-in timeline, scrubbed by scroll; reduced motion keeps the still
    useEffect(() => {
        const el = layer.current;
        const root = el?.parentElement;
        if (!el || !root || !m) return;
        gsap.registerPlugin(ScrollTrigger);
        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
            const q = gsap.utils.selector(el);
            const img = root.querySelector('.ab-img');
            const ir = img?.getBoundingClientRect();
            const rr = root.getBoundingClientRect();
            const sk = m.sketch;
            // the photo opens out of the sketch's box to the full frame
            const clip = ir
                ? `inset(${sk.y - (ir.top - rr.top)}px ${ir.right - rr.left - (sk.x + sk.w)}px ${ir.bottom - rr.top - (sk.y + sk.h)}px ${sk.x - (ir.left - rr.left)}px)`
                : 'inset(0)';
            const tl = gsap.timeline({
                defaults: { ease: 'power2.out' },
                scrollTrigger: { trigger: root, start: 'top 75%', end: 'center 45%', scrub: 0.6 },
            });
            tl.from(q('.ins-col'), { scaleY: 0, duration: 0.6, stagger: 0.03 }, 0)
                .from(root.querySelector('.ab-head'), { y: '0.25em', opacity: 0, duration: 0.5 }, 0.15)
                .from(q('.ins-base'), { scaleX: 0, duration: 0.5 }, 0.45)
                .to(q('.ins-sketch'), { opacity: 1, duration: 0.15 }, 0.4)
                .from(img ?? {}, { clipPath: clip, duration: 0.8, ease: 'power3.inOut' }, 0.5)
                .to(q('.ins-sketch'), { opacity: 0, duration: 0.25 }, 1.2)
                .from(q('.ins-meas'), { scaleX: 0, duration: 0.4 }, 0.8)
                .from(q('.ins-chip'), { opacity: 0, y: 6, duration: 0.3, stagger: 0.1 }, 0.9);
            const n = q<HTMLElement>('[data-count]');
            n.forEach((c) => {
                const v = { n: 0 };
                tl.to(v, { n: Number(c.dataset.count), duration: 0.5, onUpdate: () => (c.textContent = String(Math.round(v.n))) }, 0.9);
            });
            return () => tl.scrollTrigger?.kill();
        });
        return () => mm.revert();
    }, [m]);

    if (!m) return <div ref={layer} className="ins" aria-hidden="true" />;

    // heading note: after the line's end when there is room, else tucked under it
    const end = m.rtl ? m.base.x0 : m.base.x1;
    const room = m.rtl ? end - m.cols.x : m.cols.x + m.cols.w - end;
    const tuck = room < CHIP_ROOM;
    const gridChip = tuck
        ? { top: m.base.y + 10, [m.rtl ? 'right' : 'left']: m.rtl ? `calc(100% - ${m.base.x1}px)` : m.base.x0 }
        : { top: m.base.y, translate: '0 -50%', [m.rtl ? 'right' : 'left']: m.rtl ? `calc(100% - ${end - 24}px)` : end + 24 };
    const sketchChip = { top: m.sketch.y + 12, [m.rtl ? 'right' : 'left']: m.rtl ? `calc(100% - ${m.sketch.x + m.sketch.w - 12}px)` : m.sketch.x + 12 };
    // sits above the measure line (bottom-anchored: GSAP owns the transform)
    const measChip = { bottom: `calc(100% - ${m.measure.y - 22}px)`, [m.rtl ? 'right' : 'left']: m.rtl ? `calc(100% - ${m.measure.x1}px)` : m.measure.x0 };

    return (
        <div ref={layer} className="ins" aria-hidden="true">
            <div className="ins-cols" style={{ left: m.cols.x, width: m.cols.w }}>
                {Array.from({ length: 12 }, (_, i) => (
                    <span key={i} className="ins-col" />
                ))}
            </div>
            <div
                className="ins-base"
                style={{ left: m.base.x0 - 16, width: m.base.x1 - m.base.x0 + 32, top: m.base.y, transformOrigin: m.rtl ? 'right' : 'left' }}
            />
            <span className="ins-chip" style={gridChip}>
                {copy.grid}
                <bdi>
                    <span data-count={Math.round(m.base.size)}>{Math.round(m.base.size)}</span> px
                </bdi>
            </span>
            <div className="ins-meas" style={{ left: m.measure.x0, width: m.measure.x1 - m.measure.x0, top: m.measure.y - 14, transformOrigin: m.rtl ? 'right' : 'left' }} />
            <span className="ins-chip" style={measChip}>
                {copy.measure}
                <bdi>
                    <span data-count={m.measure.chars}>{m.measure.chars}</span> {copy.chars}
                </bdi>
            </span>
            <div className="ins-sketch" style={{ left: m.sketch.x, top: m.sketch.y, width: m.sketch.w, height: m.sketch.h }} />
            <span className="ins-chip" style={sketchChip}>
                {copy.sketch}
            </span>
        </div>
    );
}

/** The visitor's own switch for the designer's notes. */
export function AboutGuidesToggle({ copy }: { copy: InspectorCopy }) {
    const btn = useRef<HTMLButtonElement>(null);
    const [on, setOn] = useState(true);
    useEffect(() => {
        const sec = btn.current?.closest<HTMLElement>('.ab');
        if (sec) sec.dataset.guides = on ? 'on' : 'off';
    }, [on]);
    return (
        <button ref={btn} type="button" className="ab-guides" data-on={on} onClick={() => setOn((v) => !v)}>
            <span className="ab-guides-box" aria-hidden="true" />
            {on ? copy.hide : copy.show}
        </button>
    );
}
