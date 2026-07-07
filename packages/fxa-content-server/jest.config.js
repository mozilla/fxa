/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

'use strict';

// Jest config for fxa-content-server server-side unit tests. The package's
// legacy (intern) test harness was removed; new server/lib tests are plain
// CommonJS and run here, matching the Jest convention used by sibling server
// packages (fxa-profile-server, fxa-auth-server, etc.).
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  // Co-located server-side unit tests only. App/browser code is covered by the
  // functional (Playwright) suite, not here.
  testMatch: ['<rootDir>/server/**/*.test.js'],
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 20000,
  clearMocks: true,
  // Coverage configuration (enabled via --coverage flag).
  collectCoverageFrom: [
    'server/lib/waict.js',
    'server/lib/waict-manifest-builder.js',
    'server/lib/url-scrubber.js',
    'server/lib/routes/get-waict-manifest.js',
    'server/lib/routes/get-waict-canary.js',
    'server/lib/routes/post-waict-report.js',
  ],
  coverageDirectory: '../../artifacts/coverage/fxa-content-server-jest',
  coverageReporters: ['text', 'lcov', 'html'],
};
