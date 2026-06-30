/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Lift Jest's per-test timeout when a debugger is attached (FXA-13439). While
 * paused at a breakpoint the test clock keeps ticking, so specs trip their
 * timeout before you finish stepping through.
 *
 * inspector.url() is the debugger's ws:// URL when attached, undefined otherwise
 * (so normal/CI runs keep their configured timeouts); execArgv/NODE_OPTIONS also
 * catch --inspect set before the session opens. Loaded via setupFilesAfterEnv so
 * `jest` is defined; must run last so its setTimeout() wins over earlier setup.
 */
const inspector = require('inspector');

const isDebugging =
  inspector.url() !== undefined ||
  process.execArgv.some((arg) => arg.includes('--inspect')) ||
  (process.env.NODE_OPTIONS || '').includes('--inspect');

if (isDebugging) {
  // Finite ceiling rather than 0, which Jest treats as "time out immediately".
  jest.setTimeout(30 * 60 * 1000);
}
