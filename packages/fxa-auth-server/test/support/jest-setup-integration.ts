/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest setup file for integration tests.
 * Runs AFTER the test environment is set up (after jest-setup-env.ts).
 */

// `testTimeout` is a global Jest option and is ignored when set per-project
// under `projects` (jest.config.js), so the infra suites set their longer
// timeout here. debug-timeout.js runs after this and raises it further when a
// debugger is attached.
jest.setTimeout(120000);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
