import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { retiredRedirects } from './lib/redirects';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // packages/ui ships TypeScript source, not a build.
    transpilePackages: ['@repo/ui'],
    images: { formats: ['image/avif', 'image/webp'] },
    // Runs before proxy.ts, so a retired address never reaches the 404 page.
    redirects: async () => retiredRedirects(),
};

export default withNextIntl(nextConfig);
