/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest setup file for integration tests.
 * Runs AFTER the test environment is set up (after jest-setup-env.ts).
 */

jest.setTimeout(60000);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
