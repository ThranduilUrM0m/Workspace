import type { ApproachIcon } from '@/content/pages/home';
import { draftBox, type Shape, SketchPaths } from './sketch';

// Faded pencil drawings beside the three Approach promises, in the same hand as the
// mockup's wireframe (rough.js, server-rendered). Each one pictures its promise:
// drawn  - a page sketch with an approving tick in its corner
// language - two speech bubbles, one Latin, one Arabic
// keys   - a key on a ring with a name tag

const DRAWINGS: Record<ApproachIcon, { shapes: Shape[]; glyphs?: { x: number; y: number; t: string }[] }> = {
    drawn: {
        shapes: [
            ...draftBox(10, 14, 62, 50, 4),
            { k: 'line', p: [10, 26, 72, 26] },
            { k: 'line', p: [16, 20, 30, 20] },
            ...draftBox(17, 32, 24, 24, 0),
            { k: 'line', p: [17, 32, 41, 56] },
            { k: 'line', p: [41, 32, 17, 56] },
            { k: 'line', p: [48, 36, 66, 36] },
            { k: 'line', p: [48, 44, 62, 44] },
            { k: 'line', p: [48, 52, 64, 52] },
            { k: 'circle', p: [70, 66, 22] },
            { k: 'path', d: 'M62 66 L68 72 L79 59' },
        ],
    },
    language: {
        shapes: [
            { k: 'path', d: 'M8 14 H52 V42 H26 L16 52 V42 H8 Z' },
            { k: 'path', d: 'M38 34 H80 V62 H72 V72 L62 62 H38 Z' },
        ],
        glyphs: [
            { x: 30, y: 33, t: 'Fr' },
            { x: 59, y: 54, t: 'ع' },
        ],
    },
    keys: {
        shapes: [
            { k: 'circle', p: [24, 30, 26] },
            { k: 'circle', p: [24, 30, 9] },
            { k: 'line', p: [36, 30, 78, 30] },
            { k: 'line', p: [66, 30, 66, 40] },
            { k: 'line', p: [74, 30, 74, 38] },
            { k: 'path', d: 'M30 44 Q34 54 42 58' },
            { k: 'path', d: 'M40 56 L62 56 L68 62 L62 68 L40 68 Z' },
            { k: 'line', p: [46, 62, 58, 62] },
        ],
    },
};

export function ApproachDrawing({ icon, seed }: { icon: ApproachIcon; seed: number }) {
    const d = DRAWINGS[icon];
    return (
        <svg className="ap-item-icon" viewBox="0 0 90 80" aria-hidden="true">
            <SketchPaths shapes={d.shapes} seed={seed} opts={{ roughness: 1.1, strokeWidth: 1.3 }} />
            {d.glyphs?.map((g) => (
                <text key={g.t} x={g.x} y={g.y} className={g.t === 'ع' ? 'ap-glyph ap-glyph-ar' : 'ap-glyph'} textAnchor="middle">
                    {g.t}
                </text>
            ))}
        </svg>
    );
}
