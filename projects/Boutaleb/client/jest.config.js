const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>'],
  // e2e/ is Playwright's (corepack pnpm test:e2e), not Jest's.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
};

// @react-email/render (via @repo/emails) loads react-dom/server with a
// dynamic import(), which Jest's CommonJS runtime refuses. SWC turns it into
// a require(), so the package must be transformed: its .cjs build added to
// next/jest's transform, and the package spared from the node_modules
// ignore patterns next/jest builds out of transpilePackages. Jest-only: the
// real sender (M8) runs on Node, where import() just works.
const sparePackage = [
  ['@repo/ui', '@react-email/render'],
  ['@repo\\+ui', '@react-email\\+render'],
  ['@repo[\\\\/]ui', '@react-email[\\\\/]render'],
];

module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();

  const [[scriptPattern, swc]] = Object.entries(config.transform);
  delete config.transform[scriptPattern];
  config.transform = { '^.+\\.(js|jsx|ts|tsx|mjs|cjs)$': swc, ...config.transform };

  const before = config.transformIgnorePatterns.join('\n');
  config.transformIgnorePatterns = config.transformIgnorePatterns.map((pattern) =>
    sparePackage.reduce((p, [first, extra]) => p.replace(`(${first}|`, `(${extra}|${first}|`), pattern),
  );
  if (config.transformIgnorePatterns.join('\n') === before) {
    throw new Error('jest.config.js: next/jest ignore patterns changed shape; @react-email/render is no longer spared.');
  }
  return config;
};
