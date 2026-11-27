// PROTOTYPE 2026-11-26, "a day passing on the wall": the soft shadow of an olive
// branch, fixed behind the homepage. As the page scrolls the sun drops: the
// shadow lengthens and leans, and its twigs and leaves sway with the scroll like
// wind (27 Nov) (CSS scroll-driven animation in home.css, block
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

type Leaf = { x: number; y: number; a: number; l: number; w: number };
type Twig = { d: string; w: number; base: Pt; leaves: Leaf[] };

function branch(): Twig[] {
    const r = rng(20261126);
    return STEMS.map((s) => {
        const [a, b, c, d] = s.c as [Pt, Pt, Pt, Pt];
        const leaves: Leaf[] = [];
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
        return { d: `M${a[0]} ${a[1]}C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`, w: s.w, base: a, leaves };
    });
}

const TWIGS = branch();

// The outer <g> places a leaf (SVG transform attribute); the inner ellipse is
// what the wind rotates (CSS), so the two transforms never overwrite each other.
function Leaves({ leaves, offset }: { leaves: Leaf[]; offset: number }) {
    return leaves.map((f, i) => (
        <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.a.toFixed(1)})`}>
            <ellipse className={(i + offset) % 2 ? 'day-leaf b' : 'day-leaf'} cx={f.l / 2} cy={0} rx={f.l / 2} ry={f.w} />
        </g>
    ));
}

function Twig({ t, cls, children }: { t: Twig; cls: string; children?: React.ReactNode }) {
    return (
        <g className={`day-twig ${cls}`} style={{ transformOrigin: `${t.base[0]}px ${t.base[1]}px` }}>
            <path d={t.d} fill="none" stroke="currentColor" strokeWidth={t.w} />
            <Leaves leaves={t.leaves} offset={t.base[0]} />
            {children}
        </g>
    );
}

export function DayShadow() {
    const [main, ...side] = TWIGS;
    if (!main) return null;
    return (
        <div className="day" aria-hidden="true">
            <svg className="day-branch" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMin meet">
                {/* the side twigs ride on the main branch, then sway on their own */}
                <g fill="currentColor" strokeLinecap="round">
                    <Twig t={main} cls="main">
                        {side.map((t, i) => (
                            <Twig key={i} t={t} cls={i % 2 ? 'b' : ''} />
                        ))}
                    </Twig>
                </g>
            </svg>
        </div>
    );
}
