/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Collection of utils for tests

'use strict';

const ORIGINAL_STDOUT_WRITE = process.stdout.write;
const LOGS_REGEX = /^\[1mfxa-oauth-server/i; // eslint-disable-line no-control-regex

function disableLogs() {
  // the following is done to make sure
  // not to pollute the testing logs with server output.
  // it disables fxa-oauth-server logs and others in the future
  process.stdout.write = (function() {
    return function(string, encoding, fd) {
      const args = Array.prototype.slice.call(arguments);
      if (args[0] && LOGS_REGEX.test(args[0])) {
        args[0] = '';
      }
      ORIGINAL_STDOUT_WRITE.apply(process.stdout, args);
    };
  })();
}

function restoreStdoutWrite() {
  process.stdout.write = ORIGINAL_STDOUT_WRITE;
}

module.exports = {
  disableLogs,
  restoreStdoutWrite,
};
