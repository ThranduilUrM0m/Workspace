// PROTOTYPE 2026-11-26, "a day passing on the wall": the soft shadow of an olive
// branch, fixed behind the homepage. As the page scrolls the sun drops: the
// shadow lengthens and leans (CSS scroll-driven animation in home.css, block
// "===== DAY ====="). Drawn from a seeded generator so it is identical on every
// render; the final asset may be a real photographed/AI shadow if this one is
// approved. Server component: plain static SVG, no JS shipped.

const W = 1000;
const H = 1000;

function rng(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

type Pt = [number, number];
// point and tangent angle on a cubic bezier
function bez(p: Pt[], t: number): { x: number; y: number; a: number } {
    const [p0, p1, p2, p3] = p as [Pt, Pt, Pt, Pt];
    const u = 1 - t;
    const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
    const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
    const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]);
    const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]);
    return { x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI };
}

// main stem enters from the top-right corner and sweeps down-left; twigs fork off it
const STEMS: { c: Pt[]; w: number; leaves: number }[] = [
    { c: [[1040, -40], [820, 120], [640, 260], [380, 520]], w: 9, leaves: 26 },
    { c: [[760, 150], [700, 300], [690, 420], [620, 600]], w: 5, leaves: 14 },
    { c: [[560, 330], [470, 340], [380, 330], [250, 380]], w: 4, leaves: 12 },
    { c: [[900, 60], [930, 220], [880, 340], [900, 470]], w: 4, leaves: 11 },
];

function branch() {
    const r = rng(20261126);
    const stems: string[] = [];
    const leaves: { x: number; y: number; a: number; l: number; w: number }[] = [];
    for (const s of STEMS) {
        const [a, b, c, d] = s.c as [Pt, Pt, Pt, Pt];
        stems.push(`M${a[0]} ${a[1]}C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`);
        for (let i = 0; i < s.leaves; i++) {
            const t = 0.08 + (0.9 * (i + r() * 0.5)) / s.leaves;
            const p = bez(s.c, Math.min(t, 0.99));
            const side = i % 2 ? 1 : -1;
            // olive leaves: long, narrow, angled forward along the twig
            const l = 46 + r() * 34;
            leaves.push({ x: p.x, y: p.y, a: p.a + side * (28 + r() * 30), l, w: 6 + r() * 4 });
        }
        // a tip leaf continues each twig
        const tip = bez(s.c, 1);
        leaves.push({ x: tip.x, y: tip.y, a: tip.a, l: 58, w: 8 });
    }
    return { stems, leaves };
}

const SHAPE = branch();

export function DayShadow() {
    return (
        <div className="day" aria-hidden="true">
            <svg className="day-branch" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMin meet">
                <g fill="currentColor" stroke="currentColor" strokeLinecap="round">
                    {SHAPE.stems.map((d, i) => (
                        <path key={i} d={d} fill="none" strokeWidth={STEMS[i]?.w ?? 4} />
                    ))}
                    {SHAPE.leaves.map((f, i) => (
                        // leaf = ellipse whose base sits on the twig
                        <ellipse
                            key={i}
                            cx={f.l / 2}
                            cy={0}
                            rx={f.l / 2}
                            ry={f.w}
                            stroke="none"
                            transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.a.toFixed(1)})`}
                        />
                    ))}
                </g>
            </svg>
        </div>
    );
}
