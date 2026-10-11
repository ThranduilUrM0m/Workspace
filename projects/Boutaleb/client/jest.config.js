const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>'],
  // e2e/ is Playwright's (corepack pnpm test:e2e), not Jest's.
  testPathIgnorePatterns: ['/node_modules/', '<rootDir>/e2e/'],
};

module.exports = createJestConfig(customJestConfig);
