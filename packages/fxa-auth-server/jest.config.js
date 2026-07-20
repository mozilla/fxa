/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Single Jest config for fxa-auth-server. Each test suite is a named `project`;
// run one with `jest --selectProjects <name>` (see scripts/test-ci.sh).
// `rootDir: __dirname` keeps each project portable so the root jest.config.ts
// can import and spread `module.exports.projects`.
process.env.NODE_ENV = 'dev';

// Shared by every suite.
const base = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: __dirname,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { isolatedModules: true } }],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@fxa|fxa-shared|p-queue|p-timeout|eventemitter3)/)',
  ],
  clearMocks: true,
  workerIdleMemoryLimit: '512MB',
  moduleNameMapper: {
    '^@fxa/free-access-program$':
      '<rootDir>/../../libs/free-access-program/src',
    '^@fxa/shared/(.*)$': '<rootDir>/../../libs/shared/$1/src',
    '^@fxa/accounts/(.*)$': '<rootDir>/../../libs/accounts/$1/src',
    '^@fxa/payments/(.*)$': '<rootDir>/../../libs/payments/$1/src',
    '^@fxa/profile/(.*)$': '<rootDir>/../../libs/profile/$1/src',
    '^fxa-shared/(.*)$': '<rootDir>/../fxa-shared/$1',
  },
};

// Lift Jest's per-test timeout when a debugger is attached. Runs last in every
// suite so its setTimeout() wins over earlier setup.
const debugTimeout = '<rootDir>/test/jest.debug-timeout.js';

// Shared by the three infra-backed suites (real Redis/MySQL, started by
// globalSetup). They need extra module mappings and the integration setup, and
// must NOT inherit the unit suite's DB-boundary mocks.
const integrationBase = {
  ...base,
  moduleNameMapper: {
    ...base.moduleNameMapper,
    '^@fxa/vendored/(.*)$': '<rootDir>/../../libs/vendored/$1/src',
    // Map bare 'fxa-shared' to source to avoid class identity mismatches
    // between dist/cjs and source modules (e.g., ScopeSet loaded via
    // require('fxa-shared').oauth.scopes vs fxa-shared/oauth/scopes).
    '^fxa-shared$': '<rootDir>/../fxa-shared/index',
  },
  // testTimeout and maxWorkers are global options, ignored per-project under
  // `projects`: the infra timeout is set via jest.setTimeout() in
  // jest-setup-integration.ts, and maxWorkers is passed per-suite on the CLI
  // (see scripts/test-ci.sh).
  setupFiles: ['<rootDir>/test/support/jest-setup-env.ts'],
  setupFilesAfterEnv: [
    '<rootDir>/test/support/jest-setup-integration.ts',
    debugTimeout,
  ],
};

// The shared HTTP server used by the integration and scripts suites.
const globalServer = {
  globalSetup: '<rootDir>/test/support/jest-global-setup.ts',
  globalTeardown: '<rootDir>/test/support/jest-global-teardown.ts',
};

module.exports = {
  // Coverage is a root-level (not per-project) option under `projects`. Only the
  // unit suite runs with --coverage in CI, so these mirror the unit suite.
  collectCoverageFrom: [
    'lib/**/*.{ts,js}',
    'config/**/*.{ts,js}',
    '!lib/**/*.spec.{ts,js}',
    '!config/**/*.spec.{ts,js}',
    '!**/node_modules/**',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-auth-server-jest',
  coverageReporters: ['text', 'lcov', 'html'],

  projects: [
    {
      ...base,
      displayName: 'unit',
      testMatch: [
        '<rootDir>/lib/**/*.spec.ts',
        '<rootDir>/config/**/*.spec.ts',
        '<rootDir>/scripts/**/*.spec.ts',
      ],
      testPathIgnorePatterns: ['/node_modules/', '\\.in\\.spec\\.ts$'],
      setupFiles: [
        '<rootDir>/jest.setup.js',
        '<rootDir>/jest.setup-resolve.js',
      ],
      // Unit-only: mock the Redis + OAuth node-mysql boundaries so module-load
      // singletons open zero real connections. Scoped to this project, so the
      // infra-backed suites below never inherit it.
      setupFilesAfterEnv: [
        '<rootDir>/jest.setup-mock-db-connections.js',
        debugTimeout,
      ],
    },
    {
      ...integrationBase,
      ...globalServer,
      displayName: 'integration',
      testMatch: ['<rootDir>/**/*.in.spec.ts'],
      testPathIgnorePatterns: [
        '/node_modules/',
        'oauth_api\\.in\\.spec\\.ts',
        'test/scripts',
      ],
    },
    {
      ...integrationBase,
      ...globalServer,
      displayName: 'scripts',
      testMatch: ['<rootDir>/test/scripts/**/*.in.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/'],
    },
    {
      ...integrationBase,
      displayName: 'oauth-api',
      // No globalServer: oauth_api.in.spec.ts manages its own in-process server
      // (server.inject). Kept a separate project so it never shares the
      // globalSetup server, which would race on the same database.
      testMatch: ['<rootDir>/test/remote/oauth_api.in.spec.ts'],
      testPathIgnorePatterns: ['/node_modules/'],
    },
  ],
};
