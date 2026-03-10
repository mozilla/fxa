/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('../../tsconfig.base.json');

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/lib/**/*.spec.ts', '<rootDir>/config/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { isolatedModules: true } }],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@fxa|fxa-shared)/)'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths, {
      prefix: '<rootDir>/../../../',
    }),
    '^@opentelemetry/otlp-exporter-base/node-http$':
      '@opentelemetry/otlp-exporter-base/build/src/index-node-http.js',
    '^@opentelemetry/otlp-exporter-base/browser-http$':
      '@opentelemetry/otlp-exporter-base/build/src/index-browser-http.js',
  },
  testTimeout: 10000,
  clearMocks: true,
  maxWorkers: 4,
  workerIdleMemoryLimit: '512MB',
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
