import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    // packages/ui ships TypeScript source, not a build.
    transpilePackages: ['@repo/ui'],
    images: { formats: ['image/avif', 'image/webp'] },
};

export default withNextIntl(nextConfig);
