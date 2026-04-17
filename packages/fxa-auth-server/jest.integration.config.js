/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const baseConfig = require('./jest.config');

process.env.NODE_ENV = 'dev';

module.exports = {
  ...baseConfig,
  displayName: 'fxa-auth-server-integration',

  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@fxa/vendored/(.*)$': '<rootDir>/../../libs/vendored/$1/src',
    // Map bare 'fxa-shared' to source to avoid class identity mismatches
    // between dist/cjs and source modules (e.g., ScopeSet loaded via
    // require('fxa-shared').oauth.scopes vs fxa-shared/oauth/scopes).
    '^fxa-shared$': '<rootDir>/../fxa-shared/index',
  },

  testMatch: ['<rootDir>/**/*.in.spec.ts'],

  // oauth_api.in.spec.ts uses its own in-process server (server.inject)
  // and must run separately to avoid client-config DB race conditions
  // with the shared server started by globalSetup.
  testPathIgnorePatterns: [
    '/node_modules/',
    'oauth_api\\.in\\.spec\\.ts',
    'test/scripts',
  ],

  testTimeout: 120000,
  maxWorkers: 4,

  globalSetup: '<rootDir>/test/support/jest-global-setup.ts',
  globalTeardown: '<rootDir>/test/support/jest-global-teardown.ts',

  setupFiles: ['<rootDir>/test/support/jest-setup-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/support/jest-setup-integration.ts'],

  collectCoverageFrom: ['lib/**/*.{ts,js}', '!lib/**/*.spec.{ts,js}'],
  coverageDirectory:
    '../../artifacts/coverage/fxa-auth-server-jest-integration',
};
