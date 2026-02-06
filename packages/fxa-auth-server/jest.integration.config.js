/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const baseConfig = require('./jest.config');

// Set NODE_ENV before any modules are loaded
process.env.NODE_ENV = 'dev';

module.exports = {
  ...baseConfig,

  // Add vendored module mapping (not in base config)
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@fxa/vendored/(.*)$': '<rootDir>/../../libs/vendored/$1/src',
  },

  // Integration test specific settings
  testMatch: [
    '<rootDir>/test/remote/**/*.spec.ts',
    '<rootDir>/test/integration/**/*.spec.ts',
  ],

  // Longer timeout for integration tests (includes server startup)
  testTimeout: 120000,

  // Global setup/teardown - starts mail_helper once for all test suites
  globalSetup: '<rootDir>/test/support/jest-global-setup.ts',
  globalTeardown: '<rootDir>/test/support/jest-global-teardown.ts',

  // Setup env vars BEFORE test environment (affects module loading)
  setupFiles: [
    '<rootDir>/test/support/jest-setup-env.ts',
  ],

  // Setup file AFTER test environment (custom matchers, timeouts)
  setupFilesAfterEnv: [
    '<rootDir>/test/support/jest-setup-integration.ts',
  ],

  // Parallel execution is enabled - each suite gets its own ports
  // Adjust based on CI resources if needed
  // maxWorkers: '50%',

  // Coverage for integration tests
  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-auth-server-jest-integration',
};
