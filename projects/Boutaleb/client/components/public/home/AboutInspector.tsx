'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';

// About r3 "The Inspector" (2026-11-23): the section is shown under a
// designer's inspection layer, and every mark is TRUE, read from the live DOM:
// column guides, the heading's real baseline and size, the body's measure in
// ch, the chalk sketch's box in the photo. Under the photo, a proof strip reads
// the visitor's own page load (LCP, CLS) and links the mirrored-language page.
// The still is the end state; the scroll timeline only draws it in.
// Annotations are capped at 4 on desktop (baseline, dot, measure, sketch).

export type InspectorCopy = { dot: string; sketch: string; lcp: string; cls: string; mirror: string; mirrorMark: string };

// Chalk wireframe in the source photo (about-wall-test.jpg, 1536x1024), as shares.
const IMG_W = 1536;
const IMG_H = 1024;
const SKETCH = { x0: 0.166, x1: 0.55, y0: 0.234, y1: 0.773 };
const LCP_HONEST = 2.5; // above this the load readout is hidden, never faked
const CLS_HONEST = 0.1;

type Box = { x: number; y: number; w: number; h: number };
type Marks = {
    cols: Box;
    base: { x0: number; x1: number; y: number; size: number };
    dot: { x: number; y: number };
    measure: { x0: number; x1: number; y: number; ch: number };
    sketch: Box;
    rtl: boolean;
};

const rel = (r: DOMRect, o: DOMRect): Box => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });

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
    const ty = tf && tf !== 'none' ? new DOMMatrix(tf).m42 : 0;
    const rtl = getComputedStyle(root).direction === 'rtl';
    const pad = parseFloat(getComputedStyle(root).paddingInlineStart) || 0;

    // last line of the heading: its ink extent and baseline (the dot's bottom IS the baseline)
    const range = document.createRange();
    range.selectNodeContents(head);
    if (dot) range.setEndBefore(dot); // the text's own ink, not the square
    const rects = [...range.getClientRects()].filter((r) => r.width > 0);
    const lastTop = Math.max(...rects.map((r) => r.top));
    const settle = -ty;
    const last = rects.filter((r) => Math.abs(r.top - lastTop) < 4);
    const lx0 = Math.min(...last.map((r) => r.left)) - o.left;
    const lx1 = Math.max(...last.map((r) => r.right)) - o.left;
    const size = parseFloat(getComputedStyle(head).fontSize);
    const dr = dot?.getBoundingClientRect();
    const baseY = (dr ? dr.bottom - o.top : Math.max(...last.map((r) => r.bottom)) - o.top - size * 0.2) + settle;

    // body measure in ch of the body font
    const probe = document.createElement('span');
    probe.textContent = '0';
    probe.style.cssText = 'position:absolute;visibility:hidden;font:inherit';
    body.appendChild(probe);
    const chW = probe.getBoundingClientRect().width || 8;
    probe.remove();
    const br = body.getBoundingClientRect();

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
        dot: dr ? { x: dr.left - o.left + dr.width / 2, y: dr.top - o.top + settle } : { x: rtl ? lx0 : lx1, y: baseY },
        measure: { x0: br.left - o.left, x1: br.right - o.left, y: br.top - o.top, ch: Math.round(br.width / chW) },
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
            const sk = m.sketch;
            const rr = root.getBoundingClientRect();
            // clip from the sketch box out to the full frame
            const clip = ir
                ? `inset(${sk.y - (ir.top - rr.top)}px ${ir.right - rr.left - (sk.x + sk.w)}px ${ir.bottom - rr.top - (sk.y + sk.h)}px ${sk.x - (ir.left - rr.left)}px)`
                : 'inset(0)';
            const counters = q<HTMLElement>('[data-count]');
            const tl = gsap.timeline({
                defaults: { ease: 'power2.out' },
                scrollTrigger: { trigger: root, start: 'top 75%', end: 'center 45%', scrub: 0.6 },
            });
            tl.from(q('.ins-col'), { scaleY: 0, duration: 0.6, stagger: 0.03 }, 0)
                .from(root.querySelector('.ab-head'), { y: '0.25em', opacity: 0, duration: 0.5 }, 0.15)
                .from(q('.ins-base'), { scaleX: 0, duration: 0.5 }, 0.45)
                .from(img ?? {}, { clipPath: clip, duration: 0.8, ease: 'power3.inOut' }, 0.5)
                .from(q('.ins-sketch'), { opacity: 0, scale: 1.04, duration: 0.3 }, 0.45)
                .from(q('.ins-lead, .ins-meas'), { scaleY: 0, scaleX: 0, duration: 0.4, stagger: 0.1 }, 0.8)
                .from(q('.ins-chip'), { opacity: 0, y: 6, duration: 0.3, stagger: 0.08 }, 0.9);
            counters.forEach((c) => {
                const end = Number(c.dataset.count);
                const v = { n: 0 };
                tl.to(v, { n: end, duration: 0.5, onUpdate: () => (c.textContent = String(Math.round(v.n))) }, 0.9);
            });
            return () => tl.scrollTrigger?.kill();
        });
        return () => mm.revert();
    }, [m]);

    const end = m ? (m.rtl ? m.base.x0 : m.base.x1) : 0;
    // no room after the line's end (last word reaches the margin): the chip tucks under the line
    const tuck = m ? (m.rtl ? end - m.cols.x : m.cols.x + m.cols.w - end) < 120 : false;
    const chipX = tuck ? end : end + (m?.rtl ? -24 : 24);
    return (
        <div ref={layer} className="ins" aria-hidden="true">
            {m && (
                <>
                    <div className="ins-cols" style={{ left: m.cols.x, width: m.cols.w }}>
                        {Array.from({ length: 12 }, (_, i) => (
                            <span key={i} className="ins-col" />
                        ))}
                    </div>
                    <div
                        className="ins-base"
                        style={{ left: m.base.x0 - 16, width: m.base.x1 - m.base.x0 + 32, top: m.base.y, transformOrigin: m.rtl ? 'right' : 'left' }}
                    />
                    <span
                        className="ins-chip"
                        style={{
                            top: tuck ? m.base.y + 10 : m.base.y,
                            left: m.rtl === tuck ? chipX : undefined,
                            right: m.rtl === tuck ? undefined : `calc(100% - ${chipX}px)`,
                            translate: tuck ? '0 0' : '0 -50%',
                        }}
                    >
                        <bdi>
                            <b data-count={Math.round(m.base.size)}>{Math.round(m.base.size)}</b> px / 0.92
                        </bdi>
                    </span>
                    <div className="ins-lead ins-dot" style={{ left: m.dot.x, top: m.dot.y - 40, height: 32 }} />
                    <span
                        className="ins-chip ins-dot"
                        style={{ top: m.dot.y - 40, left: m.dot.x, translate: m.rtl ? '-100% -100%' : '-0.5px -100%' }}
                    >
                        {copy.dot}
                    </span>
                    <div className="ins-meas" style={{ left: m.measure.x0, width: m.measure.x1 - m.measure.x0, top: m.measure.y - 14 }}>
                        <span className="ins-chip ins-chip-mid">
                            <bdi>
                                <b data-count={m.measure.ch}>{m.measure.ch}</b> ch
                            </bdi>
                        </span>
                    </div>
                    <div className="ins-sketch" style={{ left: m.sketch.x, top: m.sketch.y, width: m.sketch.w, height: m.sketch.h }}>
                        <span className="ins-chip ins-chip-tag">{copy.sketch}</span>
                    </div>
                </>
            )}
        </div>
    );
}

/** The proof strip under the photo: this visitor's own load, read live. */
export function AboutMetrics({ copy, locale }: { copy: InspectorCopy; locale: string }) {
    const [lcp, setLcp] = useState<number | null>(null);
    const [cls, setCls] = useState(0);

    useEffect(() => {
        const obs: PerformanceObserver[] = [];
        try {
            const a = new PerformanceObserver((list) => {
                const e = list.getEntries().at(-1);
                if (e) setLcp(e.startTime / 1000);
            });
            a.observe({ type: 'largest-contentful-paint', buffered: true });
            obs.push(a);
            let sum = 0;
            const b = new PerformanceObserver((list) => {
                for (const e of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[])
                    if (!e.hadRecentInput) sum += e.value;
                setCls(sum);
            });
            b.observe({ type: 'layout-shift', buffered: true });
            obs.push(b);
        } catch {
            /* browser without these entry types: the readouts stay hidden */
        }
        return () => obs.forEach((o) => o.disconnect());
    }, []);

    const other = locale === 'ar' ? 'fr' : 'ar';
    return (
        <dl className="ab-metrics">
            {/* slots always render (an appearing slot would itself be a layout
                shift); a value that is unknown or not honest stays invisible */}
            <div className="ab-metric" data-off={lcp === null || lcp > LCP_HONEST || undefined}>
                <dt>{copy.lcp}</dt>
                <dd>
                    <bdi>{lcp === null ? '0.0' : lcp.toFixed(1)}</bdi>
                </dd>
            </div>
            <div className="ab-metric" data-off={cls > CLS_HONEST || undefined}>
                <dt>{copy.cls}</dt>
                <dd>
                    <bdi>{cls < 0.005 ? '0' : cls.toFixed(2)}</bdi>
                </dd>
            </div>
            <div className="ab-metric">
                <dt>{copy.mirror}</dt>
                <dd>
                    <Link href="/#sec-about" locale={other} className="ab-mirror" lang={other}>
                        {copy.mirrorMark}
                    </Link>
                </dd>
            </div>
        </dl>
    );
}
