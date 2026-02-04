/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Jest setup file for integration tests.
 * This runs before each test file.
 */

// Bypass OAuth key validation
process.env.FXA_OPENID_UNSAFELY_ALLOW_MISSING_ACTIVE_KEY = 'true';

// Increase timeout for integration tests (server startup can take time)
jest.setTimeout(60000);

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
