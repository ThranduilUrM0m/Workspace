import { ImageResponse } from 'next/og';
import { SITE_PLAN_VIEWBOX, SITE_PLAN_WALLS } from '@/components/public/site-plan';
import { postBySlug, posts } from '@/content/posts';
import { coverSpec } from '@/lib/cover';

// Per-post share image: the same cover spec as the page (lib/cover.ts), at
// 1200x630 with the post title under the word. Satori's built-in face, as in
// the sitewide image: it cannot read the woff2 files next/font serves.

export const alt = 'Boutaleb journal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
    return posts.map((p) => ({ slug: p.slug }));
}

export default async function PostOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = postBySlug(slug);
    const spec = post ? coverSpec(post) : null;
    const ground = spec?.ground ?? '#F7F5F2';
    const ink = spec?.ink ?? '#1B1B1F';
    const mark = spec?.mark ?? '#C4694A';

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px 96px',
                    background: ground,
                    color: ink,
                    position: 'relative',
                }}
            >
                <svg
                    width="420"
                    height="398"
                    viewBox={SITE_PLAN_VIEWBOX}
                    style={{ position: 'absolute', right: 72, top: 116, opacity: 0.14 }}
                >
                    <path d={SITE_PLAN_WALLS} fill={mark} />
                </svg>
                <div style={{ display: 'flex', fontSize: 28, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.62 }}>
                    {spec?.category ?? 'Journal'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', fontSize: 136, lineHeight: 1, letterSpacing: -5, fontWeight: 700 }}>
                        {(spec?.lines ?? ['journal']).join(' ').toLowerCase()}
                        <span style={{ color: mark }}>.</span>
                    </div>
                    <div style={{ display: 'flex', marginTop: 28, fontSize: 44, lineHeight: 1.2, maxWidth: 820 }}>
                        {post?.title ?? 'Notes from the work'}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 36, letterSpacing: -1 }}>
                    boutaleb
                    <div style={{ width: 9, height: 9, marginLeft: 2, marginBottom: 7, background: mark }} />
                </div>
            </div>
        ),
        size,
    );
}
