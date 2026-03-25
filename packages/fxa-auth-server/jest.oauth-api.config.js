/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Standalone config for oauth_api.in.spec.ts which manages its own
// in-process server via test/lib/server.js (server.inject).  It must
// NOT share the jest-global-setup shared server because both sync
// different client configs to the same database, causing race conditions.

const baseConfig = require('./jest.config');

process.env.NODE_ENV = 'dev';

module.exports = {
  ...baseConfig,

  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@fxa/vendored/(.*)$': '<rootDir>/../../libs/vendored/$1/src',
    '^fxa-shared$': '<rootDir>/../fxa-shared/index',
  },

  testMatch: ['<rootDir>/test/remote/oauth_api.in.spec.ts'],
  // Override base config's .in.spec.ts ignore since this targets one
  testPathIgnorePatterns: [],

  testTimeout: 120000,
  maxWorkers: 1,

  // No globalSetup/teardown — this test starts its own server in-process
  setupFiles: ['<rootDir>/test/support/jest-setup-env.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/support/jest-setup-integration.ts'],

  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-auth-server-jest-oauth-api',
};
