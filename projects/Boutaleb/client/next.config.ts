import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { retiredRedirects } from './lib/redirects';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // The workspace packages ship TypeScript source, not a build.
    transpilePackages: ['@repo/ui', '@repo/schemas'],
    images: { formats: ['image/avif', 'image/webp'] },
    // Runs before proxy.ts, so a retired address never reaches the 404 page.
    redirects: async () => retiredRedirects(),
    // A magic link is a credential (T8.4): the page it opens must not be
    // cached, indexed, or leak its address in a Referer to anything it links to.
    headers: async () => [
        {
            source: '/p/:path*',
            headers: [
                { key: 'Referrer-Policy', value: 'no-referrer' },
                { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
                { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
            ],
        },
        { source: '/api/portal/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store, max-age=0' }] },
    ],
};

export default withNextIntl(nextConfig);
