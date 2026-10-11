import { ImageResponse } from 'next/og';
import { SITE_PLAN_VIEWBOX, SITE_PLAN_WALLS } from '@/components/public/site-plan';

// The sitewide default share image (seo-boutaleb §8): the wordmark and
// Favicon_2 on the page ground. Brand values are provisional; regenerate,
// do not redesign, when the brand phase lands. Per-page images later.
// Satori's built-in face, not Bricolage: it cannot read the woff2 files
// next/font serves, and a bundled TTF is not worth it before the brand pass.

export const alt = 'Boutaleb';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 96px',
                    background: '#F7F5F2',
                    color: '#1B1B1F',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 120, letterSpacing: -4 }}>
                    Boutaleb
                    <div style={{ width: 22, height: 22, marginLeft: 2, marginBottom: 26, background: '#C4694A' }} />
                </div>
                <svg width="330" height="313" viewBox={SITE_PLAN_VIEWBOX}>
                    <path d={SITE_PLAN_WALLS} fill="#1B1B1F" />
                </svg>
            </div>
        ),
        size,
    );
}
