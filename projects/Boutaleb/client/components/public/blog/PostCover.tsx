import { SITE_PLAN_WALLS } from '@/components/public/site-plan';
import { COVER_VIEWBOX, coverSpec } from '@/lib/cover';
import type { Post } from '@/content/posts';

// The typographic blog cover, one SVG that fills whatever frame holds it:
// `slice` crops instead of letterboxing, so the same asset serves the 16:10
// cards, the 16:9 hero, the 114:82 thumbnail and the stretched desktop
// feature. The layout keeps the word and label inside the middle band
// (y 16 to 84) and 14 units off each side, the part every crop keeps.
// Decorative: the title is always printed beside it, so it is aria-hidden.

const LINE = 0.95;

export function PostCover({ post }: { post: Pick<Post, 'tags' | 'category' | 'title'> }) {
    const { lines, category, ground, ink, mark, fontSize } = coverSpec(post);
    const block = lines.length * fontSize * LINE;
    const top = 54 - block / 2;
    const glyphHeight = 78;
    const glyphScale = glyphHeight / 384;

    return (
        <svg
            className="cover"
            viewBox={`0 0 ${COVER_VIEWBOX.width} ${COVER_VIEWBOX.height}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
        >
            <rect width={COVER_VIEWBOX.width} height={COVER_VIEWBOX.height} fill={ground} />
            <path
                d={SITE_PLAN_WALLS}
                fill={mark}
                opacity={0.14}
                transform={`translate(${COVER_VIEWBOX.width - 404.94 * glyphScale - 6} 11) scale(${glyphScale})`}
            />
            <text x={14} y={top - 5} fill={ink} opacity={0.62} fontSize={4.2} letterSpacing={0.5} style={{ fontFamily: 'var(--f-body)', textTransform: 'uppercase' }}>
                {category}
            </text>
            {lines.map((line, i) => (
                <text
                    key={line}
                    x={14}
                    y={top + fontSize * LINE * (i + 1) - fontSize * 0.12}
                    fill={ink}
                    fontSize={fontSize}
                    fontWeight={700}
                    letterSpacing={-fontSize * 0.02}
                    style={{ fontFamily: 'var(--f-head)' }}
                >
                    {line.toLowerCase()}
                    {i === lines.length - 1 && <tspan fill={mark}>.</tspan>}
                </text>
            ))}
        </svg>
    );
}
