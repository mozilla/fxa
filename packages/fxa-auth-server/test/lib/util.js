/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Collection of utils for tests

'use strict';

const config = require('../../config').default.getProperties();
const crypto = require('crypto');
const assert = require('assert');
const ORIGINAL_STDOUT_WRITE = process.stdout.write;
const LOGS_REGEX = /^\[1mfxa-oauth-server/i; // eslint-disable-line no-control-regex

function disableLogs() {
  // the following is done to make sure
  // not to pollute the testing logs with server output.
  // it disables fxa-oauth-server logs and others in the future
  process.stdout.write = (function () {
    return function (string, encoding, fd) {
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

function decodeJWT(b64) {
  const jwt = b64.split('.');
  return {
    header: JSON.parse(Buffer.from(jwt[0], 'base64').toString('utf-8')),
    claims: JSON.parse(Buffer.from(jwt[1], 'base64').toString('utf-8')),
  };
}

function assertSecurityHeaders(res, expect = {}) {
  expect = {
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-content-type-options': 'nosniff',
    'x-xss-protection': '1; mode=block',
    'x-frame-options': 'DENY',
    ...expect,
  };

  Object.keys(expect).forEach(function (header) {
    assert.equal(res.headers[header], expect[header]);
  });
}

/**
 * Generates a unique email address for testing, optionally with a specified domain.
 * If a domain is not provided, it defaults to '@restmail.net'.
 *
 * The email can be prefixed to enable customs by providing the configOverride with
 * `enableCustomsChecks` set to true.
 * @param {string} domain The domain for the email address, defaults to '@restmail.net'
 * @param {{enableCustomsChecks: boolean}} configOverride Optional configuration override to control customs checks
 * @returns {string} A unique email address
 */
function uniqueEmail(domain, configOverride) {
  const cfg = configOverride || config;
  if (!domain) {
    domain = '@restmail.net';
  }
  const base = crypto.randomBytes(10).toString('hex');

  // The enable_customs_ prefix will skip the 'isAllowedEmail' check in customs
  // that is typically used to by pass customs during testing... This can
  // be useful if a test that expects customs to activate is run.
  const prefix = cfg.enableCustomsChecks ? 'enable_customs_' : '';
  return `${prefix}${base}${domain}`;
};

/**
 * Generates a unique email address for testing with Unicode characters.
 * @returns {string} A unique email address
 */
function uniqueUnicodeEmail() {
  return `${
    crypto.randomBytes(10).toString('hex') + String.fromCharCode(1234)
  }@${String.fromCharCode(5678)}restmail.net`;
};

module.exports = {
  assertSecurityHeaders,
  decodeJWT,
  disableLogs,
  restoreStdoutWrite,
  uniqueEmail,
  uniqueUnicodeEmail,
};
