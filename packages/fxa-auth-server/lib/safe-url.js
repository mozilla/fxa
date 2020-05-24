/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This module exports a safe URL-builder interface, ensuring that no
// unsafe input can leak into generated URLs.
//
// It takes the approach of throwing error.internalValidationError() when unsafe
// input is encountered, for extra visibility. An alternative approach
// would be to use encodeURIComponent instead to convert unsafe input on
// the fly. However, we have no valid use case for encoding weird data
// like that, since we explicitly hex-encode params that need it. So if
// any weird input is encountered, we should fail the request as soon as
// possible.
//
// Usage:
//
//   const SafeUrl = require('./safe-url')(log)
//
//   const url = new SafeUrl('/account/:uid/sessions', 'db.sessions')
//   url.render({ uid: 'foo' })               // returns '/account/foo/sessions'
//   url.render({ uid: 'bar' })               // returns '/account/bar/sessions'
//   url.render({ uid: 'bar' }, {foo: 'baz'}) // returns '/account/bar/sessions?foo=baz'
//   url.render({ uid: 'foo\n' })             // throws error.internalValidationError()
//   url.render({})                           // throws error.internalValidationError()
//   url.render({ uid: 'foo', id: 'bar' })    // throws error.internalValidationError()

'use strict';

const error = require('./error');
const impl = require('safe-url-assembler')();

const SAFE_URL_COMPONENT = /^[\w.]+$/;

module.exports = (log) =>
  class SafeUrl {
    constructor(path, caller) {
      const expectedKeys = path
        .split('/')
        .filter((part) => part.indexOf(':') === 0)
        .map((part) => part.substr(1));

      this._expectedKeys = {
        array: expectedKeys,
        set: new Set(expectedKeys),
      };
      this._template = impl.template(path);
      this._caller = caller;
    }

    params() {
      return this._expectedKeys.array.slice(0);
    }

    render(params = {}, query = {}) {
      const paramsKeys = Object.keys(params);
      const { array: expected, set: expectedSet } = this._expectedKeys;

      if (paramsKeys.length !== expected.length) {
        this._fail('safeUrl.params.mismatch', { keys: paramsKeys, expected });
      }

      paramsKeys.forEach((key) => {
        if (!expectedSet.has(key)) {
          this._fail('safeUrl.params.unexpected', { key, expected });
        }
        const value = params[key];
        this._checkSafe('paramVal', key, value);
      });

      Object.keys(query).forEach((key) => {
        const value = query[key];
        this._checkSafe('queryKey', key, key);
        this._checkSafe('queryVal', key, value);
      });

      return this._template.param(params).query(query).toString();
    }

    _checkSafe(location, key, value) {
      if (!value || typeof value !== 'string') {
        this._fail('safeUrl.bad', { location, key, value });
      }

      if (!SAFE_URL_COMPONENT.test(value)) {
        this._fail('safeUrl.unsafe', { location, key, value });
      }
    }

    _fail(op, data) {
      log.error(op, Object.assign({ caller: this._caller }, data));
      throw error.internalValidationError(op, data);
    }
  };
