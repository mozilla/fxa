/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const baseConfig = require('./jest.config');

process.env.NODE_ENV = 'dev';

module.exports = {
  ...baseConfig,

  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^@fxa/vendored/(.*)$': '<rootDir>/../../libs/vendored/$1/src',
  },

  testMatch: [
    '<rootDir>/test/remote/**/*.spec.ts',
    '<rootDir>/test/integration/**/*.spec.ts',
  ],

  testTimeout: 120000,

  globalSetup: '<rootDir>/test/support/jest-global-setup.ts',
  globalTeardown: '<rootDir>/test/support/jest-global-teardown.ts',

  setupFiles: [
    '<rootDir>/test/support/jest-setup-env.ts',
  ],

  setupFilesAfterEnv: [
    '<rootDir>/test/support/jest-setup-integration.ts',
  ],

  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-auth-server-jest-integration',
};
