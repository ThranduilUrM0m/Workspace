import Image from 'next/image';
import type { CSSProperties } from 'react';
import { KeyRound, Lock } from 'lucide-react';
import courtyard from '@/public/images/home/approach-courtyard.jpg';
import { draftBox, type Shape, SketchPaths } from './sketch';

// The Approach section's picture, built in HTML instead of an image (developer picks,
// 2026-11-22): one browser window showing a sample client site, cut diagonally. The
// inline-start part is a pencil wireframe in the manner of Perchance sketch
// mwseucwgnf68xu (lines that run past the corners, an X where the photo goes, boxed
// text); the rest is the finished page. A pencil like the one in mwseuf4ixhh8xy lies
// beside the window. The promises read in one view: drawn before it is built (the
// split), in your language (the FR / AR / EN tabs), keys in your name (the key by the
// client's own domain). Decorative: the section's text carries the meaning.

export type MockCopy = { site: string; domain: string; active: 'fr' | 'ar' | 'en' };

// Page geometry in a 640 x 400 drawing (the body is 16:10), shared by both layers.
const W = 640;
const H = 400;
type Box = [number, number, number, number];
const G = {
    logo: [20, 16, 92, 18] as Box,
    langs: [548, 16, 72, 18] as Box,
    title: [[20, 78, 196], [20, 96, 150]] as [number, number, number][],
    bodyBox: [14, 124, 214, 62] as Box,
    body: [[22, 138, 196], [22, 152, 176], [22, 166, 186]] as [number, number, number][],
    cta: [500, 308, 120, 22] as Box,
    photo: [250, 64, 370, 236] as Box,
    cards: [20, 230, 440].map((x) => x) as number[],
};
const NAV = [372, 420, 468];

const at = ([x, y, w, h]: Box): CSSProperties => ({
    left: `${(x / W) * 100}%`,
    top: `${(y / H) * 100}%`,
    width: `${(w / W) * 100}%`,
    height: `${(h / H) * 100}%`,
});

const LANGS = [
    ['fr', 'FR'],
    ['ar', 'ع'],
    ['en', 'EN'],
] as const;

function Built({ copy }: { copy: MockCopy }) {
    return (
        <div className="am-page am-built">
            <span className="am-logo" style={at(G.logo)}>
                {copy.site}
            </span>
            {NAV.map((x) => (
                <i key={x} className="am-bar-line" style={at([x, 24, 34, 3])} />
            ))}
            <span className="am-langs" style={at(G.langs)}>
                {LANGS.map(([k, label]) => (
                    <span key={k} className={k === copy.active ? 'on' : undefined}>
                        {label}
                    </span>
                ))}
            </span>
            <i className="am-rule" style={at([20, 46, 600, 1])} />
            {G.title.map(([x, y, w]) => (
                <i key={y} className="am-title-bar" style={at([x, y, w, 9])} />
            ))}
            {G.body.map(([x, y, w]) => (
                <i key={y} className="am-text-bar" style={at([x - 2, y, w, 3.5])} />
            ))}
            <span className="am-cta" style={at(G.cta)}>
                <i />
            </span>
            <span className="am-photo" style={at(G.photo)}>
                <Image src={courtyard} alt="" fill sizes="(min-width: 48rem) 30vw, 70vw" />
            </span>
            {G.cards.map((x) => (
                <span key={x} className="am-card" style={at([x, 340, 180, 40])}>
                    <i />
                    <b />
                    <b />
                </span>
            ))}
        </div>
    );
}

function sketchShapes(): Shape[] {
    const s: Shape[] = [];
    s.push(...draftBox(...G.logo, 5));
    NAV.forEach((x) => s.push({ k: 'line', p: [x, 26, x + 34, 26] }));
    [0, 1, 2].forEach((i) => s.push({ k: 'rect', p: [550 + i * 24, 18, 20, 14] }));
    s.push({ k: 'line', p: [6, 46, 634, 46] });
    G.title.forEach(([x, y, w]) => {
        s.push({ k: 'line', p: [x, y + 2, x + w, y + 2] });
        s.push({ k: 'line', p: [x, y + 6, x + w - 8, y + 6] });
    });
    s.push(...draftBox(...G.bodyBox, 7));
    G.body.forEach(([x, y, w]) => s.push({ k: 'line', p: [x, y + 2, x + w, y + 2] }));
    s.push(...draftBox(...G.cta, 5));
    s.push({ k: 'line', p: [530, 319, 590, 319] });
    // arrow from the text toward the photo, an architect's note
    s.push({ k: 'line', p: [22, 216, 232, 216] });
    s.push({ k: 'path', d: 'M224 210 L233 216 L224 222' });
    const [px, py, pw, ph] = G.photo;
    s.push(...draftBox(px, py, pw, ph, 9));
    s.push({ k: 'line', p: [px, py, px + pw, py + ph] });
    s.push({ k: 'line', p: [px + pw, py, px, py + ph] });
    G.cards.forEach((x) => {
        s.push(...draftBox(x, 340, 46, 38, 4));
        s.push({ k: 'line', p: [x + 56, 352, x + 176, 352] });
        s.push({ k: 'line', p: [x + 56, 366, x + 150, 366] });
    });
    s.push({ k: 'line', p: [6, 392, 634, 392] });
    return s;
}

function Pencil() {
    // Hexagonal pencil seen from above: three lit facets, sharpened wood, graphite tip.
    return (
        <svg className="am-pencil" viewBox="0 0 220 22" aria-hidden="true">
            <rect x="0" y="3" width="166" height="5.3" fill="#F4B04A" />
            <rect x="0" y="8.3" width="166" height="5.4" fill="#E5922A" />
            <rect x="0" y="13.7" width="166" height="5.3" fill="#C4741C" />
            <rect x="0" y="3" width="4" height="16" fill="#9E5A14" />
            <path d="M166 3 Q169 5.5 166 8.3 Q169 11 166 13.7 Q169 16.3 166 19 L204 11 Z" fill="#EBC995" />
            <path d="M166 13.7 Q169 16.3 166 19 L204 11 Z" fill="#D9AE74" />
            <path d="M195 9.1 L204 11 L195 12.9 Z" fill="#2E2E33" />
        </svg>
    );
}

export function ApproachMock({ copy }: { copy: MockCopy }) {
    return (
        <div className="am" aria-hidden="true">
            <div className="am-window">
                <div className="am-bar">
                    <span className="am-dots">
                        <i />
                        <i />
                        <i />
                    </span>
                    <span className="am-url" dir="ltr">
                        <Lock className="am-lock" strokeWidth={1.75} />
                        {copy.domain}
                        <KeyRound className="am-key" strokeWidth={1.75} />
                    </span>
                </div>
                <div className="am-body">
                    <Built copy={copy} />
                    <div className="am-page am-sketch">
                        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
                            <SketchPaths shapes={sketchShapes()} seed={11} />
                        </svg>
                    </div>
                    <svg className="am-cut" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <line x1="62" y1="0" x2="38" y2="100" />
                    </svg>
                </div>
            </div>
            <Pencil />
        </div>
    );
}
