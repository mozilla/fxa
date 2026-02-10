/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: [
    '<rootDir>/lib/**/*.spec.ts',
    '<rootDir>/config/**/*.spec.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { isolatedModules: true } }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@fxa|fxa-shared)/)',
  ],
  moduleNameMapper: {
    '^@fxa/shared/(.*)$': '<rootDir>/../../libs/shared/$1/src',
    '^@fxa/accounts/(.*)$': '<rootDir>/../../libs/accounts/$1/src',
    '^@fxa/payments/(.*)$': '<rootDir>/../../libs/payments/$1/src',
    '^@fxa/profile/(.*)$': '<rootDir>/../../libs/profile/$1/src',
    '^fxa-shared/(.*)$': '<rootDir>/../fxa-shared/$1',
  },
  testTimeout: 10000,
  clearMocks: true,
  setupFiles: ['<rootDir>/jest.setup.js', '<rootDir>/jest.setup-proxyquire.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  // Coverage configuration (enabled via --coverage flag)
  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    'config/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
    '!config/**/*.spec.{ts,js}',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-auth-server-jest',
  coverageReporters: ['text', 'lcov', 'html'],
};
