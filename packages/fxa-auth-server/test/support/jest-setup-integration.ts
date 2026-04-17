/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest setup file for integration tests.
 * Runs AFTER the test environment is set up (after jest-setup-env.ts).
 */

// testTimeout in jest project configs is ignored in multi-project mode;
// jest.setTimeout here is the reliable way to set per-project timeout.
jest.setTimeout(30000);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
