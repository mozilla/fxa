/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Fix for module resolution not finding .ts files under Jest/ts-jest.
 * resolve.sync() defaults to only .js extensions, which breaks jest.mock()
 * for modules that resolve to .ts index files (e.g. fxa-shared/db/models/auth).
 * This patches resolve.sync to also look for .ts files.
 */

const resolve = require('resolve');
const originalSync = resolve.sync;
resolve.sync = function (id, opts) {
  opts = opts || {};
  if (!opts.extensions || opts.extensions.length === 0) {
    opts.extensions = ['.ts', '.tsx', '.js', '.json', '.node'];
  }
  return originalSync.call(this, id, opts);
};
