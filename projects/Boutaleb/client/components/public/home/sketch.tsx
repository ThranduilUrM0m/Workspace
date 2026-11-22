import rough from 'roughjs';
import type { Options } from 'roughjs/bin/core';

// Hand-drawn pencil lines for the homepage (Approach mockup + item icons), drawn by
// rough.js at RENDER time on the server: the browser only receives fixed SVG paths, no
// script. A fixed seed per shape keeps every render identical (no hydration drift).

const gen = rough.generator();

export type Shape =
    | { k: 'line'; p: [number, number, number, number] }
    | { k: 'rect'; p: [number, number, number, number] }
    | { k: 'circle'; p: [number, number, number] }
    | { k: 'path'; d: string };

const BASE: Options = { roughness: 0.9, bowing: 0.8, strokeWidth: 1.2, stroke: 'currentColor' };

export function SketchPaths({ shapes, seed = 7, opts }: { shapes: Shape[]; seed?: number; opts?: Options }) {
    const out: { d: string; w: number }[] = [];
    shapes.forEach((s, i) => {
        const o: Options = { ...BASE, ...opts, seed: seed + i * 13 };
        const drawable =
            s.k === 'line'
                ? gen.line(...s.p, o)
                : s.k === 'rect'
                  ? gen.rectangle(...s.p, o)
                  : s.k === 'circle'
                    ? gen.circle(...s.p, o)
                    : gen.path(s.d, o);
        for (const p of gen.toPaths(drawable)) out.push({ d: p.d, w: p.strokeWidth });
    });
    return (
        <>
            {out.map((p, i) => (
                <path key={i} d={p.d} fill="none" stroke="currentColor" strokeWidth={p.w} strokeLinecap="round" />
            ))}
        </>
    );
}

/** An architect's box: the four sides run a little past each corner, like the reference sketch. */
export function draftBox(x: number, y: number, w: number, h: number, over = 6): Shape[] {
    return [
        { k: 'line', p: [x - over, y, x + w + over, y] },
        { k: 'line', p: [x - over, y + h, x + w + over, y + h] },
        { k: 'line', p: [x, y - over, x, y + h + over] },
        { k: 'line', p: [x + w, y - over, x + w, y + h + over] },
    ];
}
