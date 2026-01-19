const path = require('path');
const withPWA = require('next-pwa');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Guard Workbox require to avoid runtime crash when not installed
let WorkboxWebpackPlugin;
try {
  WorkboxWebpackPlugin = require('workbox-webpack-plugin');
} catch (e) {
  WorkboxWebpackPlugin = null;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { 
    serverActions: true,
    serverComponents: true,
    // Enable Edge Runtime for API routes by default
    runtime: 'edge',
    // Enable streaming and progressive loading
    streaming: true,
    // Worker optimization
    workerThreads: true,
    // Advanced optimizations
    optimizeCss: true,
    optimizeImages: true,
    optimizeFonts: true,
    scrollRestoration: true,
    // Enable webpack persistent caching
    persistentCache: true,
  },
  // Image optimization configuration
  images: {
    domains: ['your-image-domains.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  // Font optimization
  optimizeFonts: true,
  // Enable React Server Components
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Progressive Web App configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    minimumCacheTTL: 60,
  },
  // Compress responses
  compress: true,
  // Increase static generation concurrency
  staticPageGenerationTimeout: 120,
  // Enable progressive web app features
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
  webpack: (config, { dev, isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@repo/ui': path.resolve(__dirname, '../../../../packages/ui/src')
    };

    // Prevent Watchpack from trying to stat Windows system files
    config.watchOptions = config.watchOptions || {};
    config.watchOptions.ignored = [
      /node_modules/,
      '**/pagefile.sys',
      '**/swapfile.sys',
      '**/hiberfil.sys',
      '**/DumpStack.log.tmp',
      'C:\\**\\pagefile.sys',
      'C:\\**\\swapfile.sys',
      'C:\\**\\hiberfil.sys',
      'C:\\**\\DumpStack.log.tmp'
    ];

    // Enable worker threads in webpack
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };

    // Add service worker for production
    if (!dev && !isServer) {
      config.plugins.push(
        new WorkboxWebpackPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        })
      );
    }

    if (WorkboxWebpackPlugin && !dev && !isServer) {
      config.plugins.push(
        new WorkboxWebpackPlugin.GenerateSW({
          clientsClaim: true,
          skipWaiting: true,
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        })
      );
    }

    return config;
  }
};
