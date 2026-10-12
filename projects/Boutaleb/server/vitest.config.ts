import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// SWC builds the tests because esbuild (Vitest's default) does not emit
// decorator metadata, and Nest's dependency injection reads it.
export default defineConfig({
    test: {
        globals: true,
        root: './',
        include: ['src/**/*.test.ts'],
        // First run downloads a mongod binary for mongodb-memory-server.
        hookTimeout: 120_000,
    },
    plugins: [swc.vite({ module: { type: 'es6' } })],
});
