/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Collection of utils for tests

const assert = require('assert');
const ORIGINAL_STDOUT_WRITE = process.stdout.write;
const LOGS_REGEX = /^\x1b\[1mfxa-oauth-server/i; // eslint-disable-line no-control-regex

export function disableLogs() {
  // the following is done to make sure
  // not to pollute the testing logs with server output.
  // it disables fxa-oauth-server logs and others in the future
  process.stdout.write = (function () {
    return function (string: string, ...args: any[]) {
      const allArgs = [string, ...args];
      if (allArgs[0] && LOGS_REGEX.test(allArgs[0])) {
        allArgs[0] = '';
      }
      return (ORIGINAL_STDOUT_WRITE as any).apply(process.stdout, allArgs);
    };
  })() as any;
}

export function restoreStdoutWrite() {
  process.stdout.write = ORIGINAL_STDOUT_WRITE;
}

export function decodeJWT(b64: string) {
  const jwt = b64.split('.');
  return {
    header: JSON.parse(Buffer.from(jwt[0], 'base64').toString('utf-8')),
    claims: JSON.parse(Buffer.from(jwt[1], 'base64').toString('utf-8')),
  };
}

export function assertSecurityHeaders(res: any, expected: Record<string, string> = {}) {
  const headers = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'x-frame-options': 'DENY',
    ...expected,
  };

  Object.keys(headers).forEach(function (header) {
    assert.equal(res.headers[header], (headers as any)[header]);
  });
}
