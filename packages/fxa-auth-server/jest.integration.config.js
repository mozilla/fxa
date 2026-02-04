/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const baseConfig = require('./jest.config');

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

  // Setup file for each test (env vars, custom matchers)
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
